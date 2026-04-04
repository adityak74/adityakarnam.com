import * as React from "react";

const MindockCTA = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.875rem",
        padding: "1.75rem 2rem",
        backgroundColor: "rgba(37, 99, 235, 0.05)",
        borderRadius: "10px",
        border: "1px solid rgba(37, 99, 235, 0.15)",
        marginTop: "2rem",
        marginBottom: "2rem",
      }}
    >
      <a
        href="https://mindock.app/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.625rem",
          backgroundColor: "#2563EB",
          color: "#ffffff",
          padding: "0.875rem 2rem",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "600",
          fontSize: "1rem",
          transition: "background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease",
          boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#1D4ED8";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(37, 99, 235, 0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#2563EB";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.25)";
        }}
      >
        Join Mindock Waitlist
        <span
          style={{
            fontSize: "0.75rem",
            backgroundColor: "rgba(255, 255, 255, 0.18)",
            padding: "0.15rem 0.5rem",
            borderRadius: "4px",
            fontWeight: "500",
            letterSpacing: "0.03em",
          }}
        >
          FREE
        </span>
      </a>
      <p
        style={{
          fontSize: "0.875rem",
          color: "#6B7280",
          textAlign: "center",
          margin: "0",
          maxWidth: "480px",
          lineHeight: "1.5",
        }}
      >
        Think through first principles with AI — private, offline notes. Open source &amp; free forever.
      </p>
    </div>
  );
};

export default MindockCTA;
