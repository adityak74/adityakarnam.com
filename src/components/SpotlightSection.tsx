import React from "react";
import { useColorMode } from "theme-ui";
import { FaExternalLinkAlt, FaTrophy, FaCode, FaDatabase, FaRobot, FaFlask } from "react-icons/fa";

const SpotlightSection: React.FC = () => {
  const [colorMode] = useColorMode();
  const isDark = colorMode === "dark";

  const colors = {
    text: isDark ? "#C9D1D9" : "#111827",
    heading: isDark ? "#F0F6FC" : "#111827",
    secondary: isDark ? "#8B949E" : "#6B7280",
    primary: isDark ? "#58A6FF" : "#2563EB",
    divide: isDark ? "#21262D" : "#E5E7EB",
    cardBg: isDark ? "#161B22" : "#F8FAFC",
    cardBorder: isDark ? "#21262D" : "#E5E7EB",
  };

  const categoryMeta: Record<string, { icon: React.ComponentType; color: string }> = {
    "AI & Machine Learning": { icon: FaRobot, color: colors.primary },
    "Software Engineering": { icon: FaCode, color: isDark ? "#3FB950" : "#16A34A" },
    "Blockchain & Data": { icon: FaDatabase, color: isDark ? "#E3B341" : "#D97706" },
  };

  const researchHighlights = [
    {
      title: "Novel Genetic Algorithm Research",
      description: "Presented my genetic algorithm work for community detection problem using ERBGA a novel algorithm.",
      url: "https://www.umsl.edu/cmpsci/dept-news-events/news-listings/hope-center.html",
      icon: FaFlask,
      accentColor: colors.primary,
    },
    {
      title: "Masters Winner Prize",
      description: "Masters Winner Prize for presenting my research work ERBGA.",
      url: "https://www.umsl.edu/cmpsci/dept-news-events/news-listings/grad-research-fair.html",
      icon: FaTrophy,
      accentColor: isDark ? "#E3B341" : "#D97706",
    },
    {
      title: "Midwest Bioinformatics Conference",
      description: "ERBGA Presentation at 2018 Midwest Bioinformatics Conference",
      url: "https://www.umsl.edu/cmpsci/dept-news-events/news-listings/midwest-bioinformatics.html",
      icon: FaFlask,
      accentColor: isDark ? "#3FB950" : "#16A34A",
    },
    {
      title: "Published Research Paper",
      description: "Efficient Reduced-Bias Genetic Algorithm (ERBGA) for Generic Community Detection Objectives",
      url: "https://profiles.umsl.edu/en/publications/efficient-reduced-bias-genetic-algorithm-erbga-for-generic-commun-2",
      icon: FaCode,
      accentColor: isDark ? "#BC8CFF" : "#7C3AED",
    },
  ];

  const articles: Record<string, { title: string; url: string; platform: string }[]> = {
    "AI & Machine Learning": [
      { title: "Predicting Diabetes Types: A Deep Learning Approach", url: "https://dzone.com/articles/predicting-diabetes-types-deep-learning", platform: "DZone" },
      { title: "Building an AI-Powered Cold Email System With CrewAI", url: "https://dzone.com/articles/building-ai-powered-cold-email-system-with-crewai", platform: "DZone" },
      { title: "Building Chat GPT from Scratch: A Journey into Conversational AI", url: "https://medium.com/@adityakarnam/building-chat-gpt-from-scratch-a-journey-into-conversational-ai-d301ed0d3cd2", platform: "Medium" },
      { title: "Building Custom Tools With Model Context Protocol", url: "https://dzone.com/articles/building-custom-tools-model-context-protocol", platform: "DZone" },
      { title: "Krutrim: India's indigenous LLM", url: "https://levelup.gitconnected.com/krutrim-indias-own-ai-chat-engine-8c962f4bcd58", platform: "Level Up Coding" },
      { title: "Building a Rust CLI to Chat with Llama 3.2", url: "https://levelup.gitconnected.com/building-a-rust-command-line-interface-to-chat-with-llama-3-2-c23380a5329e", platform: "Level Up Coding" },
      { title: "Part 1: Setup your LLM home server for under $100", url: "https://levelup.gitconnected.com/setup-your-llm-home-server-for-under-100-edf44d44782a", platform: "Level Up Coding" },
    ],
    "Software Engineering": [
      { title: "Mastering Async Context Manager Mocking in Python Tests", url: "https://dzone.com/articles/mastering-async-context-manager-mocking-in-python", platform: "DZone" },
      { title: "Beyond Sequential: Why Rust's Threading Model Changed How I Think About Concurrent Programming", url: "https://levelup.gitconnected.com/beyond-sequential-why-rusts-threading-model-changed-how-i-think-about-concurrent-programming-475b11e8cafe", platform: "Level Up Coding" },
      { title: "Why You Should Use ZSTD Instead of GZIP or ZLIB to Compress Data", url: "https://levelup.gitconnected.com/why-you-should-use-zstd-instead-of-gzip-or-zlib-to-compress-data-971e9b27f8c7", platform: "Level Up Coding" },
      { title: "Leveraging Feature Flags for Dynamic Route Handling in FastAPI", url: "https://levelup.gitconnected.com/leveraging-feature-flags-for-dynamic-route-handling-in-fastapi-1f0a40bf8be6", platform: "Level Up Coding" },
    ],
    "Blockchain & Data": [
      { title: "Writing a simple blockchain oracle contract, oracle server, and client in under 5 mins", url: "https://levelup.gitconnected.com/writing-a-simple-blockchain-oracle-contract-oracle-server-and-client-in-under-5-mins-7ec8ee33df91", platform: "Level Up Coding" },
      { title: "Exploring Chandrayaan 3 Satellite Data: Tracking Altitude with JavaScript", url: "https://levelup.gitconnected.com/exploring-chandrayaan-3-satellite-data-tracking-altitude-with-javascript-1fce4d3526d0", platform: "Level Up Coding" },
    ],
  };

  return (
    <div style={{ color: colors.text }}>
      {/* Page header */}
      <div style={{ marginBottom: "3rem" }}>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: "700",
            color: colors.heading,
            marginBottom: "0.75rem",
            letterSpacing: "-0.03em",
            lineHeight: "1.15",
          }}
        >
          Spotlight
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: colors.secondary,
            maxWidth: "560px",
            lineHeight: "1.65",
            margin: 0,
          }}
        >
          Research, writing, and technical contributions at the intersection of
          applied ML, systems engineering, and rigorous problem-solving.
        </p>
      </div>

      {/* Bio paragraphs */}
      <div style={{ marginBottom: "2.5rem" }}>
        <p
          style={{
            fontSize: "1rem",
            color: colors.secondary,
            maxWidth: "560px",
            lineHeight: "1.65",
            marginBottom: "1rem",
          }}
        >
          I'm a senior engineer specializing in AI systems — Python services,
          agent pipelines, and the infrastructure that makes LLM applications
          reliable at scale. My background spans distributed systems, ML
          tooling, and applied research, with a track record of taking complex
          AI ideas from prototype to production.
        </p>
        <p
          style={{
            fontSize: "1rem",
            color: colors.secondary,
            maxWidth: "560px",
            lineHeight: "1.65",
            marginBottom: "1rem",
          }}
        >
          On the research side, I work on interpretable AI, LLM evaluation, and
          techniques for reducing technical debt in ML codebases. My published
          work on genetic algorithms for community detection reflects a longer
          interest in systems that produce understandable, auditable outputs — a
          concern that has only become more relevant as LLMs move into critical
          workflows.
        </p>
        <p
          style={{
            fontSize: "1rem",
            color: colors.secondary,
            maxWidth: "560px",
            lineHeight: "1.65",
            margin: 0,
          }}
        >
          The throughline is impact: tools and systems that help teams ship
          faster, debug more confidently, and maintain AI-driven products
          without heroics. I care about work that scales beyond the person who
          built it.
        </p>
      </div>

      {/* Divider */}
      <hr style={{ border: "none", borderTop: `1px solid ${colors.divide}`, margin: "0 0 2.5rem" }} />

      {/* Research Highlights */}
      <section style={{ marginBottom: "3.5rem" }}>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: colors.secondary,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "1.25rem",
          }}
        >
          Research Highlights
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "0.875rem",
          }}
        >
          {researchHighlights.map((highlight, i) => (
            <a
              key={i}
              href={highlight.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: colors.cardBg,
                borderRadius: "8px",
                padding: "1.25rem 1.25rem 1.25rem 1rem",
                border: `1px solid ${colors.cardBorder}`,
                borderLeft: `3px solid ${highlight.accentColor}`,
                transition: "transform 0.15s ease, border-color 0.15s ease",
                textDecoration: "none",
                color: "inherit",
                display: "block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {React.createElement(highlight.icon, { style: { color: highlight.accentColor, fontSize: "0.9rem", flexShrink: 0 } })}
                  <h3 style={{ fontSize: "0.95rem", fontWeight: "600", color: colors.heading, margin: 0, lineHeight: "1.3" }}>
                    {highlight.title}
                  </h3>
                </div>
                {React.createElement(FaExternalLinkAlt, { style: { color: colors.secondary, fontSize: "0.75rem", flexShrink: 0, marginTop: "2px" } })}
              </div>
              <p style={{ color: colors.secondary, lineHeight: "1.55", margin: 0, fontSize: "0.875rem" }}>
                {highlight.description}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Technical Articles */}
      <section>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: colors.secondary,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "2rem",
          }}
        >
          Technical Articles
        </h2>

        {Object.entries(articles).map(([category, categoryArticles]) => {
          const meta = categoryMeta[category] ?? { icon: FaCode, color: colors.primary };
          return (
            <div key={category} style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                {React.createElement(meta.icon, { style: { color: meta.color, fontSize: "0.9rem" } })}
                <h3 style={{ fontSize: "1rem", fontWeight: "600", color: colors.heading, margin: 0 }}>
                  {category}
                </h3>
                <span
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                    color: colors.secondary,
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    padding: "0.1rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  {categoryArticles.length}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "0.625rem",
                }}
              >
                {categoryArticles.map((article, j) => (
                  <a
                    key={j}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: colors.cardBg,
                      borderRadius: "6px",
                      padding: "0.875rem 1rem",
                      border: `1px solid ${colors.cardBorder}`,
                      transition: "border-color 0.15s ease, transform 0.15s ease",
                      textDecoration: "none",
                      color: "inherit",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = meta.color;
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.cardBorder;
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.9rem", fontWeight: "500", color: colors.heading, marginBottom: "0.25rem", lineHeight: "1.4", margin: "0 0 0.25rem" }}>
                        {article.title}
                      </p>
                      <span style={{ fontSize: "0.775rem", color: meta.color, fontWeight: "500" }}>
                        {article.platform}
                      </span>
                    </div>
                    {React.createElement(FaExternalLinkAlt, {
                      style: { color: colors.secondary, fontSize: "0.7rem", flexShrink: 0, marginTop: "4px" },
                    })}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default SpotlightSection;
