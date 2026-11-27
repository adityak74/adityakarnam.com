---
name: update-growth-data
description: Weekly refresh of the homepage "Pace and depth" chart data (GitHub contributions per month, technical posts, Call to Think essays) for adityakarnam.com, then PR, merge and verify live. Use when asked to update the growth chart / pace and depth data, or on the weekly schedule.
---

# Update growth data

Refreshes the data behind `src/components/world-model/GrowthLadder.tsx` and ships it.

## Steps

1. Start from a fresh main: `git fetch origin && git checkout -B chore/growth-data-$(date +%F) origin/main`.
2. Regenerate: `node scripts/update-growth-data.mjs`. It rewrites:
   - `src/components/world-model/growth-data.ts`: monthly GitHub contributions for adityak74 (via `gh api graphql`)
   - `src/components/world-model/posts.ts`: technical posts from `content/posts` (personal posts are skipped by the `PERSONAL` list in the script)
   - `src/components/world-model/essays.ts`: Call to Think essays (from `../call-to-think-blog`, or a shallow `gh repo clone` of the private repo)
3. If `git status --porcelain src/components/world-model` is empty, stop: nothing changed, report "no update this week".
4. Sanity check the diff before shipping:
   - Monthly counts for past months should not drop (GitHub can add late contributions, rarely remove). A drop of more than 10% for a closed month, or a post/essay count that shrinks, means something broke: stop and report instead of shipping.
   - A new post that is personal (birthday, travel, spiritual, coffee) should be added to `PERSONAL` in the script and the script rerun.
5. Build: `npx gatsby build` must end with `success onPostBuild`.
6. Commit `Weekly growth data update: YYYY-MM-DD`, push, `gh pr create --base main`, wait for `gh pr checks <n> --watch` (Cloudflare Pages) to pass, then `gh pr merge <n> --squash --delete-branch`.
7. Verify live: within ~5 minutes `curl -s https://adityakarnam.com/ | grep -c "Pace and depth"` returns 1. Report the new totals the script printed.

## Not covered by the script (edit `GrowthLadder.tsx` by hand)

- `DEPTH` layers and `PINS`: new AI-stack layers with a published result.
- `PAPERS`: Google Scholar papers and work co-authored with Arjun Jaggi (arjunjaggi.com/papers, /books, /whitepapers). Items with only a year go at the latest possible month.
- Never put billing amounts or exact private dates on the site.
