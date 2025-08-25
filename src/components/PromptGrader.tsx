import React, { useState } from "react";
import { SiOpenai, SiAnthropic } from "react-icons/si";

interface GradingResult {
  totalScore: number;
  breakdown: {
    hasGoal: number;
    hasConstraints: number;
    hasOutputFormat: number;
    hasEvaluationHint: number;
    hasGuardrails: number;
  };
}

interface RewriteResult {
  concise: string;
  structured: string;
  jsonStrict: string;
}

const PromptGrader: React.FC = () => {
  const [inputPrompt, setInputPrompt] = useState(
    "Help me write a blog post about artificial intelligence"
  );
  const [targetModel, setTargetModel] = useState("ChatGPT");
  const [goal, setGoal] = useState("");
  const [constraints, setConstraints] = useState("");
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(
    null
  );
  const [rewrites, setRewrites] = useState<RewriteResult | null>(null);
  const [activeTab, setActiveTab] = useState("grader");

  const gradePrompt = (prompt: string): GradingResult => {
    const breakdown = {
      hasGoal:
        prompt.toLowerCase().includes("write") ||
        prompt.toLowerCase().includes("create") ||
        prompt.toLowerCase().includes("generate") ||
        prompt.toLowerCase().includes("help me")
          ? 20
          : 0,
      hasConstraints: prompt.length > 50 ? 15 : 0,
      hasOutputFormat:
        prompt.toLowerCase().includes("format") ||
        prompt.toLowerCase().includes("structure") ||
        prompt.toLowerCase().includes("list") ||
        prompt.toLowerCase().includes("table")
          ? 20
          : 0,
      hasEvaluationHint:
        prompt.toLowerCase().includes("good") ||
        prompt.toLowerCase().includes("quality") ||
        prompt.toLowerCase().includes("detailed") ||
        prompt.toLowerCase().includes("comprehensive")
          ? 15
          : 0,
      hasGuardrails:
        prompt.toLowerCase().includes("professional") ||
        prompt.toLowerCase().includes("appropriate") ||
        prompt.toLowerCase().includes("avoid") ||
        prompt.toLowerCase().includes("ensure")
          ? 15
          : 0,
    };

    // Additional scoring based on length and specificity
    let lengthBonus = 0;
    if (prompt.length > 100) lengthBonus = 10;
    else if (prompt.length > 50) lengthBonus = 5;

    const totalScore =
      Object.values(breakdown).reduce((sum, score) => sum + score, 0) +
      lengthBonus;

    return {
      totalScore: Math.min(totalScore, 100),
      breakdown,
    };
  };

  const generateRewrites = (
    prompt: string,
    targetGoal?: string,
    targetConstraints?: string
  ): RewriteResult => {
    const basePrompt = prompt.trim();
    const goalText =
      targetGoal || "Create a comprehensive and informative response";
    const constraintsText =
      targetConstraints || "Be accurate, clear, and helpful";

    return {
      concise: `${basePrompt}. ${goalText}. Keep it concise and actionable. Focus on key points only.`,
      structured: `**Role**: Act as an expert content creator and advisor.

**Goal**: ${goalText}

**Context**: ${basePrompt}

**Constraints**: 
- ${constraintsText}
- Be comprehensive yet accessible
- Use clear structure and formatting

**Output Format**: Provide a well-organized response with clear sections and actionable insights.

**Evaluation**: Ensure the response is practical, well-researched, and directly addresses the request.`,
      jsonStrict: `You are a helpful assistant that responds only in valid JSON format.

Task: ${basePrompt}

Goal: ${goalText}

Constraints: ${constraintsText}

Output Schema:
{
  "response": "your main response content",
  "key_points": ["point 1", "point 2", "point 3"],
  "recommendations": ["rec 1", "rec 2", "rec 3"],
  "confidence_score": 0.95
}

Emit only valid JSON. No additional text or formatting outside the JSON structure.`,
    };
  };

  const handleGrade = () => {
    const result = gradePrompt(inputPrompt);
    setGradingResult(result);

    const rewriteResults = generateRewrites(inputPrompt, goal, constraints);
    setRewrites(rewriteResults);
  };

  const copyToClipboard = async (text: string, buttonId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      const button = document.getElementById(buttonId);
      if (button) {
        const originalText = button.textContent;
        button.textContent = "✓ Copied!";
        button.style.backgroundColor = "#10b981";
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = "#3c3c3c";
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Text copied to clipboard!");
    }
  };

  const openInChatGPT = (prompt: string) => {
    const url = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
    window.open(url, "_blank");
  };

  const openInClaude = (prompt: string) => {
    const url = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
    window.open(url, "_blank");
  };

  const examplePrompts = [
    {
      before: "Write a blog post about AI",
      after:
        "Act as a technology blogger with 5+ years of experience. Write a 1500-word blog post about the current state of artificial intelligence in 2025. Focus on practical applications, recent breakthroughs, and implications for businesses. Use a conversational tone, include 3-5 key statistics, and structure with clear headings. Target audience: business professionals with basic tech knowledge.",
      improvement:
        "Added role, word count, specific focus areas, tone, requirements, and target audience",
    },
    {
      before: "Help me with marketing",
      after:
        "Act as a senior digital marketing strategist. Create a comprehensive marketing strategy for a B2B SaaS startup in the project management space. Include: target audience analysis, content strategy, channel mix, budget allocation, and 6-month timeline. Focus on lead generation and brand awareness. Provide actionable tactics with expected ROI estimates.",
      improvement:
        "Specified role, industry context, deliverables, focus areas, and success metrics",
    },
    {
      before: "Code a website",
      after:
        "Act as a senior full-stack developer. Create a responsive landing page for a sustainable fashion brand using HTML, CSS, and vanilla JavaScript. Requirements: mobile-first design, hero section with video background, product showcase grid, customer testimonials carousel, and contact form. Include SEO optimization and accessibility features. Provide complete code with comments explaining key sections.",
      improvement:
        "Added technical specifications, feature requirements, best practices, and documentation needs",
    },
  ];

  return (
    <div
      className="max-w-6xl mx-auto"
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
          📊 Prompt Grader & Rewriter
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#a0a0a0",
            marginBottom: 0,
            lineHeight: "1.6",
          }}
        >
          Analyze, score, and transform your prompts into high-performing
          instructions. Get detailed feedback and professional rewrites
          instantly.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            backgroundColor: "#2f2f2f",
            borderRadius: "12px",
            padding: "0.5rem",
            border: "1px solid #404040",
          }}
        >
          {["grader", "examples", "faq"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                backgroundColor: activeTab === tab ? "#10a37f" : "transparent",
                color: activeTab === tab ? "#ffffff" : "#a0a0a0",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textTransform: "capitalize",
              }}
            >
              {tab === "grader" && "🔍 Grader"}
              {tab === "examples" && "📚 Examples"}
              {tab === "faq" && "❓ FAQ"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "grader" && (
        <div
          style={{
            backgroundColor: "#2f2f2f",
            borderRadius: "16px",
            padding: "2.5rem",
            marginBottom: "2rem",
            border: "1px solid #404040",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Input Section */}
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
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Enter your prompt to analyze and improve..."
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
          </div>

          {/* Configuration */}
          <div
            style={{
              display: "grid",
              gap: "1.25rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              marginBottom: "2rem",
            }}
          >
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
                🤖 Target Model
              </label>
              <select
                value={targetModel}
                onChange={(e) => setTargetModel(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #404040",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  backgroundColor: "#1a1a1a",
                  color: "#ffffff",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option>ChatGPT</option>
                <option>Claude</option>
                <option>Gemini</option>
                <option>Perplexity</option>
              </select>
            </div>

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
                🎯 Goal (Optional)
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What should the AI accomplish?"
                style={{
                  width: "100%",
                  border: "1px solid #404040",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  backgroundColor: "#1a1a1a",
                  color: "#ffffff",
                  outline: "none",
                }}
              />
            </div>

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
                ⚠️ Constraints (Optional)
              </label>
              <input
                type="text"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="Any limitations, requirements, or guidelines..."
                style={{
                  width: "100%",
                  border: "1px solid #404040",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  backgroundColor: "#1a1a1a",
                  color: "#ffffff",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Analyze Button */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <button
              onClick={handleGrade}
              style={{
                backgroundColor: "#10a37f",
                color: "white",
                padding: "1rem 2rem",
                borderRadius: "12px",
                border: "none",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0d8d67";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#10a37f";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              🔍 Analyze & Rewrite Prompt
            </button>
          </div>

          {/* Results */}
          {gradingResult && (
            <div
              style={{
                backgroundColor: "#343a46",
                borderRadius: "16px",
                padding: "2rem",
                marginBottom: "2rem",
                border: "1px solid #4a5568",
              }}
            >
              {/* Score Display */}
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div
                  style={{
                    fontSize: "3rem",
                    fontWeight: "700",
                    color:
                      gradingResult.totalScore >= 80
                        ? "#10b981"
                        : gradingResult.totalScore >= 60
                        ? "#f59e0b"
                        : "#ef4444",
                    marginBottom: "0.5rem",
                  }}
                >
                  {gradingResult.totalScore}/100
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    color: "#e2e8f0",
                    fontWeight: "500",
                  }}
                >
                  {gradingResult.totalScore >= 80
                    ? "🎉 Excellent Prompt!"
                    : gradingResult.totalScore >= 60
                    ? "⚡ Good Prompt"
                    : "🔧 Needs Improvement"}
                </div>
              </div>

              {/* Breakdown */}
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  marginBottom: "2rem",
                }}
              >
                {Object.entries(gradingResult.breakdown).map(([key, score]) => (
                  <div
                    key={key}
                    style={{
                      backgroundColor: "#2d3748",
                      padding: "1rem",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#a0aec0",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "600",
                        color: score > 0 ? "#10b981" : "#ef4444",
                      }}
                    >
                      {score > 0 ? "✓" : "✗"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rewrites */}
          {rewrites && (
            <div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#ffffff",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                ✨ Improved Versions
              </h3>

              <div style={{ display: "grid", gap: "1.5rem" }}>
                {/* Concise Version */}
                <div
                  style={{
                    backgroundColor: "#343a46",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    border: "1px solid #4a5568",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "#ffffff",
                        margin: 0,
                      }}
                    >
                      🎯 Concise Version (≤120 words)
                    </h4>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        id="copy-concise"
                        onClick={() =>
                          copyToClipboard(rewrites.concise, "copy-concise")
                        }
                        style={{
                          backgroundColor: "#3c3c3c",
                          color: "white",
                          border: "1px solid #404040",
                          borderRadius: "6px",
                          padding: "0.5rem 1rem",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => openInChatGPT(rewrites.concise)}
                        style={{
                          backgroundColor: "#10a37f",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.5rem 1rem",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        {React.createElement(SiOpenai, { size: 14 })} GPT
                      </button>
                      <button
                        onClick={() => openInClaude(rewrites.concise)}
                        style={{
                          backgroundColor: "#10a37f",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.5rem 1rem",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        {React.createElement(SiAnthropic, { size: 14 })} Claude
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#2d3748",
                      padding: "1rem",
                      borderRadius: "8px",
                      fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                      color: "#e2e8f0",
                    }}
                  >
                    {rewrites.concise}
                  </div>
                </div>

                {/* Structured Version */}
                <div
                  style={{
                    backgroundColor: "#343a46",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    border: "1px solid #4a5568",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "#ffffff",
                        margin: 0,
                      }}
                    >
                      📋 Structured Version
                    </h4>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        id="copy-structured"
                        onClick={() =>
                          copyToClipboard(
                            rewrites.structured,
                            "copy-structured"
                          )
                        }
                        style={{
                          backgroundColor: "#3c3c3c",
                          color: "white",
                          border: "1px solid #404040",
                          borderRadius: "6px",
                          padding: "0.5rem 1rem",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => openInChatGPT(rewrites.structured)}
                        style={{
                          backgroundColor: "#10a37f",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.5rem 1rem",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        {React.createElement(SiOpenai, { size: 14 })} GPT
                      </button>
                      <button
                        onClick={() => openInClaude(rewrites.structured)}
                        style={{
                          backgroundColor: "#10a37f",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.5rem 1rem",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        {React.createElement(SiAnthropic, { size: 14 })} Claude
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#2d3748",
                      padding: "1rem",
                      borderRadius: "8px",
                      fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                      color: "#e2e8f0",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {rewrites.structured}
                  </div>
                </div>

                {/* JSON Version */}
                <div
                  style={{
                    backgroundColor: "#343a46",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    border: "1px solid #4a5568",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "#ffffff",
                        margin: 0,
                      }}
                    >
                      🔧 JSON-Strict Version
                    </h4>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        id="copy-json"
                        onClick={() =>
                          copyToClipboard(rewrites.jsonStrict, "copy-json")
                        }
                        style={{
                          backgroundColor: "#3c3c3c",
                          color: "white",
                          border: "1px solid #404040",
                          borderRadius: "6px",
                          padding: "0.5rem 1rem",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => openInChatGPT(rewrites.jsonStrict)}
                        style={{
                          backgroundColor: "#10a37f",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.5rem 1rem",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        {React.createElement(SiOpenai, { size: 14 })} GPT
                      </button>
                      <button
                        onClick={() => openInClaude(rewrites.jsonStrict)}
                        style={{
                          backgroundColor: "#10a37f",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.5rem 1rem",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        {React.createElement(SiAnthropic, { size: 14 })} Claude
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#2d3748",
                      padding: "1rem",
                      borderRadius: "8px",
                      fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                      color: "#e2e8f0",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {rewrites.jsonStrict}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "examples" && (
        <div
          style={{
            backgroundColor: "#2f2f2f",
            borderRadius: "16px",
            padding: "2.5rem",
            marginBottom: "2rem",
            border: "1px solid #404040",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            📚 Before & After Examples
          </h3>

          <div style={{ display: "grid", gap: "2rem" }}>
            {examplePrompts.map((example, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#343a46",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid #4a5568",
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <h4
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#ef4444",
                      marginBottom: "0.5rem",
                    }}
                  >
                    ❌ Before (Score: ~20/100)
                  </h4>
                  <div
                    style={{
                      backgroundColor: "#2d3748",
                      padding: "1rem",
                      borderRadius: "8px",
                      fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      fontSize: "0.9rem",
                      color: "#e2e8f0",
                    }}
                  >
                    {example.before}
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <h4
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#10b981",
                      marginBottom: "0.5rem",
                    }}
                  >
                    ✅ After (Score: ~85/100)
                  </h4>
                  <div
                    style={{
                      backgroundColor: "#2d3748",
                      padding: "1rem",
                      borderRadius: "8px",
                      fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      fontSize: "0.9rem",
                      color: "#e2e8f0",
                    }}
                  >
                    {example.after}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#1a3a32",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #10b981",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#10b981",
                      fontWeight: "500",
                    }}
                  >
                    💡 Key Improvements: {example.improvement}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "faq" && (
        <div
          style={{
            backgroundColor: "#2f2f2f",
            borderRadius: "16px",
            padding: "2.5rem",
            marginBottom: "2rem",
            border: "1px solid #404040",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            ❓ Frequently Asked Questions
          </h3>

          <div style={{ display: "grid", gap: "1.5rem" }}>
            {[
              {
                question: "What is a good prompt score?",
                answer:
                  "• 80-100: Excellent - Professional, detailed, actionable\n• 60-79: Good - Clear intent but missing some elements\n• 40-59: Needs work - Vague or incomplete\n• 0-39: Poor - Too basic or unclear",
              },
              {
                question: "What are the key elements of a high-scoring prompt?",
                answer:
                  "1. Clear goal or objective\n2. Specific constraints and requirements\n3. Defined output format\n4. Evaluation criteria or success metrics\n5. Appropriate guardrails and context",
              },
              {
                question: "What are popular prompt 'cheat codes'?",
                answer:
                  "• 'Act as a [professional role]' - Sets expertise level\n• 'Think step by step' - Encourages reasoning\n• 'Before answering, consider...' - Adds reflection\n• 'Provide 3 options with pros/cons' - Structures output\n• 'Use [specific format]' - Controls presentation",
              },
              {
                question: "When should I use JSON-strict prompts?",
                answer:
                  "Use JSON prompts when you need:\n• Consistent data structure\n• Integration with APIs or databases\n• Automated processing of responses\n• Exact field requirements\n• Programmatic consumption of outputs",
              },
              {
                question: "How does the grading system work?",
                answer:
                  "The system analyzes your prompt for:\n• Goal clarity (20 points)\n• Output format specification (20 points)\n• Constraint definition (15 points)\n• Evaluation hints (15 points)\n• Guardrails and context (15 points)\n• Length and specificity bonus (15 points)",
              },
              {
                question: "Which rewrite version should I use?",
                answer:
                  "• Concise: Quick tasks, simple questions, mobile use\n• Structured: Complex projects, detailed work, collaboration\n• JSON-strict: Data extraction, API integration, automation\n\nStart with structured for most professional use cases.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#343a46",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid #4a5568",
                }}
              >
                <h4
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "#10a37f",
                    marginBottom: "1rem",
                  }}
                >
                  {faq.question}
                </h4>
                <div
                  style={{
                    fontSize: "0.95rem",
                    color: "#e2e8f0",
                    lineHeight: "1.6",
                    whiteSpace: "pre-line",
                  }}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptGrader;
