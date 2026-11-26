import * as React from "react"

const C = { ink: "#141413", secondary: "#5E5D59", hairline: "#E3E0D8", panel: "#F3F1EB", clay: "#C2522D", blue: "#2F5D8C" }
const MONO = "'JetBrains Mono', monospace"
const SERIF = "'Fraunces', serif"

type Result = { id: string; title: string; authors: string; year: string; summary: string; url: string }
type Sort = "relevance" | "date"
type Status = "idle" | "loading" | "error" | "done"

const EXAMPLES = ["agent memory evaluation", "speculative decoding", "community detection genetic algorithm"]

const clean = (s: string | null | undefined) => (s || "").replace(/\s+/g, " ").trim()

// OpenAlex (open scholarly index, CORS enabled; includes arXiv preprints). arXiv's own API sends no CORS headers.
const rebuild = (inv: Record<string, number[]> | null): string => {
  if (!inv) return ""
  const words: string[] = []
  Object.entries(inv).forEach(([w, pos]) => pos.forEach(i => { words[i] = w }))
  return clean(words.join(" "))
}

const parse = (json: any): Result[] =>
  (json.results || []).map((w: any) => {
    const names: string[] = (w.authorships || []).map((a: any) => a.author?.display_name).filter(Boolean)
    const summary = rebuild(w.abstract_inverted_index)
    const doi = w.doi ? String(w.doi).replace(/^https?:\/\/doi\.org\//, "") : ""
    const arx = /arxiv\.(\d+\.\d+)/i.exec(doi)
    return {
      id: arx ? "arXiv:" + arx[1] : doi || String(w.id).replace(/^.*\//, ""),
      title: clean(w.title),
      authors: names.slice(0, 3).join(", ") + (names.length > 3 ? " et al." : ""),
      year: String(w.publication_year || ""),
      summary: summary.length > 220 ? summary.slice(0, 220).replace(/\s+\S*$/, "") + "..." : summary,
      url: w.doi || w.primary_location?.landing_page_url || w.id,
    }
  })

const btn: React.CSSProperties = {
  fontFamily: MONO, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: C.ink,
  background: "transparent", border: `1px solid ${C.hairline}`, borderRadius: 4, padding: "9px 14px", cursor: "pointer",
}

const Btn = ({ active, style, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) => {
  const [hover, setHover] = React.useState(false)
  return (
    <button
      {...p}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...btn, ...(active ? { background: C.panel } : null), borderColor: hover || active ? C.clay : C.hairline, ...style }}
    />
  )
}

const ArxivSearch = () => {
  const [q, setQ] = React.useState("")
  const [sort, setSort] = React.useState<Sort>("relevance")
  const [status, setStatus] = React.useState<Status>("idle")
  const [results, setResults] = React.useState<Result[]>([])
  const [shown, setShown] = React.useState("")
  const ctrl = React.useRef<AbortController | null>(null)

  React.useEffect(() => () => ctrl.current?.abort(), [])

  const run = async (query: string, s: Sort) => {
    const text = query.trim()
    if (!text) return
    ctrl.current?.abort()
    const ac = new AbortController()
    ctrl.current = ac
    setStatus("loading")
    setShown(text)
    const order = s === "date" ? "&sort=publication_date:desc" : ""
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(text)}&per-page=8&select=id,title,publication_year,authorships,doi,abstract_inverted_index,primary_location${order}`
    try {
      const res = await fetch(url, { signal: ac.signal })
      if (!res.ok) throw new Error(String(res.status))
      setResults(parse(await res.json()))
      setStatus("done")
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      setStatus("error")
    }
  }

  const pick = (s: Sort) => {
    setSort(s)
    if (status !== "idle") run(q || shown, s)
  }

  const note: React.CSSProperties = { fontFamily: MONO, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: C.secondary }

  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault()
          run(q, sort)
        }}
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        <label htmlFor="arxiv-q" style={{ ...note, flexBasis: "100%" }}>
          Search query
        </label>
        <input
          id="arxiv-q"
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="e.g. retrieval augmented generation"
          style={{ flex: "1 1 240px", font: "17px Inter, sans-serif", color: C.ink, background: "#FAF9F6", border: `1px solid ${C.hairline}`, borderRadius: 4, padding: "8px 12px" }}
        />
        <Btn type="submit">Search</Btn>
      </form>

      <div role="group" aria-label="Sort order" style={{ display: "flex", gap: 8, margin: "12px 0 0" }}>
        <Btn type="button" active={sort === "relevance"} aria-pressed={sort === "relevance"} onClick={() => pick("relevance")}>Relevance</Btn>
        <Btn type="button" active={sort === "date"} aria-pressed={sort === "date"} onClick={() => pick("date")}>Newest</Btn>
      </div>

      <div aria-live="polite" style={{ marginTop: 20 }}>
        {status === "idle" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={note}>Try</span>
            {EXAMPLES.map(x => (
              <Btn key={x} type="button" onClick={() => { setQ(x); run(x, sort) }}>{x}</Btn>
            ))}
          </div>
        )}
        {status === "loading" && <p style={{ ...note, margin: 0 }}>Searching the literature...</p>}
        {status === "error" && (
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6 }}>
            Could not reach the search index just now. Try again in a moment, or{" "}
            <a href={`https://arxiv.org/search/?query=${encodeURIComponent(shown)}&searchtype=all`} style={{ color: C.clay }}>search on arxiv.org</a>.
          </p>
        )}
        {status === "done" && results.length === 0 && (
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: C.secondary }}>No papers matched "{shown}". Try fewer or broader terms.</p>
        )}
        {status === "done" && results.length > 0 && (
          <>
            <p style={{ ...note, margin: "0 0 8px" }}>{results.length} results for "{shown}"</p>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, borderTop: `1px solid ${C.hairline}` }}>
              {results.map(r => (
                <li key={r.id} style={{ padding: "16px 0", borderBottom: `1px solid ${C.hairline}` }}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.3, color: C.ink, textDecoration: "none", borderBottom: `1px solid ${C.hairline}` }}>
                    {r.title}
                  </a>
                  <div style={{ ...note, margin: "6px 0", color: C.blue }}>{r.authors} · {r.year} · {r.id}</div>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: C.secondary }}>{r.summary}</p>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  )
}

export default ArxivSearch
