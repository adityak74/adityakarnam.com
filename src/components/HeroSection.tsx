import React from "react";
import { useColorMode } from "theme-ui";
import { FaLinkedin, FaTwitter, FaGithub, FaArrowRight, FaTools, FaBrain, FaGithub as FaGithubIcon, FaExternalLinkAlt } from "react-icons/fa";

const HeroSection: React.FC = () => {
  const [colorMode] = useColorMode();
  const isDark = colorMode === "dark";

  const colors = {
    bg: "transparent",
    text: isDark ? "#E8E6DD" : "#181818",
    heading: isDark ? "#F5F2E9" : "#181818",
    secondary: isDark ? "#97927F" : "#66635C",
    primary: isDark ? "#E8E6DD" : "#181818",
    accent: isDark ? "#E08A6B" : "#D97757",
    divide: isDark ? "#2D2A22" : "#DDD9CD",
    cardBg: isDark ? "#211F18" : "#E8E4D9",
    cardBorder: isDark ? "#2D2A22" : "#DDD9CD",
    mutedBg: isDark ? "#141310" : "#E8E4D9",
  };

  return (
    <div style={{ color: colors.text }}>
      {/* Hero content */}
      <div
        style={{
          paddingTop: "3.5rem",
          paddingBottom: "5rem",
        }}
      >
        {/* Name + role */}
        <div style={{ marginBottom: "3rem" }}>
          <h1
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(2.25rem, 5.5vw, 3.5rem)",
              fontWeight: "600",
              color: colors.heading,
              marginBottom: "0.75rem",
              lineHeight: "1.1",
              letterSpacing: "-0.02em",
            }}
          >
            Hi, I'm Aditya Karnam
          </h1>

          <p
            style={{
              fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
              color: colors.secondary,
              fontWeight: "500",
              marginBottom: "0.75rem",
              lineHeight: "1.4",
            }}
          >
            <span style={{ color: colors.primary }}>Senior AI Systems Engineer</span>
            {" "}| LLM / Agent Platforms | Research‑Driven Tools for High‑Impact Teams
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 1.5rem 0",
              display: "flex",
              flexDirection: "column",
              gap: "0.375rem",
            }}
          >
            <li
              style={{
                fontSize: "0.95rem",
                color: colors.secondary,
                lineHeight: "1.6",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
              }}
            >
              <span style={{ color: colors.primary, flexShrink: 0 }}>▸</span>
              Building AI‑first systems for research‑driven and product teams.
            </li>
            <li
              style={{
                fontSize: "0.95rem",
                color: colors.secondary,
                lineHeight: "1.6",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
              }}
            >
              <span style={{ color: colors.primary, flexShrink: 0 }}>▸</span>
              Focus on agents, reasoning, and tooling that reduce manual work and improve robustness.
            </li>
          </ul>

          <p
            style={{
              fontSize: "1rem",
              color: colors.secondary,
              lineHeight: "1.75",
              maxWidth: "580px",
              marginBottom: "2rem",
            }}
          >
            I design and ship production-grade AI systems — agent pipelines, LLM
            tooling, and memory layers — that teams use to move faster and with
            greater confidence. My work sits at the junction of software
            engineering rigor and applied ML research, with a focus on systems
            that are interpretable, maintainable, and actually useful in
            production.
          </p>

          {/* Currently building — embenx */}
          <a
            href="https://adityak74.github.io/embenx/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              padding: "1rem 1.25rem",
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: "8px",
              textDecoration: "none",
              color: "inherit",
              marginBottom: "2rem",
              transition: "border-color 0.15s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.accent;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.cardBorder;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: colors.accent,
                    backgroundColor: isDark ? "rgba(224, 138, 107, 0.12)" : "rgba(217, 119, 87, 0.08)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  Currently Building
                </span>
                <img
                  src="/embenx.png"
                  alt="embenx"
                  style={{
                    height: "28px",
                    width: "auto",
                    display: "block",
                    imageRendering: "pixelated",
                  }}
                />
              </div>
              <p style={{ fontSize: "0.875rem", color: colors.secondary, margin: "0 0 0.5rem", lineHeight: "1.55" }}>
                Most agent systems are brittle at retrieval: each vector backend has its own API, and switching costs are high. embenx solves this with a unified embedding retrieval layer — a single API across 15+ vector backends with MCP support for Claude and autonomous agents. Teams replacing scattered retrieval code with embenx typically eliminate hundreds of lines of glue code and a full class of integration bugs.
              </p>
              <code
                style={{
                  fontSize: "0.8rem",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  color: colors.accent,
                  backgroundColor: isDark ? "rgba(224, 138, 107, 0.1)" : "rgba(217, 119, 87, 0.06)",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                }}
              >
                pip install embenx
              </code>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, alignItems: "center", paddingTop: "2px" }}>
              <a
                href="https://github.com/adityak74/embenx"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="GitHub"
                style={{
                  color: colors.secondary,
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.heading; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.secondary; }}
              >
                {React.createElement(FaGithubIcon)}
              </a>
              {React.createElement(FaExternalLinkAlt, { style: { color: colors.secondary, fontSize: "0.75rem" } })}
            </div>
          </a>

          {/* cc-creativity-skills */}
          <a
            href="https://github.com/adityak74/cc-creativity-skills"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              padding: "1rem 1.25rem",
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: "8px",
              textDecoration: "none",
              color: "inherit",
              marginBottom: "2rem",
              transition: "border-color 0.15s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.accent;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.cardBorder;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: colors.accent,
                    backgroundColor: isDark ? "rgba(224, 138, 107, 0.12)" : "rgba(217, 119, 87, 0.08)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  Also Building
                </span>
                <img
                  src="/cc-creativity.png"
                  alt="cc-creativity-skills"
                  style={{
                    height: "28px",
                    width: "auto",
                    display: "block",
                    imageRendering: "pixelated",
                  }}
                />
              </div>
              <p style={{ fontSize: "0.875rem", color: colors.secondary, margin: "0 0 0.5rem", lineHeight: "1.55" }}>
                Claude Code's built-in skills don't cover creative or interactive generation workflows. This library adds those: a growing set of composable skills for generative art, interactive experiences, and creative tooling. Reduces from-scratch prompting time for teams building AI-driven creative features.
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <a
                  href="/box-breathing/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: "0.8rem",
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    color: colors.accent,
                    backgroundColor: isDark ? "rgba(224, 138, 107, 0.1)" : "rgba(217, 119, 87, 0.06)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    textDecoration: "none",
                    transition: "opacity 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.75"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  demo: box breathing
                </a>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, alignItems: "center", paddingTop: "2px" }}>
              <a
                href="https://github.com/adityak74/cc-creativity-skills"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="GitHub"
                style={{
                  color: colors.secondary,
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.heading; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.secondary; }}
              >
                {React.createElement(FaGithubIcon)}
              </a>
              {React.createElement(FaExternalLinkAlt, { style: { color: colors.secondary, fontSize: "0.75rem" } })}
            </div>
          </a>

          {/* leanlearn */}
          <a
            href="https://github.com/adityak74/leanlearn"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              padding: "1rem 1.25rem",
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: "8px",
              textDecoration: "none",
              color: "inherit",
              marginBottom: "2rem",
              transition: "border-color 0.15s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.accent;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.cardBorder;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: colors.accent,
                    backgroundColor: isDark ? "rgba(224, 138, 107, 0.12)" : "rgba(217, 119, 87, 0.08)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  Also Building
                </span>
                <img
                  src="/leanlearn_logo.png"
                  alt="leanlearn"
                  style={{
                    height: "28px",
                    width: "auto",
                    display: "block",
                    imageRendering: "pixelated",
                  }}
                />
              </div>
              <p style={{ fontSize: "0.875rem", color: colors.secondary, margin: "0 0 0.5rem", lineHeight: "1.55" }}>
                A modern, high-performance LMS built for speed and simplicity. Leverages a Cloudflare-native stack (Pages, D1, Workers, React Router v7) — edge-hosted courses with real-time progress tracking, automated certificate generation, and Google OAuth. Built lean so learners get fast and teams can ship without infrastructure overhead.
              </p>
              <code
                style={{
                  fontSize: "0.8rem",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  color: colors.accent,
                  backgroundColor: isDark ? "rgba(224, 138, 107, 0.1)" : "rgba(217, 119, 87, 0.06)",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                }}
              >
                Cloudflare · React Router v7 · D1 · Drizzle ORM
              </code>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, alignItems: "center", paddingTop: "2px" }}>
              <a
                href="https://github.com/adityak74/leanlearn"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="GitHub"
                style={{
                  color: colors.secondary,
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.heading; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.secondary; }}
              >
                {React.createElement(FaGithubIcon)}
              </a>
              {React.createElement(FaExternalLinkAlt, { style: { color: colors.secondary, fontSize: "0.75rem" } })}
            </div>
          </a>

          {/* subagent-fleet */}
          <a
            href="https://github.com/adityak74/subagent-fleet"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              padding: "1rem 1.25rem",
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: "8px",
              textDecoration: "none",
              color: "inherit",
              marginBottom: "2rem",
              transition: "border-color 0.15s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.accent;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.cardBorder;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: colors.accent,
                    backgroundColor: isDark ? "rgba(224, 138, 107, 0.12)" : "rgba(217, 119, 87, 0.08)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  Also Building
                </span>
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    color: colors.heading,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  }}
                >
                  subagent-fleet
                </span>
              </div>
              <p style={{ fontSize: "0.875rem", color: colors.secondary, margin: "0 0 0.5rem", lineHeight: "1.55" }}>
                Local AI compute control plane for Claude Code and coding agents. Turns your Macs, GPUs, and Ollama backends into one intelligent fleet — routing subagents to the right model and machine by role, with real-time health monitoring, model warmup, and execution tracing via a live SSE dashboard.
              </p>
              <code
                style={{
                  fontSize: "0.8rem",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  color: colors.accent,
                  backgroundColor: isDark ? "rgba(224, 138, 107, 0.1)" : "rgba(217, 119, 87, 0.06)",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                }}
              >
                Python · Ollama · LiteLLM · CLI
              </code>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, alignItems: "center", paddingTop: "2px" }}>
              <a
                href="https://github.com/adityak74/subagent-fleet"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="GitHub"
                style={{
                  color: colors.secondary,
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.heading; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.secondary; }}
              >
                {React.createElement(FaGithubIcon)}
              </a>
              {React.createElement(FaExternalLinkAlt, { style: { color: colors.secondary, fontSize: "0.75rem" } })}
            </div>
          </a>

          {/* CTA */}
          <a
            href="/ai-toolkit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: colors.accent,
              color: "#ffffff",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "0.95rem",
              transition: "opacity 0.15s ease, transform 0.15s ease",
              boxShadow: "0 2px 8px rgba(217, 119, 87, 0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.88";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Explore AI Toolkit
            {React.createElement(FaArrowRight, { style: { fontSize: "0.8rem" } })}
          </a>
        </div>

        {/* Divider */}
        <hr
          style={{
            border: "none",
            borderTop: `1px solid ${colors.divide}`,
            margin: "0 0 2.5rem 0",
          }}
        />

        {/* Feature cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: "8px",
              padding: "1.5rem",
              border: `1px solid ${colors.cardBorder}`,
              transition: "transform 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = colors.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = colors.cardBorder;
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: colors.heading,
                marginBottom: "0.625rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {React.createElement(FaTools, { style: { color: colors.accent, fontSize: "0.9rem" } })}
              AI Toolkit
            </h3>
            <p
              style={{
                color: colors.secondary,
                lineHeight: "1.65",
                fontSize: "0.9rem",
                margin: 0,
              }}
            >
              Prompt engineering without structure is guesswork. This toolkit
              provides interactive composers, reasoning toggles, and graders that
              turn ad-hoc prompting into a repeatable, auditable process —
              reducing iteration cycles for teams building with LLMs.
            </p>
          </div>

          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: "8px",
              padding: "1.5rem",
              border: `1px solid ${colors.cardBorder}`,
              transition: "transform 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = colors.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = colors.cardBorder;
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: colors.heading,
                marginBottom: "0.625rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {React.createElement(FaBrain, { style: { color: colors.accent, fontSize: "0.9rem" } })}
              Intelligent Systems
            </h3>
            <p
              style={{
                color: colors.secondary,
                lineHeight: "1.65",
                fontSize: "0.9rem",
                margin: 0,
              }}
            >
              Agent pipelines and retrieval systems designed for real workloads —
              robust to edge cases, observable at runtime, and built to be
              maintained by a team, not just their original author.
            </p>
          </div>
        </div>

        {/* Currently exploring */}
        <div
          style={{
            padding: "1rem 1.25rem",
            backgroundColor: isDark ? "rgba(224, 138, 107, 0.08)" : "rgba(217, 119, 87, 0.05)",
            borderRadius: "6px",
            border: `1px solid ${isDark ? "rgba(224, 138, 107, 0.18)" : "rgba(217, 119, 87, 0.15)"}`,
            marginBottom: "2.5rem",
          }}
        >
          <p
            style={{
              fontSize: "0.9rem",
              color: colors.secondary,
              margin: 0,
              lineHeight: "1.6",
            }}
          >
            <span style={{ color: colors.accent, fontWeight: "600" }}>
              Currently exploring:
            </span>{" "}
            Structured reasoning traces and evaluation frameworks that let teams audit agent behavior without slowing down production systems.
          </p>
        </div>

        {/* Contact */}
        <hr
          style={{
            border: "none",
            borderTop: `1px solid ${colors.divide}`,
            margin: "0 0 2rem 0",
          }}
        />

        <p
          style={{
            fontSize: "0.95rem",
            color: colors.secondary,
            marginBottom: "1.25rem",
            lineHeight: "1.6",
          }}
        >
          <span style={{ color: colors.heading, fontWeight: "600" }}>
            Building something interesting?
          </span>{" "}
          Let's connect — I'm always happy to talk agents, LLM systems design, or research-adjacent engineering challenges.
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
          }}
        >
          {[
            { icon: FaTwitter, url: "https://twitter.com/aditya_karnam", label: "Twitter", hoverColor: "#1DA1F2" },
            { icon: FaGithub, url: "https://github.com/adityak74", label: "GitHub", hoverColor: isDark ? "#F0F6FC" : "#111827" },
            { icon: FaLinkedin, url: "https://www.linkedin.com/in/adityakarnamgrao/", label: "LinkedIn", hoverColor: "#0077B5" },
          ].map(({ icon, url, label, hoverColor }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              style={{
                color: colors.secondary,
                fontSize: "1.2rem",
                padding: "0.625rem",
                borderRadius: "6px",
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                transition: "color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = hoverColor;
                e.currentTarget.style.borderColor = hoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.secondary;
                e.currentTarget.style.borderColor = colors.cardBorder;
              }}
            >
              {React.createElement(icon)}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
