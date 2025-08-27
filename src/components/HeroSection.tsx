import React from "react";
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";

const HeroSection: React.FC = () => {
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#1b202b",
        minHeight: "80vh",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Animated background elements */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "10%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)",
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "5%",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(118, 75, 162, 0.08) 0%, transparent 70%)",
          animation: "float 8s ease-in-out infinite reverse",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "4rem 2rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Main Hero Content */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "4rem",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "1.5rem",
              lineHeight: "1.1",
              letterSpacing: "-0.02em",
            }}
          >
            Hey there, I'm Aditya 👋
          </h1>

          <div
            style={{
              fontSize: "1.4rem",
              color: "#e2e8f0",
              fontWeight: "600",
              marginBottom: "2rem",
              lineHeight: "1.4",
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Software Engineer
            </span>{" "}
            building AI systems that think beyond the prompt.
          </div>

          <p
            style={{
              fontSize: "1.1rem",
              color: "#a0aec0",
              lineHeight: "1.7",
              marginBottom: "3rem",
              maxWidth: "700px",
              margin: "0 auto 3rem",
            }}
          >
            I'm obsessed with creating AI tools that don't just follow
            instructions—they understand context, adapt to edge cases, and make
            complex workflows feel effortless. Currently shipping products that
            help millions of users harness AI more effectively.
          </p>

          {/* CTA Button */}
          <div style={{ marginBottom: "4rem" }}>
            <a
              href="/ai-toolkit"
              style={{
                display: "inline-block",
                backgroundColor: "transparent",
                border: "2px solid #667eea",
                color: "#667eea",
                padding: "1rem 2rem",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "1.1rem",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#667eea";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px rgba(102, 126, 234, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#667eea";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              🚀 Explore AI Toolkit
            </a>
          </div>
        </div>

        {/* What I'm Building Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          {/* AI Toolkit Card */}
          <div
            style={{
              backgroundColor: "#2f2f2f",
              borderRadius: "16px",
              padding: "2rem",
              border: "1px solid #404040",
              boxShadow:
                "0 10px 25px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2)",
              backdropFilter: "blur(10px)",
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 20px 40px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 10px 25px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2)";
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              }}
            />

            <h3
              style={{
                fontSize: "1.4rem",
                fontWeight: "700",
                color: "#ffffff",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              🛠️ AI Toolkit
            </h3>

            <p
              style={{
                color: "#a0aec0",
                lineHeight: "1.6",
                marginBottom: "0",
              }}
            >
              Interactive tools that bridge the gap between "I have an idea" and
              "I have the perfect prompt." From dynamic prompt composers to
              reasoning mode toggles, I'm turning prompt engineering from
              guesswork into a craft.
            </p>
          </div>

          {/* Intelligent Systems Card */}
          <div
            style={{
              backgroundColor: "#2f2f2f",
              borderRadius: "16px",
              padding: "2rem",
              border: "1px solid #404040",
              boxShadow:
                "0 10px 25px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2)",
              backdropFilter: "blur(10px)",
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 20px 40px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 10px 25px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2)";
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: "linear-gradient(90deg, #764ba2 0%, #667eea 100%)",
              }}
            />

            <h3
              style={{
                fontSize: "1.4rem",
                fontWeight: "700",
                color: "#ffffff",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              🧠 Intelligent Systems
            </h3>

            <p
              style={{
                color: "#a0aec0",
                lineHeight: "1.6",
                marginBottom: "0",
              }}
            >
              I architect ML pipelines that process massive datasets while
              maintaining human-like reasoning capabilities. Think
              recommendation engines that understand nuance, not just numbers.
            </p>
          </div>
        </div>

        {/* Current Focus */}
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            backgroundColor: "rgba(47, 47, 47, 0.5)",
            borderRadius: "12px",
            border: "1px solid #404040",
            backdropFilter: "blur(10px)",
            marginBottom: "3rem",
          }}
        >
          <p
            style={{
              fontSize: "1rem",
              color: "#e2e8f0",
              fontStyle: "italic",
              marginBottom: "0",
              lineHeight: "1.6",
            }}
          >
            <span style={{ color: "#667eea", fontWeight: "600" }}>
              Currently exploring:
            </span>{" "}
            How to make AI systems more interpretable without sacrificing
            performance.
          </p>
        </div>

        {/* Contact CTA */}
        <div style={{ textAlign: "center" }}>
          <hr
            style={{
              border: "none",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 0%, #404040 50%, transparent 100%)",
              margin: "2rem 0",
            }}
          />

          <p
            style={{
              fontSize: "1.1rem",
              color: "#e2e8f0",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            <span style={{ color: "#667eea" }}>
              Building something interesting?
            </span>{" "}
            Let's connect — I love talking about the intersection of great UX
            and powerful AI systems.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://twitter.com/adityak74"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#a0aec0",
                textDecoration: "none",
                fontSize: "1.5rem",
                padding: "1rem",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "60px",
                height: "60px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(29, 161, 242, 0.1)";
                e.currentTarget.style.borderColor = "#1da1f2";
                e.currentTarget.style.color = "#1da1f2";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 20px rgba(29, 161, 242, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.color = "#a0aec0";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              title="Twitter"
            >
              {React.createElement(FaTwitter)}
            </a>

            <a
              href="https://github.com/adityak74"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#a0aec0",
                textDecoration: "none",
                fontSize: "1.5rem",
                padding: "1rem",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "60px",
                height: "60px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.borderColor = "#ffffff";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 20px rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.color = "#a0aec0";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              title="GitHub"
            >
              {React.createElement(FaGithub)}
            </a>

            <a
              href="https://www.linkedin.com/in/adityakarnamgrao/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#a0aec0",
                textDecoration: "none",
                fontSize: "1.5rem",
                padding: "1rem",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "60px",
                height: "60px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(0, 119, 181, 0.1)";
                e.currentTarget.style.borderColor = "#0077b5";
                e.currentTarget.style.color = "#0077b5";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 20px rgba(0, 119, 181, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.color = "#a0aec0";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              title="LinkedIn"
            >
              {React.createElement(FaLinkedin)}
            </a>
          </div>
        </div>
      </div>

      {/* Inject keyframes styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `,
        }}
      />
    </div>
  );
};

export default HeroSection;
