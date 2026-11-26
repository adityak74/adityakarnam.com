import * as React from "react"
import type { HeadFC } from "gatsby"
import { Link } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { Page, Title, Section, Prose, RuledList, Explore, ed } from "../../components/world-model/pages-systems-stack-now/editorial"
import { CHAPTERS } from "../../components/course/chapters"
import { useDone } from "../../components/course/CourseShell"
import Roadmap from "../../components/course/visuals/Index_Roadmap"

const total = CHAPTERS.reduce((s, c) => s + c.minutes, 0)
const mono = { fontFamily: ed.mono, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase" as const }

const CoursePage = () => {
  const { done } = useDone()
  const count = CHAPTERS.filter(c => done.includes(c.slug)).length
  const next = CHAPTERS.find(c => !done.includes(c.slug))
  const started = count > 0 && next
  const cta = started ? `Continue: chapter ${next.n}, ${next.layer}` : "Start chapter 1"
  const to = started ? `/course/${next.slug}/` : "/course/silicon/"
  return (
    <Layout>
      <Page>
        <Title
          eyebrow="Free course"
          lede="For engineers and curious people who are comfortable with basic programming. Seven chapters take you from the chip to running agents across several machines, built from my own measured work. It is free and needs no signup."
        >
          Learn AI from silicon to software factories
        </Title>
        <div style={{ marginBottom: 48 }}>
          <Link to={to} style={{ ...mono, display: "inline-block", padding: "14px 20px", background: ed.ink, color: ed.paper, borderRadius: 4, textDecoration: "none" }}>{cta} →</Link>
          <span style={{ ...mono, color: ed.secondary, marginLeft: 16 }}>{count} of {CHAPTERS.length} complete · about {total} min in total</span>
        </div>

        <Section label="The roadmap" title="Seven layers, built from the bottom up">
          <Roadmap />
        </Section>

        <Section label="How to use this course" title="Read in order, play with the pictures">
          <ul style={{ margin: 0, paddingLeft: "1.2rem", maxWidth: "68ch", fontSize: 17, lineHeight: 1.7 }}>
            <li>Read the chapters in order. Each one builds on the layer below it.</li>
            <li>Every chapter has visuals you can click and drag. Play with them before reading the caption.</li>
            <li>Each chapter ends with check-yourself questions. Tap a question to see the answer.</li>
            <li>The "mark complete" button saves your progress in this browser only. Nothing is sent anywhere.</li>
            <li>Every chapter links to the original posts and code it comes from.</li>
          </ul>
        </Section>

        <Section label="Chapters" title="What is inside">
          <RuledList
            rows={CHAPTERS.map(c => ({
              key: c.slug,
              meta: `${c.n} · ${c.minutes} min${done.includes(c.slug) ? " · done" : ""}`,
              tag: c.layer,
              title: c.title,
              body: c.blurb,
              links: [{ label: `Open chapter ${c.n}`, to: `/course/${c.slug}/` }],
            }))}
          />
        </Section>

        <Section label="What you need" title="A laptop and curiosity">
          <Prose>
            <p>
              Nothing to install to read the course. The experiments behind it ran on Apple Silicon Macs, which is why the examples mention them, but nothing here requires one.
            </p>
          </Prose>
        </Section>

        <Section label="About this course" title="Where the numbers come from">
          <Prose>
            <p>
              Every number in this course comes from my own published posts, and each chapter links to the posts it draws on. They are measurements from specific machines and workloads, so treat them as examples of how to measure, not as universal rankings. Where a result was a miss or a null, the course says so.
            </p>
          </Prose>
        </Section>

        <Explore keys={["research", "live", "about"]} />
      </Page>
    </Layout>
  )
}
export default CoursePage

export const Head: HeadFC = () => (
  <Seo
    title="Free Course: Learn AI From Silicon to Software Factories"
    description="A free seven-chapter course that teaches AI from the chip to agent factories, with measured experiments, interactive visuals and quiz questions. No signup."
    pathname="/course/"
  />
)
