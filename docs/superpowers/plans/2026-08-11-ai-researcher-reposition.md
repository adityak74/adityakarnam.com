# AI Researcher Repositioning + Density Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition adityakarnam.com's personal brand from "World Model Infrastructure Builder/Lab" to "AI Researcher," and fix the homepage's excessive whitespace/density so it reads closer to the reference site (arjunjaggi.com) — a light, dense, editorial layout with a serif display headline, tiny tracked mono labels, and alternating dark emphasis blocks.

**Architecture:** This is a Gatsby + theme-ui static site. Positioning changes are copy edits in `data.ts`, `gatsby-config.ts`, `header.tsx`, `footer.tsx`. Density changes are (a) one global `space` scale override in the shared theme file that shrinks the oversized top-end spacing values used sitewide via array-index sx props (e.g. `mb: [6, 7]` currently resolves to 128px/256px), and (b) component-level edits in `HomepageConsole.tsx` replacing large rounded white cards with tighter bordered rows and adding dark full-bleed sections. No new pages, no routing changes, no test framework exists for this site — verification is a dev-server visual check with Playwright plus a production build check.

**Tech Stack:** Gatsby, TypeScript/TSX, theme-ui (`sx` prop), Google Fonts (Fraunces — already loaded but unused), Playwright MCP for visual verification.

## Global Constraints

- Do not modify content/wording of individual blog posts, the `/awesome-agentic-memory/` page, or any MLX post — these are the site's only proven SEO assets (`docs/seo-growth-plan-2026.md`).
- Do not change any URL/slug.
- `siteDescription` (sitewide meta fallback) must retain the technical noun list: "agent runtimes, memory, retrieval, model routing, local inference, evaluation systems" — only the framing around it changes from "world model infrastructure builder" to an AI-researcher framing.
- No new Google Font network requests — Fraunces is already loaded in `gatsby-ssr.tsx:37` (`family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600`) but never wired into the theme; use it for the serif display headline instead of adding Newsreader.
- Reuse the existing JetBrains Mono (also already loaded) for section eyebrow labels — no new mono font.
- Every "world model" / "world-model" string in the identity/branding surfaces listed in Task 2-4 must be replaced; do not leave stray references.

---

### Task 1: Theme tokens — space scale, dark emphasis colors, serif font

**Files:**
- Modify: `src/gatsby-plugin-theme-ui/index.ts`

**Interfaces:**
- Produces: `theme.space` array (9 entries, same length as before: `[0, "0.25rem", "0.5rem", "1rem", "2rem", "3rem", "4.5rem", "7rem", "32rem"]`), new colors `emphasisBg` (`#1B1914`) and `emphasisText` (`#EDE8DD`) available at both `colors.emphasisBg`/`colors.emphasisText` and under `colors.modes.dark`, new `fonts.serif` (`"Fraunces, Georgia, serif"`).
- Consumes: nothing new — this is the base theme file.

The current `@theme-ui/preset-tailwind` space scale is `[0, "0.25rem", "0.5rem", "1rem", "2rem", "4rem", "8rem", "16rem", "32rem"]` (indices 0-8 = 0, 4px, 8px, 16px, 32px, 64px, 128px, 256px, 512px). Indices 5-7 are used throughout `HomepageConsole.tsx` for section margins/padding (e.g. `mb: [6, 7]` = 128px mobile / 256px desktop), which is the direct cause of the oversized gaps. This task compresses indices 5-7 only; indices 0-4 and 8 are untouched so nothing that depends on small spacing breaks.

- [ ] **Step 1: Add the `space` override**

In `src/gatsby-plugin-theme-ui/index.ts`, inside the `merge(tailwind, { ... })` object (after the `config` block, before `colors`), add:

```ts
  space: [
    "0",
    "0.25rem",
    "0.5rem",
    "1rem",
    "2rem",
    "3rem",
    "4.5rem",
    "7rem",
    "32rem",
  ],
```

- [ ] **Step 2: Add `emphasisBg` / `emphasisText` color tokens**

In the same file, inside `colors: { ... }` (both the top-level block and the `modes.dark` block, since this theme keeps light/dark values identical — see existing pattern at lines 10-36), add:

```ts
    emphasisBg: `#1B1914`,
    emphasisText: `#EDE8DD`,
```

Add this line to both the outer `colors` object and the `colors.modes.dark` object, matching the existing pattern where every other token (`text`, `background`, `primary`, etc.) is duplicated in both places.

- [ ] **Step 3: Add the serif font token**

In the same file, inside `fonts: { ... }` (currently `body`, `heading`, `monospace`), add:

```ts
    serif: `Fraunces, Georgia, serif`,
```

- [ ] **Step 4: Verify the theme file still parses**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "theme-ui" || echo "no theme-ui errors"`
Expected: `no theme-ui errors` (TypeScript may report unrelated pre-existing errors elsewhere in the project — only check there are none introduced in `gatsby-plugin-theme-ui/index.ts`).

- [ ] **Step 5: Commit**

```bash
git add src/gatsby-plugin-theme-ui/index.ts
git commit -m "Tighten theme space scale, add emphasis dark tokens and serif font"
```

---

### Task 2: Positioning copy — `siteIdentity` and stack data

**Files:**
- Modify: `src/components/world-model/data.ts:34-42` (`siteIdentity`), `src/components/world-model/data.ts:53-94` (`worldModelStack` — layer 1 name/description only), `src/components/world-model/data.ts:463-482` (`lensOptions` fallback text for `"AI Researcher"` — already researcher-framed but references "world-model agents", tighten wording)

**Interfaces:**
- Produces: `siteIdentity.title = "AI Researcher"`, `siteIdentity.labName` (new short eyebrow string, no "World Model"), `siteIdentity.tagline`, `siteIdentity.supportingLine`, `siteIdentity.subtitle` all reworded without "world model" / "world-model-driven" phrasing but retaining the technical noun list (memory, retrieval, routing, local inference, evals). Object shape (`name`, `title`, `labName`, `tagline`, `supportingLine`, `subtitle`, `loop`) is unchanged — only string values change, so no consumer (`HomepageConsole.tsx`, `header.tsx`) needs a prop/type update.
- Consumes: nothing — this is data only.

- [ ] **Step 1: Rewrite `siteIdentity`**

Replace `src/components/world-model/data.ts:34-42`:

```ts
export const siteIdentity = {
  name: "Aditya Karnam",
  title: "AI Researcher",
  labName: "AI Research Notes",
  tagline: "Researching the infrastructure behind reliable AI agents.",
  supportingLine: "Studying how agents remember, retrieve, route, and act — and building the systems that let them do it reliably.",
  subtitle: "Agents · Memory · Retrieval · Simulation · Local Inference · Evals",
  loop: ["Observe", "Model", "Simulate", "Act", "Evaluate", "Update"],
}
```

- [ ] **Step 2: Reword the first stack layer away from "World-Model Applications"**

In `src/components/world-model/data.ts`, the `worldModelStack` array's first entry (currently `name: "World-Model Applications"`, around line 55) — replace:

```ts
  {
    name: "Applied Systems",
    description: "Interfaces where persistent, stateful AI systems surface to users and operators.",
    relevantWork: ["Applied agent workflows", "AI Toolkit utilities", "Research notes"],
  },
```

- [ ] **Step 3: Tighten the `"AI Researcher"` lens fallback**

In `lensFallbacks` (around line 471-473), replace the `"AI Researcher"` entry's value:

```ts
  "AI Researcher":
    "Aditya's work sits in the infrastructure layer around AI agents: memory, retrieval, model routing, local inference, and tool orchestration. The strongest research signal is the push from prompt chains toward inspectable, stateful systems.",
```

- [ ] **Step 4: Grep to confirm no stray "world model" / "world-model" strings remain in `data.ts` outside of intentionally-kept technical content**

Run: `grep -in "world.model" src/components/world-model/data.ts`
Expected output: only matches inside `worldModelStack` (the export/type name itself, which Task 5 does not rename — renaming the exported identifier is out of scope and would require updating every import site for no user-visible benefit) and inside individual `systems[].explanationModes` project descriptions that reference "world-model-driven agents" as accurate technical description of those projects' research framing, not personal branding. If any hero/identity/label string still contains "world model", fix it before proceeding.

- [ ] **Step 5: Commit**

```bash
git add src/components/world-model/data.ts
git commit -m "Reposition identity copy from world-model framing to AI researcher"
```

---

### Task 3: Site metadata — `gatsby-config.ts`

**Files:**
- Modify: `gatsby-config.ts:11-16` (`siteMetadata`), `gatsby-config.ts:108-110` (manifest `name`/`description`)

**Interfaces:**
- Produces: updated string values only, no shape change.
- Consumes: nothing.

- [ ] **Step 1: Update `siteMetadata`**

Replace `gatsby-config.ts:11-16`:

```ts
    siteTitle: `Aditya Karnam`,
    siteTitleAlt: `Aditya Karnam — AI Researcher`,
    siteHeadline: `Aditya Karnam is an AI researcher building the infrastructure layer around agents: memory, retrieval, model routing, local inference, agent runtimes, and evals.`,
    siteUrl: `https://adityakarnam.com`,
    siteDescription: `Aditya Karnam is an AI researcher focused on agent runtimes, memory, retrieval, model routing, local inference, and evaluation systems.`,
```

Note this keeps every technical noun from the original `siteDescription` (agent runtimes, memory, retrieval, model routing, local inference, evaluation systems) per the Global Constraints — only "world model infrastructure builder" becomes "AI researcher."

- [ ] **Step 2: Update the manifest plugin options**

Replace `gatsby-config.ts:108-110`:

```ts
        name: `Aditya Karnam - AI Researcher`,
        short_name: `adityakarnam`,
        description: `AI research and infrastructure: agent runtimes, memory, retrieval, routing, and evaluation systems by Aditya Karnam.`,
```

- [ ] **Step 3: Confirm the JSON-LD in `gatsby-ssr.tsx` already matches**

Run: `grep -n "jobTitle\|World Model" gatsby-ssr.tsx`
Expected: `jobTitle: "Software Engineer & AI Researcher"` and no "World Model" match — the JSON-LD person/website schema (lines 61-63, 85 of `gatsby-ssr.tsx`) is already AI-researcher-framed from a prior pass and needs no change. If this grep unexpectedly shows a "World Model" match, stop and report it — that would mean the file changed since this plan was written.

- [ ] **Step 4: Commit**

```bash
git add gatsby-config.ts
git commit -m "Update site metadata to AI researcher positioning"
```

---

### Task 4: Header and footer copy

**Files:**
- Modify: `src/@lekoarts/gatsby-theme-minimal-blog/components/header.tsx:31`, `src/@lekoarts/gatsby-theme-minimal-blog/components/footer.tsx:27`

**Interfaces:**
- Produces: updated JSX text nodes only, no prop/structural change.
- Consumes: nothing.

- [ ] **Step 1: Update the header subtitle line**

Replace `src/@lekoarts/gatsby-theme-minimal-blog/components/header.tsx:31`:

```tsx
            AI researcher building the infrastructure layer for reliable agents.
```

- [ ] **Step 2: Update the footer line**

Replace `src/@lekoarts/gatsby-theme-minimal-blog/components/footer.tsx:27`:

```tsx
      <div>&copy; {new Date().getFullYear()} Aditya Karnam. AI Researcher.</div>
```

- [ ] **Step 3: Grep to confirm no other "World Model" strings remain in shadowed theme components**

Run: `grep -rn "World Model\|world-model-driven" src/@lekoarts/`
Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add src/@lekoarts/gatsby-theme-minimal-blog/components/header.tsx src/@lekoarts/gatsby-theme-minimal-blog/components/footer.tsx
git commit -m "Update header and footer copy to AI researcher positioning"
```

---

### Task 5: Homepage density — hero, cards, dark emphasis section, serif headline

**Files:**
- Modify: `src/components/world-model/HomepageConsole.tsx`

**Interfaces:**
- Consumes: `theme.space` (Task 1), `colors.emphasisBg`/`emphasisText` (Task 1), `fonts.serif` (Task 1), `siteIdentity`/`worldModelStack` (Task 2).
- Produces: no exported interface change — `HomepageConsole` remains a zero-prop default export consumed by `src/pages/index.tsx` (or wherever it's mounted) unchanged.

This task edits `cardStyles`, `sectionLabelStyles`, the hero block, and the "World Model Infrastructure Stack" block in place. Line numbers below refer to the file as read at plan-writing time; re-verify with a quick read before editing since Tasks 1-4 don't touch this file.

- [ ] **Step 1: Shrink `sectionLabelStyles` and update `cardStyles`**

Replace lines 17-33:

```tsx
const cardStyles = {
  border: "1px solid",
  borderColor: "divide",
  borderRadius: "10px",
  background: "#FFFFFF",
}

const sectionLabelStyles = {
  display: "inline-block",
  color: "secondary",
  fontFamily: "monospace",
  fontSize: "11px",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  mb: 2,
}
```

This drops the box-shadow (heavier visual weight than the reference uses), shrinks the label from theme `fontSize: 0` (14px) to a literal `11px` matching the reference's tiny tracked labels, and switches the label color from the loud `primary` accent to the muted `secondary` tone (the reference uses a muted gray-brown for eyebrow labels, reserving the accent color for interactive elements).

- [ ] **Step 2: Shrink hero padding and switch the `h1` to the serif font**

In the hero `Box` (originally lines 38-51), change `px: [4, 5, 6], py: [5, 6, 7], mb: [6, 7]` to `px: [4, 5, 5], py: [5, 5, 6], mb: [5, 6]`.

In the `Heading as="h1"` block (originally lines 56-67), add `fontFamily: "serif"` to its `sx` object and reduce `mb: 3` to `mb: 2`:

```tsx
            <Heading
              as="h1"
              sx={{
                fontFamily: "serif",
                fontSize: ["2.75rem", "3.75rem", "4.6rem"],
                lineHeight: 1.04,
                mb: 2,
                maxWidth: "11ch",
                fontWeight: 500,
              }}
            >
              {siteIdentity.tagline}
            </Heading>
```

- [ ] **Step 3: Reduce paragraph bottom margins in the hero from `mb: 3`/`mb: 4` to `mb: 2`/`mb: 3` respectively**

The two `Text` elements directly under the `h1` (the "I work on..." and "The future of AI..." paragraphs) currently use `mb: 3` and `mb: 4`. Change both to `mb: 2` and `mb: 3` respectively — same relative rhythm, smaller absolute gap now that the space scale (Task 1) already shrank the higher indices; this extra trim targets the specific hero paragraphs which sit in the still-large `space[3]`/`space[4]` range.

- [ ] **Step 4: Convert the "World Model Infrastructure Stack" block into a dark full-bleed emphasis section**

Find the `Box` wrapping the stack list (originally starting `<Box sx={{ ...cardStyles, p: [4, 5] }}>` right before `<Text sx={sectionLabelStyles}>The World Model Infrastructure Stack</Text>`). Replace that `Box`'s `sx` and the heading text and the stack layer text colors so the whole block renders as a dark panel:

```tsx
        <Box sx={{ bg: "emphasisBg", color: "emphasisText", borderRadius: "10px", p: [4, 5] }}>
          <Text sx={{ ...sectionLabelStyles, color: "#B8B2A0" }}>The Systems Layer</Text>
          <Text sx={{ color: "#B8B2A0", lineHeight: 1.65, mb: 3, fontSize: "17px" }}>
            AI agents need more than a foundation model. They need infrastructure for state, memory, retrieval,
            simulation, tool use, model routing, and evaluation. My research explores that connective tissue
            between models and reliable action.
          </Text>
          <Grid columns={1} gap={3}>
            {worldModelStack.map((layer, index) => (
              <Box
                key={layer.name}
                sx={{
                  borderTop: "1px solid",
                  borderColor: "rgba(237,232,221,0.16)",
                  pt: 3,
                }}
              >
                <Text sx={{ color: "primary", fontFamily: "monospace", fontSize: "11px", mb: 1 }}>
                  Layer 0{index + 1}
                </Text>
                <Heading as="h3" sx={{ fontSize: ["1.35rem", "1.55rem"], mb: 2, fontWeight: 500, color: "emphasisText" }}>
                  {layer.name}
                </Heading>
                <Text sx={{ color: "#B8B2A0", lineHeight: 1.65, mb: 2, fontSize: "17px" }}>{layer.description}</Text>
                <Text sx={{ color: "#B8B2A0", fontSize: "14px" }}>Relevant work: {layer.relevantWork.join(" · ")}</Text>
              </Box>
            ))}
          </Grid>
        </Box>
```

Reduce the surrounding `Grid`'s `mb: [6, 7]` (the grid that holds this block and "Research Agenda" side by side) to `mb: [5, 6]`.

- [ ] **Step 5: Trim remaining oversized `mb: [6, 7]` occurrences to `mb: [5, 6]`**

Run: `grep -n 'mb: \[6, 7\]' src/components/world-model/HomepageConsole.tsx`

For each remaining match (the "Current Systems" card, the eval showcase card, the Field Notes / Operating Principles grid — Step 4 already handled the stack grid), change `mb: [6, 7]` to `mb: [5, 6]`.

- [ ] **Step 6: Add an "AI Research" link into the hero CTA row**

In the `Flex` containing the "Explore Current Systems" link (originally lines 77-97), add a second link after it:

```tsx
              <Link
                to="/ai-research/"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "text",
                  border: "1px solid",
                  borderColor: "divide",
                  px: 3,
                  py: 2,
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 500,
                  ":hover": {
                    borderColor: "primary",
                    color: "primary",
                  },
                }}
              >
                Published Research
              </Link>
```

- [ ] **Step 7: Update the "Current Systems" section copy to drop "world-model" framing**

The `Text` under the "Current Systems" label (originally "Projects are framed here as research artifacts: each one explores a concrete question in the world-model stack...") — replace with:

```tsx
              Projects are framed here as research artifacts: each one explores a concrete question in the systems
              layer around AI agents.
```

- [ ] **Step 8: Update the "Open Research Channel" copy** (originally "Current threads I am actively pushing forward across the world-model stack.")

```tsx
              Current threads I am actively pushing forward in agent infrastructure research.
```

- [ ] **Step 9: Start the dev server and visually verify**

Run: `npx gatsby develop &` then wait for `You can now view` in the output (or poll `curl -sf http://localhost:8000/ > /dev/null`).

Using Playwright: navigate to `http://localhost:8000/`, take a full-page screenshot at 1440px width, and confirm:
- The hero headline renders in the serif font (visually distinct strokes vs. the sans body text).
- The "Systems Layer" block has a dark background with light text.
- Total homepage screenshot height is visibly shorter than the pre-change baseline (`current-adityakarnam-full.png` in the repo root, captured before this plan).
- No layout overflow or broken grid at 1440px and at 375px (mobile).

- [ ] **Step 10: Stop the dev server**

Run: `kill %1` (or find and kill the `gatsby develop` process).

- [ ] **Step 11: Commit**

```bash
git add src/components/world-model/HomepageConsole.tsx
git commit -m "Tighten homepage density and add dark emphasis section for systems stack"
```

---

### Task 6: Site-wide build and regression check

**Files:** none modified — verification only.

**Interfaces:** none.

- [ ] **Step 1: Run a production build**

Run: `npx gatsby build`
Expected: build completes with exit code 0, no new errors. (The site has a known unrelated MDX/GraphQL warning surface from autoblog content per prior sessions — only fail on errors introduced by this plan's changes, i.e. anything referencing `HomepageConsole.tsx`, `data.ts`, `gatsby-config.ts`, `header.tsx`, `footer.tsx`, or `gatsby-plugin-theme-ui/index.ts`.)

- [ ] **Step 2: Serve the production build locally and screenshot key pages**

Run: `npx gatsby serve &`, wait for it to be up on `http://localhost:9000/`.

Using Playwright, capture full-page screenshots at 1440px and 375px for `/`, `/about/`, `/field-notes/`, `/stack/` and visually confirm:
- No "World Model" / "world-model-driven" text visible anywhere in the header, footer, or homepage hero.
- Spacing reads visibly tighter than the pre-change baseline screenshots (`current-adityakarnam-full.png`, `about-desktop-spacing.png`, `field-notes-desktop-current.png` in the repo root).
- No broken layout, no overlapping text, no horizontal scrollbar at 375px on any of the four pages.

- [ ] **Step 3: Stop the server**

Run: `kill %1` (or find and kill the `gatsby serve` process).

- [ ] **Step 4: Final grep sweep for stray branding**

Run: `grep -rin "world.model" src gatsby-config.ts gatsby-ssr.tsx --include="*.tsx" --include="*.ts" | grep -vi "worldModelStack\|explanationModes"`

Expected: no output. (The `worldModelStack` type/export name and individual project `explanationModes` copy — which accurately describes those projects' technical framing, not personal branding — are the only allowed exceptions per Task 2 Step 4.)

- [ ] **Step 5: Report a before/after summary**

Note the homepage full-page screenshot height before (from `current-adityakarnam-full.png`, captured earlier in this session) vs. after (from Task 5 Step 9), and confirm the ratio has moved meaningfully closer to the reference site's density (reference full-page height was roughly half the original homepage height for comparable content).
