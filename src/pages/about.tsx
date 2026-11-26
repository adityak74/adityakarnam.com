/** @jsx jsx */
import * as React from "react"
import { HeadFC } from "gatsby"
import { jsx } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { Page, Title, Section, Prose, TextLink } from "../components/world-model/pages-systems-stack-now/editorial"
import { openSourceImpact } from "../components/world-model/impact"

const AboutPage = () => (
  <Layout>
    <Page>
      <Title eyebrow="About">Aditya Karnam</Title>

      <Section>
        <Prose>
          <p>
            I am an AI research engineer. I build the infrastructure layer for reliable agents:
            memory, retrieval, model routing, local inference, and the evaluation that tells you whether any of it
            works.
          </p>
          <p>
            I came to this from systems and research. My master's thesis at the University of Missouri-St. Louis was
            a genetic algorithm for community detection (ERBGA), which I applied to Alzheimer's disease gene networks. Since then I have published on small-model
            fine-tuning for medicine (MEDFIT-LLM, 2025) and on memory evaluation under a fixed token budget
            (BudgetBench, 2026).
          </p>
        </Prose>
      </Section>

      <Section label="Work" title="What I work on">
        <Prose>
          <p>
            Three threads. <strong>Memory and retrieval:</strong> embenx puts one API over 15+ vector backends and
            adds temporal memory and an MCP server. BudgetBench asks how memory strategies compare when the input
            budget is the constraint.
          </p>
          <p>
            <strong>Local inference:</strong> I measure what serving stacks do on Apple Silicon, including where
            decode slows at long context, where batching stops helping, and why identical inputs give different
            outputs. I also distilled Ornith-1.5-9B to a 4.9 GB build that beats the 8.9 GB release it replaces.
          </p>
          <p>
            <strong>Harnesses and runtimes:</strong> Quecto is a small Rust coding agent built to be evaluated.
            subagent-fleet routes coding-agent roles across local machines. The write-up of what I learned is{` `}
            <TextLink to="/ai-research/what-is-an-ai-agent-harness/">What is an AI agent harness</TextLink>.
          </p>
        </Prose>
      </Section>

      <Section label="Method" title="How I work">
        <Prose>
          <p>
            I start from a failure I can reproduce and write down the number before I change anything. If a result
            is null, or I find a bug in my own measurements, it goes in the write-up. The BudgetBench post includes
            both.
          </p>
          <p>
            I prefer small systems whose state is visible: traces, tool calls and eval results that someone else can
            inspect. I run things locally first because cost, privacy and iteration speed are easier to control.
          </p>
        </Prose>
      </Section>

      <Section label="Open source" title="Outside my own repositories">
        <Prose>
          <p>
            {openSourceImpact.featuredProject.name} is an MCP server for scholarly retrieval, with{` `}
            {openSourceImpact.featuredProject.metrics.join(", ")}. I contributed a fix to mlx-lm (
            <TextLink href="https://github.com/ml-explore/mlx-lm/pull/1795">PR #1795</TextLink>), and have merged work
            in {openSourceImpact.upstreamProjects.slice(1).join(", ")}.{` `}
            <span sx={{ color: `#5E5D59`, fontSize: `15px` }}>({openSourceImpact.snapshotLabel}.)</span>
          </p>
          <p>
            More on <TextLink to="/ai-research/">the research page</TextLink>,{` `}
            <TextLink to="/systems/">systems</TextLink> and <TextLink to="/stack/">the stack</TextLink>.
          </p>
        </Prose>
      </Section>

      <Section label="Contact" title="Get in touch">
        <Prose>
          <p>
            The best way to reach me is{` `}
            <TextLink href="https://www.linkedin.com/in/adityakarnamgrao/">LinkedIn</TextLink> or{` `}
            <TextLink href="https://twitter.com/aditya_karnam">Twitter</TextLink>. Code is on{` `}
            <TextLink href="https://github.com/adityak74">GitHub</TextLink>, papers on{` `}
            <TextLink href="https://scholar.google.com/citations?user=WujCeDkAAAAJ&hl=en">Google Scholar</TextLink>,
            and my <TextLink href="/resume.pdf">resume</TextLink> is a PDF.
          </p>
        </Prose>
      </Section>
    </Page>
  </Layout>
)

export default AboutPage

export const Head: HeadFC = () => (
  <Seo
    title="About"
    description="Aditya Karnam is an AI research engineer building the infrastructure layer for agents: memory, retrieval, routing, local inference, and evaluation systems."
    pathname="/about/"
  />
)
