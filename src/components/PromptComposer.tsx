import React, { useState } from "react";
import { SiOpenai, SiAnthropic, SiPerplexity } from "react-icons/si";

const PromptComposer: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState(
    "Write a comprehensive product roadmap for our mobile app"
  );
  const [role, setRole] = useState("Senior Product Manager");
  const [tone, setTone] = useState("Formal");
  const [format, setFormat] = useState("Markdown table");
  const [verbosity, setVerbosity] = useState("Balanced");
  const [thinking, setThinking] = useState("Think Moderate / Careful");
  const [be100xSpecific, setBe100xSpecific] = useState(false);
  const [laserFocused, setLaserFocused] = useState(false);

  const enhancedPrompt = `${userPrompt}

Act as a ${role}. 
Use a ${tone} tone.
Output format: ${format}.
Verbosity level: ${verbosity}.
Thinking mode: ${thinking}.${be100xSpecific ? "\nBe 100x specific." : ""}${
    laserFocused ? "\nLaser focused action oriented." : ""
  }`;

  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(
    enhancedPrompt
  )}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(
    enhancedPrompt
  )}`;
  const perplexityUrl = `https://www.perplexity.ai/?q=${encodeURIComponent(
    enhancedPrompt
  )}`;

  // Quick preset configurations
  const presets = [
    {
      name: "💻 Coding",
      icon: "👨‍💻",
      role: "Senior Software Engineer",
      tone: "Concise",
      format: "Code block",
      verbosity: "Balanced",
      thinking: "Think Moderate / Careful",
      be100xSpecific: true,
      laserFocused: true,
      color: "#3b82f6",
    },
    {
      name: "🔬 Research",
      icon: "🎓",
      role: "Research Scientist",
      tone: "Academic",
      format: "Bulleted list",
      verbosity: "Verbose",
      thinking: "Think Hard / Deep Analysis",
      be100xSpecific: true,
      laserFocused: false,
      color: "#8b5cf6",
    },
    {
      name: "📊 Product",
      icon: "🚀",
      role: "Senior Product Manager",
      tone: "Formal",
      format: "Markdown table",
      verbosity: "Balanced",
      thinking: "Think Moderate / Careful",
      be100xSpecific: true,
      laserFocused: true,
      color: "#10b981",
    },
    {
      name: "✨ Creative",
      icon: "🎨",
      role: "Creative Writer",
      tone: "Playful",
      format: "Plain text",
      verbosity: "Verbose",
      thinking: "Creative / Divergent",
      be100xSpecific: false,
      laserFocused: false,
      color: "#f59e0b",
    },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    setRole(preset.role);
    setTone(preset.tone);
    setFormat(preset.format);
    setVerbosity(preset.verbosity);
    setThinking(preset.thinking);
    setBe100xSpecific(preset.be100xSpecific);
    setLaserFocused(preset.laserFocused);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      const button = document.getElementById("copy-button");
      if (button) {
        const originalText = button.textContent;
        button.textContent = "✓ Copied!";
        button.style.backgroundColor = "#10b981";
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = "#3b82f6";
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Prompt copied to clipboard!");
    }
  };

  const openChatGPT = () => {
    window.open(chatGptUrl, "_blank");
  };

  const openClaude = () => {
    window.open(claudeUrl, "_blank");
  };

  const openPerplexity = () => {
    window.open(perplexityUrl, "_blank");
  };

  const roleExamples = [
    "Senior Product Manager",
    "Data Scientist",
    "Creative Writer",
    "Software Engineer",
    "Marketing Strategist",
    "Business Consultant",
    "UX Designer",
    "Content Creator",
    "Financial Analyst",
    "Project Manager",
  ];

  return (
    <div
      className="max-w-4xl mx-auto"
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#1b202b",
        minHeight: "100vh",
        color: "#ffffff",
      }}
    >
      {/* Title */}
      <div
        style={{
          textAlign: "center",
          paddingTop: "2rem",
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "600",
            color: "#ffffff",
            marginBottom: "0.5rem",
            lineHeight: "1.2",
          }}
        >
          🧠 Intelligent Prompt Composer
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#a0a0a0",
            marginBottom: 0,
            lineHeight: "1.6",
          }}
        >
          Transform your simple prompts into powerful, structured conversations.
          Get 10x better results from ChatGPT, Claude, Perplexity, and any AI
          platform.
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#2f2f2f",
          borderRadius: "16px",
          padding: "2.5rem",
          marginBottom: "2rem",
          border: "1px solid #404040",
          boxShadow:
            "0 10px 25px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* User Prompt Input */}
        <div style={{ marginBottom: "2rem" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "0.75rem",
              color: "#ffffff",
              fontSize: "1.1rem",
            }}
          >
            ✍️ Your Prompt
          </label>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Ask anything..."
            style={{
              width: "100%",
              border: "1px solid #404040",
              borderRadius: "12px",
              padding: "1.25rem",
              fontSize: "1rem",
              minHeight: "120px",
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              lineHeight: "1.5",
              backgroundColor: "#1a1a1a",
              color: "#ffffff",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#10a37f")}
            onBlur={(e) => (e.target.style.borderColor = "#404040")}
          />
          <p
            style={{
              fontSize: "0.85rem",
              color: "#a0a0a0",
              marginTop: "0.5rem",
              marginBottom: 0,
            }}
          >
            Write your question, task, or request. We'll enhance it with
            structured prompting elements below.
          </p>
        </div>

        {/* Quick Presets */}
        <div style={{ marginBottom: "2rem" }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            ⚡ Quick Presets
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                style={{
                  backgroundColor: "#3c3c3c",
                  color: "white",
                  border: "1px solid #404040",
                  borderRadius: "8px",
                  padding: "1rem 0.75rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#4a4a4a";
                  e.currentTarget.style.borderColor = "#10a37f";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#3c3c3c";
                  e.currentTarget.style.borderColor = "#404040";
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>{preset.icon}</span>
                <span style={{ fontSize: "0.85rem" }}>{preset.name}</span>
              </button>
            ))}
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "#6b7280",
              textAlign: "center",
              margin: 0,
            }}
          >
            Click a preset to instantly apply the best settings for your use
            case
          </p>
        </div>

        {/* Enhancement Options */}
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#343a46",
            borderRadius: "16px",
            marginBottom: "2rem",
            border: "1px solid #4a5568",
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            🎛️ Custom Settings
          </h3>

          <div
            style={{
              display: "grid",
              gap: "1.25rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {/* Role Input */}
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: "#e2e8f0",
                  fontSize: "0.9rem",
                }}
              >
                🎭 Act as
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                list="role-suggestions"
                placeholder="e.g., Senior Product Manager"
                style={{
                  width: "100%",
                  border: "2px solid #4a5568",
                  borderRadius: "10px",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  backgroundColor: "#2d3748",
                  color: "#ffffff",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#4a5568")}
              />
              <datalist id="role-suggestions">
                {roleExamples.map((example) => (
                  <option key={example} value={example} />
                ))}
              </datalist>
            </div>

            {/* Tone Select */}
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                }}
              >
                🎨 Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #404040",
                  borderRadius: "6px",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  backgroundColor: "#1a1a1a",
                  color: "#ffffff",
                  cursor: "pointer",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#10a37f")}
                onBlur={(e) => (e.target.style.borderColor = "#404040")}
              >
                <option>Formal</option>
                <option>Casual</option>
                <option>Playful</option>
                <option>Academic</option>
                <option>Concise</option>
                <option>Verbose</option>
              </select>
            </div>

            {/* Format Select */}
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                }}
              >
                📋 Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #404040",
                  borderRadius: "6px",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  backgroundColor: "#1a1a1a",
                  color: "#ffffff",
                  cursor: "pointer",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#10a37f")}
                onBlur={(e) => (e.target.style.borderColor = "#404040")}
              >
                <option>Markdown table</option>
                <option>JSON only</option>
                <option>Code block</option>
                <option>Mermaid diagram</option>
                <option>Plain text</option>
                <option>Bulleted list</option>
                <option>Step-by-step guide</option>
              </select>
            </div>

            {/* Verbosity Select */}
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                }}
              >
                📏 Detail Level
              </label>
              <select
                value={verbosity}
                onChange={(e) => setVerbosity(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #404040",
                  borderRadius: "6px",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  backgroundColor: "#1a1a1a",
                  color: "#ffffff",
                  cursor: "pointer",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#10a37f")}
                onBlur={(e) => (e.target.style.borderColor = "#404040")}
              >
                <option>Minimal</option>
                <option>Concise</option>
                <option>Balanced</option>
                <option>Verbose</option>
              </select>
            </div>

            {/* Thinking Mode Select */}
            <div style={{ gridColumn: "span 2" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                }}
              >
                🧠 Thinking Approach
              </label>
              <select
                value={thinking}
                onChange={(e) => setThinking(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #404040",
                  borderRadius: "6px",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  backgroundColor: "#1a1a1a",
                  color: "#ffffff",
                  cursor: "pointer",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#10a37f")}
                onBlur={(e) => (e.target.style.borderColor = "#404040")}
              >
                <option>Think Little / Fast</option>
                <option>Think Moderate / Careful</option>
                <option>Think Hard / Deep Analysis</option>
                <option>Creative / Divergent</option>
                <option>Skeptical / Adversarial</option>
              </select>
            </div>

            {/* Enhancement Toggles */}
            <div
              style={{
                gridColumn: "span 2",
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid #404040",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                }}
              >
                ⚡ Enhancement Modifiers
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {/* Be 100x Specific Toggle */}
                <div
                  onClick={() => setBe100xSpecific(!be100xSpecific)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    border: `1px solid ${
                      be100xSpecific ? "#10a37f" : "#404040"
                    }`,
                    borderRadius: "8px",
                    backgroundColor: be100xSpecific ? "#1a3a32" : "#3c3c3c",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!be100xSpecific) {
                      e.currentTarget.style.borderColor = "#10a37f";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!be100xSpecific) {
                      e.currentTarget.style.borderColor = "#404040";
                    }
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        color: "#ffffff",
                        marginBottom: "0.25rem",
                      }}
                    >
                      🎯 Be 100x Specific
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#a0a0a0" }}>
                      Demands ultra-detailed responses
                    </div>
                  </div>
                  <div
                    style={{
                      width: "48px",
                      height: "28px",
                      backgroundColor: be100xSpecific ? "#10a37f" : "#4a4a4a",
                      borderRadius: "14px",
                      position: "relative",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "#f1f5f9",
                        borderRadius: "50%",
                        position: "absolute",
                        top: "4px",
                        left: be100xSpecific ? "24px" : "4px",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </div>
                </div>

                {/* Laser Focused Action Oriented Toggle */}
                <div
                  onClick={() => setLaserFocused(!laserFocused)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    border: `1px solid ${laserFocused ? "#10a37f" : "#404040"}`,
                    borderRadius: "8px",
                    backgroundColor: laserFocused ? "#1a3a32" : "#3c3c3c",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!laserFocused) {
                      e.currentTarget.style.borderColor = "#10a37f";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!laserFocused) {
                      e.currentTarget.style.borderColor = "#404040";
                    }
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        color: "#ffffff",
                        marginBottom: "0.25rem",
                      }}
                    >
                      ⚡ Laser Focused Action Oriented
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#a0a0a0" }}>
                      Ensures actionable, specific outcomes
                    </div>
                  </div>
                  <div
                    style={{
                      width: "48px",
                      height: "28px",
                      backgroundColor: laserFocused ? "#10a37f" : "#4a4a4a",
                      borderRadius: "14px",
                      position: "relative",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "#f1f5f9",
                        borderRadius: "50%",
                        position: "absolute",
                        top: "4px",
                        left: laserFocused ? "24px" : "4px",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Prompt Preview */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "0.75rem",
              color: "#ffffff",
              fontSize: "1rem",
            }}
          >
            ✨ Enhanced Prompt
          </label>
          <textarea
            value={enhancedPrompt}
            readOnly
            style={{
              width: "100%",
              padding: "1.25rem",
              border: "1px solid #404040",
              borderRadius: "8px",
              height: "160px",
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: "0.9rem",
              backgroundColor: "#1a1a1a",
              resize: "none",
              lineHeight: "1.5",
              color: "#ffffff",
            }}
          />
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          <button
            id="copy-button"
            onClick={copyToClipboard}
            style={{
              backgroundColor: "#3c3c3c",
              color: "white",
              padding: "1rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #404040",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#4a4a4a";
              e.currentTarget.style.borderColor = "#10a37f";
            }}
            onMouseLeave={(e) => {
              if (e.currentTarget.textContent !== "✓ Copied!") {
                e.currentTarget.style.backgroundColor = "#3c3c3c";
                e.currentTarget.style.borderColor = "#404040";
              }
            }}
          >
            📋 Copy Prompt
          </button>

          <button
            onClick={openChatGPT}
            style={{
              backgroundColor: "#10a37f",
              color: "white",
              padding: "1rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #404040",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0d8d67";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#10a37f";
            }}
          >
            {React.createElement(SiOpenai, { size: 20 })}
            Open in ChatGPT
          </button>

          <button
            onClick={openClaude}
            style={{
              backgroundColor: "#10a37f",
              color: "white",
              padding: "1rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #404040",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0d8d67";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#10a37f";
            }}
          >
            {React.createElement(SiAnthropic, { size: 20 })}
            Open in Claude
          </button>

          <button
            onClick={openPerplexity}
            style={{
              backgroundColor: "#10a37f",
              color: "white",
              padding: "1rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #404040",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0d8d67";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#10a37f";
            }}
          >
            {React.createElement(SiPerplexity, { size: 20 })}
            Open in Perplexity
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.85rem",
            color: "#a0a0a0",
            marginTop: "1.5rem",
            marginBottom: 0,
            lineHeight: "1.4",
          }}
        >
          Copy the enhanced prompt or open it directly in your favorite AI
          platform! 🎯
        </p>
      </div>
    </div>
  );
};

export default PromptComposer;
