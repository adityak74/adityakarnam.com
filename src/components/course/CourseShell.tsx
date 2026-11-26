/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import { Page, Title, Section, TextLink, ed } from "../world-model/pages-systems-stack-now/editorial"
import { CHAPTERS, byN } from "./chapters"

const KEY = "course-done"
export const useDone = () => {
  const [done, setDone] = React.useState<string[]>([])
  React.useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(KEY) || "[]")) } catch { /* private mode */ }
  }, [])
  const toggle = (slug: string) =>
    setDone(d => {
      const next = d.includes(slug) ? d.filter(x => x !== slug) : [...d, slug]
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  return { done, toggle }
}

const mono = { fontFamily: ed.mono, fontSize: "12px", letterSpacing: ".06em", textTransform: "uppercase" as const }

/** A lesson inside a chapter: numbered label, serif title, prose children. */
export const Lesson = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <Section label={n} title={title}>
    <div sx={{ maxWidth: "68ch", "p, li": { fontSize: "17px", lineHeight: 1.7 } }}>{children}</div>
  </Section>
)

/** Frame for a visual explanation. Children should be responsive (width: 100%). */
export const Figure = ({ caption, children }: { caption: string; children: React.ReactNode }) => (
  <figure sx={{ m: 0, my: 4, p: [3, 4], bg: ed.panel, border: `1px solid ${ed.hairline}`, borderRadius: "4px", overflow: "hidden" }}>
    {children}
    <figcaption sx={{ ...mono, color: ed.secondary, mt: 3, lineHeight: 1.6 }}>{caption}</figcaption>
  </figure>
)

/** Pull-out for the one number or idea to remember. */
export const Callout = ({ label = "Remember", children }: { label?: string; children: React.ReactNode }) => (
  <aside sx={{ my: 4, pl: 3, borderLeft: `2px solid ${ed.clay}`, maxWidth: "62ch" }}>
    <div sx={{ ...mono, color: ed.clay, mb: 1 }}>{label}</div>
    <div sx={{ fontFamily: ed.serif, fontSize: "1.2rem", lineHeight: 1.45 }}>{children}</div>
  </aside>
)

/** Check yourself: question, tap to reveal the answer. */
export const Check = ({ items }: { items: { q: string; a: React.ReactNode }[] }) => (
  <Section label="Check yourself" title="Can you answer these?">
    <div sx={{ maxWidth: "68ch" }}>
      {items.map((it, i) => (
        <details key={i} sx={{ borderTop: `1px solid ${ed.hairline}`, py: 3, "&:last-of-type": { borderBottom: `1px solid ${ed.hairline}` } }}>
          <summary sx={{ cursor: "pointer", fontFamily: ed.serif, fontSize: "1.1rem", lineHeight: 1.4, listStyle: "none", "&::-webkit-details-marker": { display: "none" }, "&:hover": { color: ed.clay } }}>
            <span sx={{ ...mono, color: ed.blue, mr: 2 }}>Q{i + 1}</span>
            {it.q}
          </summary>
          <div sx={{ mt: 2, color: ed.secondary, fontSize: "16px", lineHeight: 1.7 }}>{it.a}</div>
        </details>
      ))}
    </div>
  </Section>
)

const Rail = ({ n }: { n: number }) => {
  const { done } = useDone()
  return (
    <nav aria-label="Course chapters" sx={{ display: "flex", gap: 1, mb: 4, flexWrap: "wrap" }}>
      {CHAPTERS.map(c => (
        <Link
          key={c.slug}
          to={`/course/${c.slug}/`}
          aria-current={c.n === n ? "page" : undefined}
          title={`${c.n}. ${c.layer}`}
          sx={{ ...mono, textDecoration: "none", px: 2, py: "7px", border: `1px solid ${c.n === n ? ed.clay : ed.hairline}`, borderRadius: "3px", color: c.n === n ? ed.clay : done.includes(c.slug) ? ed.blue : ed.secondary, bg: done.includes(c.slug) ? ed.panel : "transparent", ":hover": { borderColor: ed.clay } }}
        >
          {c.n} {c.layer}{done.includes(c.slug) ? " ✓" : ""}
        </Link>
      ))}
    </nav>
  )
}

/** Wraps a chapter: header, outcomes, your lessons (children), further reading, done toggle, prev/next. */
export const ChapterShell = ({ n, children }: { n: number; children: React.ReactNode }) => {
  const c = byN(n)
  const prev = CHAPTERS.find(x => x.n === n - 1)
  const next = CHAPTERS.find(x => x.n === n + 1)
  const { done, toggle } = useDone()
  const isDone = done.includes(c.slug)
  return (
    <Layout>
      <Page>
        <Rail n={n} />
        <Title eyebrow={`Chapter ${c.n} of ${CHAPTERS.length} · ${c.layer} · ${c.minutes} min`} lede={c.blurb}>
          {c.title}
        </Title>
        <Section label="You will learn" title="By the end of this chapter">
          <ul sx={{ m: 0, pl: "1.2rem", maxWidth: "68ch", li: { mb: 2, fontSize: "17px" } }}>
            {c.outcomes.map(o => <li key={o}>{o}</li>)}
          </ul>
        </Section>
        {children}
        <Section label="Go deeper" title="The original work behind this chapter">
          <ul sx={{ m: 0, pl: "1.2rem", li: { mb: 2, fontSize: "16px" } }}>
            {c.sources.map(s => <li key={s.label}><TextLink to={s.to} href={s.href}>{s.label}</TextLink></li>)}
          </ul>
        </Section>
        <div sx={{ mt: 5, display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${ed.hairline}`, pt: 4 }}>
          <button
            type="button"
            onClick={() => toggle(c.slug)}
            aria-pressed={isDone}
            sx={{ ...mono, cursor: "pointer", px: 3, py: 2, borderRadius: "4px", border: `1px solid ${isDone ? ed.blue : ed.hairline}`, bg: isDone ? ed.panel : "transparent", color: isDone ? ed.blue : ed.ink, ":hover": { borderColor: ed.clay } }}
          >
            {isDone ? "✓ Completed" : "Mark chapter complete"}
          </button>
          <div sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {prev ? <Link to={`/course/${prev.slug}/`} sx={{ ...mono, color: ed.secondary, textDecoration: "none", py: 2, ":hover": { color: ed.clay } }}>← {prev.layer}</Link> : null}
            {next ? <Link to={`/course/${next.slug}/`} sx={{ ...mono, color: ed.clay, textDecoration: "none", py: 2 }}>Next: {next.layer} →</Link> : <Link to="/course/" sx={{ ...mono, color: ed.clay, textDecoration: "none", py: 2 }}>Back to the course →</Link>}
          </div>
        </div>
      </Page>
    </Layout>
  )
}
