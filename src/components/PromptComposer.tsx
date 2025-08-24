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
  const [thinking, setThinking] = useState("Careful / Stepwise");
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
      thinking: "Careful / Stepwise",
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
      thinking: "Analytical / Structured",
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
      thinking: "Analytical / Structured",
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
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "800",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            marginBottom: "0.5rem",
            lineHeight: "1.2",
          }}
        >
          🧠 Intelligent Prompt Composer
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#6b7280",
            marginBottom: 0,
            lineHeight: "1.6",
          }}
        >
          Supercharge your AI conversations with ChatGPT, Claude, Perplexity &
          more
        </p>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "24px",
          padding: "2px",
          marginBottom: "2rem",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "22px",
            padding: "2.5rem",
          }}
        >
          {/* User Prompt Input */}
          <div style={{ marginBottom: "2rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "0.75rem",
                color: "#374151",
                fontSize: "1.1rem",
              }}
            >
              ✍️ Your Prompt
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter your prompt here... e.g., 'Help me create a marketing strategy for our new product launch'"
              style={{
                width: "100%",
                border: "2px solid #e5e7eb",
                borderRadius: "16px",
                padding: "1.25rem",
                fontSize: "1rem",
                minHeight: "120px",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                lineHeight: "1.5",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
            <p
              style={{
                fontSize: "0.85rem",
                color: "#6b7280",
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
                color: "#374151",
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
                    backgroundColor: preset.color,
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "1rem 0.75rem",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px -2px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 4px -1px rgba(0, 0, 0, 0.1)";
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
              backgroundColor: "#f8fafc",
              borderRadius: "16px",
              marginBottom: "2rem",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#374151",
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
                    color: "#374151",
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
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "0.75rem",
                    fontSize: "0.9rem",
                    backgroundColor: "white",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
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
                    color: "#374151",
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
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "0.75rem",
                    fontSize: "0.9rem",
                    backgroundColor: "white",
                    cursor: "pointer",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
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
                    color: "#374151",
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
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "0.75rem",
                    fontSize: "0.9rem",
                    backgroundColor: "white",
                    cursor: "pointer",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
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
                    color: "#374151",
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
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "0.75rem",
                    fontSize: "0.9rem",
                    backgroundColor: "white",
                    cursor: "pointer",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
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
                    color: "#374151",
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
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "0.75rem",
                    fontSize: "0.9rem",
                    backgroundColor: "white",
                    cursor: "pointer",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                >
                  <option>Shallow / Fast</option>
                  <option>Careful / Stepwise</option>
                  <option>Skeptical / Adversarial</option>
                  <option>Creative / Divergent</option>
                  <option>Analytical / Structured</option>
                </select>
              </div>

              {/* Enhancement Toggles */}
              <div
                style={{
                  gridColumn: "span 2",
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "1rem",
                    color: "#374151",
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
                      border: `2px solid ${
                        be100xSpecific ? "#10b981" : "#e5e7eb"
                      }`,
                      borderRadius: "12px",
                      backgroundColor: be100xSpecific ? "#ecfdf5" : "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!be100xSpecific) {
                        e.currentTarget.style.borderColor = "#3b82f6";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!be100xSpecific) {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                      }
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "0.9rem",
                          color: "#374151",
                          marginBottom: "0.25rem",
                        }}
                      >
                        🎯 Be 100x Specific
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        Demands ultra-detailed responses
                      </div>
                    </div>
                    <div
                      style={{
                        width: "48px",
                        height: "28px",
                        backgroundColor: be100xSpecific ? "#10b981" : "#d1d5db",
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
                          backgroundColor: "white",
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
                      border: `2px solid ${
                        laserFocused ? "#f59e0b" : "#e5e7eb"
                      }`,
                      borderRadius: "12px",
                      backgroundColor: laserFocused ? "#fffbeb" : "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!laserFocused) {
                        e.currentTarget.style.borderColor = "#3b82f6";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!laserFocused) {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                      }
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "0.9rem",
                          color: "#374151",
                          marginBottom: "0.25rem",
                        }}
                      >
                        ⚡ Laser Focused Action Oriented
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        Ensures actionable, specific outcomes
                      </div>
                    </div>
                    <div
                      style={{
                        width: "48px",
                        height: "28px",
                        backgroundColor: laserFocused ? "#f59e0b" : "#d1d5db",
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
                          backgroundColor: "white",
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
                color: "#374151",
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
                border: "2px solid #e5e7eb",
                borderRadius: "16px",
                height: "160px",
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                fontSize: "0.9rem",
                backgroundColor: "#f8fafc",
                resize: "none",
                lineHeight: "1.5",
                color: "#1f2937",
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
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                border: "none",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2563eb";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                if (e.currentTarget.textContent !== "✓ Copied!") {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                }
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              📋 Copy Prompt
            </button>

            <button
              onClick={openChatGPT}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                border: "none",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 15px -3px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
              }}
            >
              {React.createElement(SiOpenai, { size: 20 })}
              Open in ChatGPT
            </button>

            <button
              onClick={openClaude}
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "white",
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                border: "none",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 15px -3px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
              }}
            >
              {React.createElement(SiAnthropic, { size: 20 })}
              Open in Claude
            </button>

            <button
              onClick={openPerplexity}
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                color: "white",
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                border: "none",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 15px -3px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
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
              color: "#6b7280",
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
    </div>
  );
};

export default PromptComposer;
