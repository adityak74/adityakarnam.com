# adityakarnam.com — Search Growth Plan (Aug–Dec 2026)

**Author:** Aditya Karnam
**Created:** 2026-08-11
**Data source:** Google Search Console, `sc-domain:adityakarnam.com`
**Goal as stated:** 1,000,000 impressions by end of year

---

## 1. Baseline

| Metric | Last 28d | Last 90d | YTD (Jan 1 – Aug 10) |
|---|---|---|---|
| Impressions | 1,587 | 31,130 | ~39,000 |
| Clicks | 23 | 133 | ~190 |
| CTR | 1.45% | 0.43% | 0.49% |
| Avg position | 22.0 | 20.7 | 19.7 |

Current run rate: **~55 impressions/day**. 143 days remain in 2026.

Indexed URLs: 233 (sitemap `sitemap-0.xml`, Valid, 0 errors).

---

## 2. Verdict on the 1M target

1,000,000 cumulative impressions for calendar 2026 requires **~6,720 impressions/day, every day, starting now** — 122× the current rate, sustained for five months. Organic compounding does not produce that curve from this baseline.

The only mechanism that delivers that volume on this timeline is **Google Discover**, a separate surface that can push 50–100k impressions/day at a single post. Discover is not reliably steerable and should be treated as upside, not as the plan.

### Reframed target

> **Exit 2026 at a 1M/year run rate** — approximately **2,700 impressions/day in December** — landing **~200–300k cumulative** for the calendar year.

Aggressive but achievable, and the work required is identical to what a genuine 1M attempt would need. If a Discover hit lands on top of a healthy site, the ceiling moves substantially.

### Scenario ladder

| Scenario | Dec daily rate | 2026 cumulative |
|---|---|---|
| Do nothing | ~55 | ~47k |
| Phase 1 only | ~300 | ~85k |
| Full plan executed | ~2,700 | **~250k** (1M annualized) |
| Full plan + Discover hit | 10k+ spikes | 400k – 1M+ |

---

## 3. Diagnosis

### 3.1 The site already had a 1M-pace page and lost it

`/awesome-agentic-memory/` timeline:

- **Jun 10–16** — ~380 impressions/day at **position 8.5**. Healthy.
- **Jun 17 – Jul 2** — Google expanded the query footprint to 1,000–2,000/day, but at **position 25–31**. Result: **15,350 impressions, 5 clicks — 0.03% CTR**.
- **Jul 3 onward** — collapsed to 90/day. Now **~25/day**.

Lifetime: **27,306 impressions → 33 clicks (0.12% CTR)**.

URL inspection: `PASS`, "Submitted and indexed", crawled 2026-08-01, canonical clean, robots allowed. **This is not a technical indexing failure.** Google ran a large-scale relevance test, users refused to click, and the page was demoted.

### 3.2 Root cause of the CTR collapse — confirmed in code

The theme's page template derives the meta description from the MDX excerpt:

```tsx
// node_modules/@lekoarts/gatsby-theme-minimal-blog/src/components/page.tsx
export const Head: HeadFC<MBPageProps> = ({ data: { page } }) =>
  <Seo title={page.title} description={page.excerpt} />
```

`/awesome-agentic-memory/` opens with a large styled JSX block, so `page.excerpt` resolves empty. `Seo` then silently falls back to `siteDescription`. The shipped tag is:

```html
<meta name="description" content="Aditya Karnam is a world model infrastructure
builder focused on agent runtimes, memory, retrieval, model routing, local
inference, and evaluation systems." />
```

A user searching `awesome agent memory github` sees the title `Awesome Agentic Memory | Aditya Karnam` above a **generic personal bio**. Nothing signals that the page is the curated list they asked for.

**Page frontmatter has no `description`, `keywords`, or `canonicalUrl` field at all** — the page content type does not support them.

### 3.3 Content quality drag — 90% of the corpus is autoblog output

- **186 posts total**
- **168 tagged `autoblog`** (90%)
- **18 genuinely curated posts**

The autoblog set is near-duplicate AI news commentary — `ai_bubble_quantum_ai_future`, `ai_exponential_leap_future` (three separate posts with that stem), `ai_cognitive_impact_*` (three more), and so on. GSC shows these earning **1–20 impressions each and zero clicks**.

Effects: sitewide quality dilution, severe internal cannibalization across a single undifferentiated topic, and crawl budget spent on pages that will never rank.

### 3.4 Extreme concentration

Two pages are **92% of YTD impressions**:

| Page | Impressions | Clicks | CTR | Position |
|---|---|---|---|---|
| `/awesome-agentic-memory/` | 27,306 | 33 | 0.12% | 20.3 |
| `/mlx-non-determinism-apple-silicon/` | 8,777 | 13 | 0.15% | 7.7 |

Both are decaying. There is no third pillar.

### 3.5 What actually works

| Page | Clicks | CTR | Position |
|---|---|---|---|
| `/ai-toolkit/prompt-grader/` | 112 | **18.5%** | 4.7 |
| `/` (homepage) | 38 | 9.6% | 8.3 |

The winning shape is **specific, high-intent tools and resources**. `prompt-grader` converts at 40× the site average.

### 3.6 Unclaimed keyword territory

Google already associates the domain with agent-memory topics. Hundreds of live query variants sit at **position 29–60**, earning impressions but no clicks:

`agent memory framework` · `agentic memory benchmarks` · `ai agent memory database` · `agent memory systems` · `best mem0 alternatives for multi-agent systems` · `awesome memory for agents` · `agentic workflow memory`

The association exists. The rankings are too low to monetize it.

---

## 4. The plan

### Phase 1 — Stop the bleeding (weeks 1–2)

**Objective:** halt the demotion cycle. Every impression added before CTR is fixed will be clawed back the same way.

1. **Add SEO frontmatter support to the page content type.** Shadow the page template and query so pages accept `description`, `keywords`, and `canonicalUrl`. Without this, no page-level meta fix is possible.
2. **Write intent-matching titles and descriptions** for `/awesome-agentic-memory/` and the top ~10 impression-earning pages. Target the actual query language from GSC, not brand language.
3. **Prune the autoblog corpus.** Audit all 168 `autoblog` posts against GSC signal. Keep the few with traction, consolidate salvageable clusters into evergreen pages, `noindex` or 410 the remainder. Expect a short-term impression dip followed by a domain-level quality lift.

**Success criteria:** sitewide CTR above 2%; `/awesome-agentic-memory/` CTR above 3%; indexed URL count down to roughly 60–80 high-quality pages.

### Phase 2 — Rebuild on what works (weeks 3–10)

1. Ship 3–5 additional curated resource hubs in the agent-memory / agent-infrastructure space, built to the `awesome-agentic-memory` format but written to convert from day one.
2. Push the existing position-29–60 agent-memory cluster onto page 1 with dedicated pages for high-value variants, internally linked to the hub.
3. Extend the `prompt-grader` pattern — it is the single best-converting asset on the site.

**Success criteria:** 500–1,000 impressions/day; three or more pages holding top-10 positions.

### Phase 3 — Volume (weeks 8–20)

1. Expand into adjacent proven clusters. `mlx-non-determinism` earned 8,777 impressions at position 7.7 — the Apple Silicon / local-LLM inference space is a demonstrated vein and is under-served.
2. Build topical depth around each hub so the domain earns cluster-level authority rather than single-page luck.

**Success criteria:** ~2,700 impressions/day by end of December.

### Parallel track — Discover

Deliberately publish a small number of timely, opinionated, strongly-visual takes on breaking AI news. Different content type from the evergreen hubs. Treat any hit as upside.

---

## 5. Key risks

- **Pruning dip.** Removing 168 pages will drop raw impression counts before quality gains land. Do not reverse course during the dip.
- **Single-page dependency.** Until Phase 2 ships, the site is one algorithm update away from near-zero traffic.
- **CTR is the gate.** Rankings gained without a CTR fix will decay on the same cycle already observed in June–July.

---

## 6. Measurement

Track weekly in GSC:

- Impressions/day (7-day rolling)
- Sitewide CTR — the leading indicator
- Average position for the agent-memory query cluster
- Count of pages earning 10+ impressions/day — the diversification metric
- Indexed URL count — should fall in Phase 1, then rise with quality pages
