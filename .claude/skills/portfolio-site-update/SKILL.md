---
name: portfolio-site-update
description: Use for any change to adityakarnam.com content that shows Aditya's work - the homepage "Pace and depth" chart, /ai-research (papers, experiments, upcoming work, plain-words lines), /frameworks (concept papers with Arjun Jaggi), co-authored work, private-repo experiments, Threads-style takeaways - and for shipping it live. Holds the conventions so the user does not have to repeat them.
---

# Portfolio site update

Site: Gatsby 5 + Theme UI (`/** @jsx jsx */`, `sx` arrays `[mobile, desktop]`), deployed by Cloudflare Pages from `main` of adityak74/adityakarnam.com.
Audience: executives (CEO/CTO). Show pace, depth and consistency, honestly.

## Where things live

| What | File | Notes |
|---|---|---|
| Homepage chart | `src/components/world-model/GrowthLadder.tsx` | Rendered in `HomepageConsole.tsx` as the 2nd section, right after the hero |
| Monthly GitHub contributions | `growth-data.ts` | Generated. Run `node scripts/update-growth-data.mjs` (see `update-growth-data` skill). Never hand-edit |
| Technical posts (blue dots) | `posts.ts` | Generated from `content/posts`. Personal posts are excluded via `PERSONAL` in the script |
| Call to Think essays (clay dots) | `essays.ts` | Generated from the private `call-to-think-blog` repo (local: `../call-to-think-blog`) |
| After-hours experiments (sage dashed line, diamonds) | `experiments.ts` | Shared with `/ai-research` "Behind the scenes" |
| Papers and co-authored work (rings) | `PAPERS` in `GrowthLadder.tsx` | Google Scholar papers + arjunjaggi.com items |
| Stack layers (6 tiles + rings) | `DEPTH` and `PINS` in `GrowthLadder.tsx` | Each has `proof`, `line`, `plain`, `to` |
| Research list | `src/pages/ai-research.tsx` | `upcoming` (In submission), `papers`, `publications` (Experiments and software), `lab` (from experiments.ts) |
| Concept papers, books, white papers | `src/pages/frameworks.tsx` | Grouped by theme. The homepage strip under the chart links here |
| List component | `RuledList` / `Row` in `src/components/world-model/pages-systems-stack-now/editorial.tsx` | `Row.plain` renders "In plain words" |

## Content rules (the user has asked for these; do not re-ask)

- **Plain words.** Every research item gets `plain`: one everyday-language sentence, in the user's Threads voice (short, concrete, a number if there is one, no jargon). Example: "A model half the size scored higher, because it learned when to stop thinking, not more facts." Base it only on the item's own body or post; never invent results.
- **Private repos** (only `adityak74/*`, never org repos): show the **idea**, not the name. The title is the question being explored, e.g. "An LLM that can only say no". No repo names, no links. Add to `experiments.ts` with `mo` = repo creation month (`gh repo view adityak74/<r> --json createdAt`). Skip landing pages, product sites, personal tools and empty repos.
- **Co-authored work with Arjun Jaggi** (arjunjaggi.com /papers, /books, /whitepapers): credit "with A. Jaggi", link to arjunjaggi.com. Concept papers are thought leadership: add them to `/frameworks` under a theme group **and** to `PAPERS`.
- **Dates.** Items with only a year go at the latest possible month. Leave out items whose month cannot be placed inside the chart window.
- **Upcoming research** (submitted, not public): add to `upcoming` on `/ai-research` with the tag "Preprint · arXiv, submitted" and the body "Link coming once the preprint is public." Never show submission IDs or status pages. When the link arrives, add `links` and move it to `papers`.
- **Never on the site:** billing amounts or exact private dates (e.g. the Claude start date), submission IDs, or anything the user called "just reference".
- **Chart style:** dark panel. Palette `D` = clay (pace and essays), blue (depth and posts), sage (after hours). The legend is a small HTML row under the axis, not inside the SVG. The KPI numbers sit below the chart. Every marker is interactive (hover, focus, tap) and opens a card. Mobile cards render in flow under the chart.
- Keep numbers computed from data (ratio, active months, axis end month), not typed in.

## Verify before shipping

1. `npx gatsby build > /tmp/build.log 2>&1; grep -c "success onPostBuild" /tmp/build.log` must print 1.
2. Serve `public/` (`python3 -m http.server 9125`). With Playwright (playwright-core from `~/Projects/postiz-app/node_modules`, chromium headless shell in `~/Library/Caches/ms-playwright`), check 360, 390, 430 and 1280 widths:
   - `document.documentElement.scrollWidth - innerWidth` is 0
   - tapping every `g[role=button]` opens a `[role=dialog]` that stays on screen
   - no `pageerror`
3. Take screenshots and look at them. Fix overlaps before shipping.

## Ship (only after the user says "go live", "ship", "merge" or "make it live")

```bash
git checkout -B <branch> origin/main   # always branch from fresh main
git add <files> && git commit -m "<what and why>" && git push -u origin <branch>
gh pr create --base main --title "..." --body "..."
n=$(gh pr view --json number -q .number)
sleep 30; gh pr checks $n --watch --interval 20      # wait for the Cloudflare Pages check to APPEAR and pass
gh pr checks $n | grep -q "pass" && gh pr merge $n --squash --delete-branch
# verify live (deploy takes ~2-5 min); grep for a string unique to the change:
for i in $(seq 1 40); do curl -s "https://adityakarnam.com/<page>/?cb=$RANDOM" | grep -q "<marker>" && break; sleep 15; done
```

Do not chain the merge after `| tail`: the merge would run even when no check has reported yet. Report the PR number, the merge result, and how long the change took to go live.

## Related skills

- `update-growth-data`: the weekly data refresh. It runs as a cloud scheduled task on Sundays at 15:00 UTC.
- `project-blog-post-writer`: new posts. They show up on the chart after the next data refresh.
