import * as React from "react";

const MindockCTA = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        padding: "2rem",
        backgroundColor: "rgba(47, 47, 47, 0.5)",
        borderRadius: "16px",
        border: "1px solid #404040",
        backdropFilter: "blur(10px)",
        marginTop: "2rem",
        marginBottom: "2rem",
      }}
    >
      {/* Mindock CTA - Primary */}
      <a
        href="https://mindock.app/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.75rem",
          backgroundColor: "#667eea",
          color: "#ffffff",
          padding: "1.25rem 2.5rem",
          borderRadius: "12px",
          textDecoration: "none",
          fontWeight: "600",
          fontSize: "1.2rem",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#5a67d8";
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow =
            "0 15px 35px rgba(102, 126, 234, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#667eea";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 8px 25px rgba(102, 126, 234, 0.3)";
        }}
      >
        🧠 Join Mindock Waitlist - AI-Native Notes
        <span
          style={{
            fontSize: "0.9rem",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            padding: "0.2rem 0.6rem",
            borderRadius: "6px",
            fontWeight: "500",
          }}
        >
          PRIVATE & FREE
        </span>
      </a>

      {/* Mindock Description */}
      <p
        style={{
          fontSize: "0.95rem",
          color: "#a0aec0",
          textAlign: "center",
          marginTop: "0.5rem",
          marginBottom: "0",
          maxWidth: "500px",
          lineHeight: "1.4",
        }}
      >
        Think through first principles with AI. The first truly private,
        offline notes app. Open source & free forever.
      </p>
    </div>
  );
};

export default MindockCTA;
