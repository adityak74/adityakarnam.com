import React, { useState } from "react";
import { SiAnthropic } from "react-icons/si";

interface GradingResult {
  totalScore: number;
  breakdown: {
    hasStoryGoal: number;
    hasVoiceAndPOV: number;
    hasStructureArc: number;
    hasCreativeConstraints: number;
    hasFormatLength: number;
  };
}

interface RewriteResult {
  concise: string;
  structured: string;
  sceneOutline: string;
}

const ACCENT = "#CC785C";
const ACCENT_DARK = "#B3654A";

const FablePromptGrader: React.FC = () => {
  const [inputPrompt, setInputPrompt] = useState(
    "Write a short story about a lighthouse keeper who finds a message in a bottle"
  );
  const [genre, setGenre] = useState("");
  const [voice, setVoice] = useState("");
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(
    null
  );
  const [rewrites, setRewrites] = useState<RewriteResult | null>(null);
  const [activeTab, setActiveTab] = useState("grader");

  const gradePrompt = (prompt: string): GradingResult => {
    const lower = prompt.toLowerCase();

    const breakdown = {
      hasStoryGoal:
        lower.includes("write") ||
        lower.includes("story") ||
        lower.includes("scene") ||
        lower.includes("chapter") ||
        lower.includes("about")
          ? 20
          : 0,
      hasVoiceAndPOV:
        lower.includes("voice") ||
        lower.includes("tone") ||
        lower.includes("perspective") ||
        lower.includes("first person") ||
        lower.includes("third person") ||
        lower.includes("narrator")
          ? 20
          : 0,
      hasStructureArc:
        lower.includes("beginning") ||
        lower.includes("ending") ||
        lower.includes("twist") ||
        lower.includes("arc") ||
        lower.includes("climax") ||
        lower.includes("structure")
          ? 20
          : 0,
      hasCreativeConstraints:
        lower.includes("genre") ||
        lower.includes("setting") ||
        lower.includes("character") ||
        lower.includes("mood") ||
        lower.includes("style") ||
        lower.includes("avoid")
          ? 20
          : 0,
      hasFormatLength:
        lower.includes("word") ||
        lower.includes("page") ||
        lower.includes("paragraph") ||
        lower.includes("short") ||
        lower.includes("long") ||
        /\d/.test(prompt)
          ? 20
          : 0,
    };

    const totalScore = Object.values(breakdown).reduce(
      (sum, score) => sum + score,
      0
    );

    return {
      totalScore: Math.min(totalScore, 100),
      breakdown,
    };
  };

  const generateRewrites = (
    prompt: string,
    targetGenre?: string,
    targetVoice?: string
  ): RewriteResult => {
    const basePrompt = prompt.trim();
    const genreText = targetGenre || "literary fiction with a quiet, atmospheric mood";
    const voiceText = targetVoice || "close third person, warm and observant";

    return {
      concise: `${basePrompt}. Write in the style of ${genreText}, using a ${voiceText} narrative voice. Keep it to roughly 400-600 words with a clear emotional turn near the end.`,
      structured: `**Role**: Act as a skilled fiction writer working with Claude's Fable model.

**Story Goal**: ${basePrompt}

**Genre & Mood**: ${genreText}

**Voice & POV**: ${voiceText}

**Structure**:
- A grounded opening that establishes place and character
- A middle that raises a question, tension, or discovery
- An ending that resolves emotionally, not just plot-wise

**Constraints**:
- Show, don't tell — reveal feeling through action and detail
- Avoid clichés and stock phrasing
- Keep dialogue (if any) sparse and purposeful

**Output Format**: A single continuous piece of prose, 500-800 words, broken into natural paragraphs.`,
      sceneOutline: `You are drafting a story for Claude's Fable model, scene by scene.

Premise: ${basePrompt}

Genre & Mood: ${genreText}
Voice & POV: ${voiceText}

Break the story into 3-5 beats before writing:
1. Opening image — where we are, who we're with
2. Inciting detail — what disrupts the ordinary
3. Turn — what the character realizes or decides
4. Resolution — the emotional landing point

For each beat, write 1-2 sentences of outline, then write the full scene in prose. Keep total length under 700 words. Do not summarize — write the scenes themselves.`,
    };
  };

  const handleGrade = () => {
    const result = gradePrompt(inputPrompt);
    setGradingResult(result);

    const rewriteResults = generateRewrites(inputPrompt, genre, voice);
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
          button.style.backgroundColor = "#F7F4EE";
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Text copied to clipboard!");
    }
  };

  const openInClaude = (prompt: string) => {
    const url = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
    window.open(url, "_blank");
  };

  const examplePrompts = [
    {
      before: "Write a story about a robot",
      after:
        "Act as a skilled fiction writer. Write a 600-word short story, first person, about a household robot who begins noticing gaps in its own memory. Genre: quiet science fiction, melancholic but hopeful. Structure: grounded opening, a discovery mid-story, an emotional (not just plot) resolution. Avoid clichés like 'I am not just a machine.'",
      improvement:
        "Added POV, genre, mood, structure, length target, and an explicit style constraint",
    },
    {
      before: "Write a fantasy story",
      after:
        "Act as a fantasy novelist. Write a 500-word scene, third person limited, following a young blacksmith who realizes the sword she's forging is cursed. Tone: tense, grounded fantasy, minimal magic-system exposition. End the scene on a decision, not a resolution — this is one scene in a longer story.",
      improvement:
        "Specified POV, tone, scope (one scene vs. full story), and where the scene should end",
    },
    {
      before: "Write something scary",
      after:
        "Act as a horror short-fiction writer. Write a 400-word story in second person about someone who keeps finding the same photograph in different rooms of their house. Mood: slow-building dread, restrained — no jump scares, no gore. End ambiguously.",
      improvement:
        "Added POV, concrete premise, explicit tone restraint, and an ending instruction",
    },
  ];

  return (
    <div
      className="max-w-6xl mx-auto"
      style={{
        fontFamily: "'Styrene A', 'Styrene B', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        color: "#1A1A18",
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
            color: "#1A1A18",
            marginBottom: "0.5rem",
            lineHeight: "1.2",
          }}
        >
          📖 Fable Prompt Grader for Claude
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#6B6B63",
            marginBottom: 0,
            lineHeight: "1.6",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          Score and rewrite creative writing prompts for Claude's Fable model.
          Get feedback on voice, structure, and constraints — then a
          ready-to-paste rewrite for your next story.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            backgroundColor: "#F7F4EE",
            borderRadius: "12px",
            padding: "0.5rem",
            border: "1px solid #D8D4CC",
          }}
        >
          {["grader", "examples", "faq"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                backgroundColor: activeTab === tab ? ACCENT : "transparent",
                color: activeTab === tab ? "#1A1A18" : "#6B6B63",
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
            backgroundColor: "#F7F4EE",
            borderRadius: "16px",
            padding: "2.5rem",
            marginBottom: "2rem",
            border: "1px solid #D8D4CC",
            boxShadow: "0 10px 25px rgba(26,26,24,0.08)",
          }}
        >
          {/* Input Section */}
          <div style={{ marginBottom: "2rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "0.75rem",
                color: "#1A1A18",
                fontSize: "1.1rem",
              }}
            >
              ✍️ Your Story Prompt
            </label>
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Enter your creative writing prompt to analyze and improve..."
              style={{
                width: "100%",
                border: "1px solid #D8D4CC",
                borderRadius: "12px",
                padding: "1.25rem",
                fontSize: "1rem",
                minHeight: "120px",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                lineHeight: "1.5",
                backgroundColor: "#FFFFFF",
                color: "#1A1A18",
              }}
              onFocus={(e) => (e.target.style.borderColor = ACCENT)}
              onBlur={(e) => (e.target.style.borderColor = "#D8D4CC")}
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
                  color: "#1A1A18",
                  fontSize: "0.9rem",
                }}
              >
                🎭 Genre & Mood (Optional)
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. quiet sci-fi, tense horror, warm literary fiction"
                style={{
                  width: "100%",
                  border: "1px solid #D8D4CC",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  backgroundColor: "#FFFFFF",
                  color: "#1A1A18",
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
                  color: "#1A1A18",
                  fontSize: "0.9rem",
                }}
              >
                🗣️ Voice & POV (Optional)
              </label>
              <input
                type="text"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                placeholder="e.g. first person, close third, wry and observant"
                style={{
                  width: "100%",
                  border: "1px solid #D8D4CC",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                  backgroundColor: "#FFFFFF",
                  color: "#1A1A18",
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
                backgroundColor: ACCENT,
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
                e.currentTarget.style.backgroundColor = ACCENT_DARK;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = ACCENT;
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
                backgroundColor: "#F7F4EE",
                borderRadius: "16px",
                padding: "2rem",
                marginBottom: "2rem",
                border: "1px solid #D8D4CC",
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
                    color: "#1A1A18",
                    fontWeight: "500",
                  }}
                >
                  {gradingResult.totalScore >= 80
                    ? "🎉 Ready to write!"
                    : gradingResult.totalScore >= 60
                    ? "⚡ Good foundation"
                    : "🔧 Needs more craft direction"}
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
                      backgroundColor: "#F7F4EE",
                      padding: "1rem",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#6B6B63",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {key
                        .replace(/^has/, "")
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
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
                  color: "#1A1A18",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                ✨ Improved Versions
              </h3>

              <div style={{ display: "grid", gap: "1.5rem" }}>
                {[
                  {
                    key: "concise",
                    id: "copy-concise",
                    title: "🎯 Concise Version (single instruction)",
                    text: rewrites.concise,
                    pre: false,
                  },
                  {
                    key: "structured",
                    id: "copy-structured",
                    title: "📋 Structured Version",
                    text: rewrites.structured,
                    pre: true,
                  },
                  {
                    key: "sceneOutline",
                    id: "copy-scene",
                    title: "🎬 Scene-by-Scene Version",
                    text: rewrites.sceneOutline,
                    pre: true,
                  },
                ].map((block) => (
                  <div
                    key={block.key}
                    style={{
                      backgroundColor: "#F7F4EE",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      border: "1px solid #D8D4CC",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          color: "#1A1A18",
                          margin: 0,
                        }}
                      >
                        {block.title}
                      </h4>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          id={block.id}
                          onClick={() => copyToClipboard(block.text, block.id)}
                          style={{
                            backgroundColor: "#F7F4EE",
                            color: "#1A1A18",
                            border: "1px solid #D8D4CC",
                            borderRadius: "6px",
                            padding: "0.5rem 1rem",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={() => openInClaude(block.text)}
                          style={{
                            backgroundColor: ACCENT,
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
                        backgroundColor: "#F7F4EE",
                        padding: "1rem",
                        borderRadius: "8px",
                        fontFamily: "ui-monospace, SFMono-Regular, monospace",
                        fontSize: "0.9rem",
                        lineHeight: "1.5",
                        color: "#1A1A18",
                        whiteSpace: block.pre ? "pre-line" : "normal",
                      }}
                    >
                      {block.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "examples" && (
        <div
          style={{
            backgroundColor: "#F7F4EE",
            borderRadius: "16px",
            padding: "2.5rem",
            marginBottom: "2rem",
            border: "1px solid #D8D4CC",
            boxShadow: "0 10px 25px rgba(26,26,24,0.08)",
          }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1A1A18",
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
                  backgroundColor: "#F7F4EE",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid #D8D4CC",
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
                      backgroundColor: "#F7F4EE",
                      padding: "1rem",
                      borderRadius: "8px",
                      fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      fontSize: "0.9rem",
                      color: "#1A1A18",
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
                    ✅ After (Score: ~90/100)
                  </h4>
                  <div
                    style={{
                      backgroundColor: "#F7F4EE",
                      padding: "1rem",
                      borderRadius: "8px",
                      fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      fontSize: "0.9rem",
                      color: "#1A1A18",
                    }}
                  >
                    {example.after}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#F5EAE3",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: `1px solid ${ACCENT}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: ACCENT,
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
            backgroundColor: "#F7F4EE",
            borderRadius: "16px",
            padding: "2.5rem",
            marginBottom: "2rem",
            border: "1px solid #D8D4CC",
            boxShadow: "0 10px 25px rgba(26,26,24,0.08)",
          }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1A1A18",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            ❓ Frequently Asked Questions
          </h3>

          <div style={{ display: "grid", gap: "1.5rem" }}>
            {[
              {
                question: "What is Claude's Fable model?",
                answer:
                  "Fable is a Claude model tuned for creative writing and narrative generation — short stories, scenes, and other fiction. Prompts written for it benefit from explicit voice, structure, and mood direction, the same way you'd brief a human writer.",
              },
              {
                question: "What makes a good fiction prompt score well here?",
                answer:
                  "1. A clear story goal or premise\n2. Explicit voice and point of view\n3. A sense of structure (opening, turn, ending)\n4. Creative constraints — genre, mood, things to avoid\n5. A length or format target",
              },
              {
                question: "Why does specifying POV and voice matter so much?",
                answer:
                  "Fiction models default to safe, generic narration without direction. Naming a POV ('close third person') and a voice ('wry, observant') anchors word choice, sentence rhythm, and psychic distance from the first line.",
              },
              {
                question: "Should I write full scenes or ask for outlines?",
                answer:
                  "For short pieces, ask directly for prose. For anything longer than a page, use the scene-by-scene version — it asks Fable to outline each beat briefly before writing, which keeps pacing and structure under control.",
              },
              {
                question: "How does the grading system work?",
                answer:
                  "The system checks your prompt for five signals:\n• Story goal or premise (20 points)\n• Voice & POV direction (20 points)\n• Structure/arc cues (20 points)\n• Creative constraints — genre, mood, things to avoid (20 points)\n• Format or length target (20 points)",
              },
              {
                question: "Which rewrite version should I use?",
                answer:
                  "• Concise: quick single-instruction prompts for short pieces\n• Structured: full craft brief for a standalone short story\n• Scene-by-scene: longer pieces where pacing and structure matter\n\nStart with structured for most creative writing tasks.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#F7F4EE",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid #D8D4CC",
                }}
              >
                <h4
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: ACCENT,
                    marginBottom: "1rem",
                  }}
                >
                  {faq.question}
                </h4>
                <div
                  style={{
                    fontSize: "0.95rem",
                    color: "#1A1A18",
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

export default FablePromptGrader;
