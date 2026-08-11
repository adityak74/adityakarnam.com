import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import {
  ConsoleList,
  Divider,
  Panel,
  WorldModelHero,
  WorldModelPageShell,
  WorldModelSection,
  labPalette,
} from "../components/world-model/pages-systems-stack-now/WorldModelPageChrome"

const stackLayers = [
  {
    layer: "Applied systems",
    note: "Applications that need durable context, tool use, and long-horizon behavior instead of a single prompt-response loop.",
    work: "The public expression here is still emerging, but the supporting layers below are already visible in the codebase.",
  },
  {
    layer: "Agent runtime",
    note: "Role-aware execution, topology, health, and operational control for agent work.",
    work: "subagent-fleet provides the cleanest example: one fleet topology generating routes, agent definitions, warmup flows, and dashboard state.",
  },
  {
    layer: "State + memory layer",
    note: "Durable context about goals, preferences, observations, and prior work across sessions.",
    work: "awesome-agentic-memory maps the broader category, while embenx pushes toward practical temporal and agentic memory primitives.",
  },
  {
    layer: "Retrieval + context layer",
    note: "Search, filtering, reranking, and context assembly without backend lock-in.",
    work: "embenx unifies retrieval across 15+ backends and adds hybrid search, metadata filtering, and reranking hooks.",
  },
  {
    layer: "Simulation / prediction layer",
    note: "The ability to test futures, compare actions, or retrieve state-action trajectories before committing.",
    work: "The strongest signal today is directional: the embenx roadmap includes trajectory retrieval for world models, but this layer is still being built out.",
  },
  {
    layer: "Tool + environment interface",
    note: "The surface where models connect to MCP tools, code interfaces, and external systems.",
    work: "embenx ships an MCP server, awesome-agentic-memory tracks MCP-native memory servers, and subagent-fleet generates assistant-facing agent interfaces.",
  },
  {
    layer: "Model routing + local/cloud inference",
    note: "Choosing the right model and machine for the job rather than treating inference as one generic endpoint.",
    work: "subagent-fleet sits directly here with LiteLLM routing across local Ollama nodes and role-specific models.",
  },
  {
    layer: "Observability + evaluation",
    note: "Behavior should be inspectable, benchmarkable, and visible over time.",
    work: "subagent-fleet includes live traces and published evals, while AI Toolkit exposes smaller-scale scoring and prompt-structure heuristics.",
  },
]

const StackPage = (_props: PageProps) => (
  <Layout>
    <WorldModelPageShell>
      <WorldModelHero
        eyebrow="Systems Stack"
        title="Building the systems layer between models and reliable agency."
        description="The next frontier is not just better conversation. It is infrastructure that lets models maintain state, retrieve memory, route intelligently, use tools, and remain inspectable while acting over time."
        aside={
          <ConsoleList
            items={[
              "applied systems",
              "agent runtime",
              "state + memory",
              "retrieval + context",
              "simulation / prediction",
              "tool + environment interface",
              "model routing + local/cloud inference",
              "observability + evaluation",
            ]}
          />
        }
      />

      <Divider />

      <WorldModelSection
        eyebrow="Stack Map"
        title="The systems stack"
        description="This page defines the category through concrete layers and ties each layer back to work already published on this site."
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          {stackLayers.map((item, index) => (
            <Panel key={item.layer} accent={index % 2 === 0 ? "cyan" : "green"}>
              <div
                style={{
                  display: "grid",
                  gap: "0.9rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                }}
              >
                <div>
                  <div
                    style={{
                      color: labPalette.green,
                      fontFamily:
                        "'JetBrains Mono', 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
                      fontSize: "0.78rem",
                      letterSpacing: "0.06em",
                      marginBottom: "0.55rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Layer {index + 1}
                  </div>
                  <h3
                    style={{
                      color: labPalette.heading,
                      fontSize: "1.25rem",
                      letterSpacing: "-0.03em",
                      margin: 0,
                    }}
                  >
                    {item.layer}
                  </h3>
                </div>
                <div>
                  <p style={{ color: labPalette.text, margin: 0, lineHeight: 1.7 }}>{item.note}</p>
                  <p style={{ color: labPalette.body, lineHeight: 1.75, margin: "0.8rem 0 0" }}>
                    {item.work}
                  </p>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </WorldModelSection>
    </WorldModelPageShell>
  </Layout>
)

export default StackPage

export const Head: HeadFC = () => (
  <Seo
    title="Stack"
    description="An AI agent infrastructure stack mapping runtime, memory, retrieval, routing, interfaces, and evaluation to Aditya Karnam's published work."
    pathname="/stack/"
  />
)
