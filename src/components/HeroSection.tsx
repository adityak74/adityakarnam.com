import React from "react";
import { useColorMode } from "theme-ui";
import { FaLinkedin, FaTwitter, FaGithub, FaArrowRight, FaTools, FaBrain, FaGithub as FaGithubIcon, FaExternalLinkAlt } from "react-icons/fa";

const HeroSection: React.FC = () => {
  const [colorMode] = useColorMode();
  const isDark = colorMode === "dark";

  const colors = {
    bg: "transparent",
    text: isDark ? "#C9D1D9" : "#111827",
    heading: isDark ? "#F0F6FC" : "#111827",
    secondary: isDark ? "#8B949E" : "#6B7280",
    primary: isDark ? "#58A6FF" : "#2563EB",
    divide: isDark ? "#21262D" : "#E5E7EB",
    cardBg: isDark ? "#161B22" : "#F8FAFC",
    cardBorder: isDark ? "#21262D" : "#E5E7EB",
    mutedBg: isDark ? "#0D1117" : "#F3F4F6",
  };

  return (
    <div style={{ color: colors.text }}>
      {/* Hero content */}
      <div
        style={{
          paddingTop: "3rem",
          paddingBottom: "4rem",
        }}
      >
        {/* Name + role */}
        <div style={{ marginBottom: "3rem" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: "700",
              color: colors.heading,
              marginBottom: "0.75rem",
              lineHeight: "1.15",
              letterSpacing: "-0.03em",
            }}
          >
            Hi, I'm Aditya Karnam
          </h1>

          <p
            style={{
              fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
              color: colors.secondary,
              fontWeight: "500",
              marginBottom: "1.5rem",
              lineHeight: "1.4",
            }}
          >
            <span style={{ color: colors.primary }}>Senior Software Engineer</span>
            {" "}building AI systems that think beyond the prompt.
          </p>

          <p
            style={{
              fontSize: "1rem",
              color: colors.secondary,
              lineHeight: "1.75",
              maxWidth: "580px",
              marginBottom: "2rem",
            }}
          >
            I'm obsessed with creating AI tools that don't just follow
            instructions—they understand context, adapt to edge cases, and make
            complex workflows feel effortless. Currently shipping products that
            help millions of users harness AI more effectively.
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
              backgroundColor: isDark ? "#0D1117" : "#F8FAFC",
              border: `1px solid ${isDark ? "#21262D" : "#E5E7EB"}`,
              borderLeft: `3px solid ${colors.primary}`,
              borderRadius: "8px",
              textDecoration: "none",
              color: "inherit",
              marginBottom: "2rem",
              transition: "border-color 0.15s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDark ? "#21262D" : "#E5E7EB";
              e.currentTarget.style.borderLeftColor = colors.primary;
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
                    color: colors.primary,
                    backgroundColor: isDark ? "rgba(88, 166, 255, 0.1)" : "rgba(37, 99, 235, 0.08)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  Currently Building
                </span>
                <span style={{ fontSize: "0.95rem", fontWeight: "700", color: colors.heading }}>
                  embenx
                </span>
              </div>
              <p style={{ fontSize: "0.875rem", color: colors.secondary, margin: "0 0 0.5rem", lineHeight: "1.55" }}>
                Universal embedding retrieval toolkit &amp; agentic memory layer — unified API for 15+ vector backends with MCP support for Claude and autonomous agents.
              </p>
              <code
                style={{
                  fontSize: "0.8rem",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  color: colors.primary,
                  backgroundColor: isDark ? "rgba(88, 166, 255, 0.08)" : "rgba(37, 99, 235, 0.06)",
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

          {/* CTA */}
          <a
            href="/ai-toolkit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: colors.primary,
              color: "#ffffff",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "0.95rem",
              transition: "opacity 0.15s ease, transform 0.15s ease",
              boxShadow: isDark
                ? "0 2px 8px rgba(88, 166, 255, 0.2)"
                : "0 2px 8px rgba(37, 99, 235, 0.2)",
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
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: "8px",
              padding: "1.5rem",
              border: `1px solid ${colors.cardBorder}`,
              borderLeft: `3px solid ${colors.primary}`,
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
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
              {React.createElement(FaTools, { style: { color: colors.primary, fontSize: "0.9rem" } })}
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
              Interactive tools that bridge the gap between "I have an idea" and
              "I have the perfect prompt." From dynamic prompt composers to
              reasoning mode toggles, turning prompt engineering from guesswork
              into a craft.
            </p>
          </div>

          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: "8px",
              padding: "1.5rem",
              border: `1px solid ${colors.cardBorder}`,
              borderLeft: `3px solid ${colors.primary}`,
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
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
              {React.createElement(FaBrain, { style: { color: colors.primary, fontSize: "0.9rem" } })}
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
              ML pipelines that process massive datasets while maintaining
              human-like reasoning. Recommendation engines that understand
              nuance, not just numbers.
            </p>
          </div>
        </div>

        {/* Currently exploring */}
        <div
          style={{
            padding: "1rem 1.25rem",
            backgroundColor: isDark ? "rgba(88, 166, 255, 0.06)" : "rgba(37, 99, 235, 0.04)",
            borderRadius: "6px",
            border: `1px solid ${isDark ? "rgba(88, 166, 255, 0.15)" : "rgba(37, 99, 235, 0.12)"}`,
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
            <span style={{ color: colors.primary, fontWeight: "600" }}>
              Currently exploring:
            </span>{" "}
            How to make AI systems more interpretable without sacrificing performance.
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
          Let's connect — I love talking about the intersection of great UX and powerful AI.
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
