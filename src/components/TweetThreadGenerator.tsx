import React, { useState } from "react";

interface Tweet {
  id: number;
  content: string;
  length: number;
}

const TweetThreadGenerator: React.FC = () => {
  const [topic, setTopic] = useState(
    "The future of artificial intelligence and its impact on everyday life"
  );
  const [threadLength, setThreadLength] = useState("5-7 tweets");
  const [tone, setTone] = useState("Informative");
  const [audience, setAudience] = useState("General Tech Audience");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);

  const [generatedThread, setGeneratedThread] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-oss-20b:free");

  const modelOptions = [
    {
      id: "openai/gpt-oss-20b:free",
      name: "OpenAI GPT OSS 20B (Free)",
      description: "Default free model",
    },
    {
      id: "deepseek/deepseek-r1-0528:free",
      name: "DeepSeek R1 (Free)",
      description: "Advanced reasoning model",
    },
    {
      id: "deepseek/deepseek-chat-v3-0324:free",
      name: "DeepSeek Chat V3 (Free)",
      description: "Latest chat model",
    },
    {
      id: "z-ai/glm-4.5-air:free",
      name: "GLM 4.5 Air (Free)",
      description: "Lightweight efficient model",
    },
    {
      id: "moonshotai/kimi-k2:free",
      name: "Moonshot Kimi K2 (Free)",
      description: "Creative content model",
    },
    {
      id: "meta-llama/llama-3.3-70b-instruct:free",
      name: "Llama 3.3 70B (Free)",
      description: "Meta's instruction model",
    },
  ];

  const threadLengthOptions = [
    "3-5 tweets",
    "5-7 tweets",
    "7-10 tweets",
    "10-15 tweets",
  ];
  const toneOptions = [
    "Informative",
    "Conversational",
    "Professional",
    "Entertaining",
    "Educational",
    "Motivational",
  ];
  const audienceOptions = [
    "General Tech Audience",
    "Entrepreneurs",
    "Developers",
    "Marketers",
    "Students",
    "Business Leaders",
    "Creators",
  ];

  const presets = [
    {
      name: "🔥 Viral Tech",
      icon: "📱",
      tone: "Entertaining",
      audience: "General Tech Audience",
      threadLength: "7-10 tweets",
      color: "#1da1f2",
      example:
        "Latest breakthrough in AI technology that's changing everything",
    },
    {
      name: "📚 Educational",
      icon: "🎓",
      tone: "Educational",
      audience: "Students",
      threadLength: "5-7 tweets",
      color: "#8b5cf6",
      example: "Step-by-step guide to understanding machine learning",
    },
    {
      name: "💼 Business",
      icon: "💼",
      tone: "Professional",
      audience: "Business Leaders",
      threadLength: "5-7 tweets",
      color: "#10b981",
      example: "How AI is transforming business operations in 2025",
    },
    {
      name: "🚀 Startup",
      icon: "🚀",
      tone: "Motivational",
      audience: "Entrepreneurs",
      threadLength: "7-10 tweets",
      color: "#f59e0b",
      example: "Lessons learned from building a successful startup",
    },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    setTone(preset.tone);
    setAudience(preset.audience);
    setThreadLength(preset.threadLength);
  };

  const generateThread = async () => {
    if (!apiKey.trim()) {
      alert("Please enter your OpenRouter API key first.");
      setShowApiKeyInput(true);
      return;
    }

    setIsLoading(true);
    setGeneratedThread([]);

    const prompt = `Create a Twitter thread about: "${topic}"

Requirements:
- Length: ${threadLength}
- Tone: ${tone}
- Target audience: ${audience}
- ${includeHashtags ? "Include relevant hashtags" : "No hashtags"}
- ${
      includeCTA
        ? "Include a call-to-action in the final tweet"
        : "No call-to-action needed"
    }

Guidelines:
- Each tweet should be under 280 characters
- Start with a strong hook in the first tweet
- Use numbered format (1/n, 2/n, etc.)
- Make it engaging and valuable
- Use line breaks and emojis appropriately
- End with engaging conclusion${includeCTA ? " and clear CTA" : ""}

IMPORTANT: Respond with ONLY a valid JSON array. No markdown, no code blocks, no explanation. Just the raw JSON array.

Example format:
[
  {"content": "1/5 🚀 The future of AI is here! Here's what you need to know about the latest breakthroughs..."},
  {"content": "2/5 🧠 Machine learning models are getting smarter every day. They can now..."},
  {"content": "3/5 💡 This means businesses can now automate processes that were impossible before..."}
]

Your JSON array:`;

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://adityakarnam.com",
            "X-Title": "Tweet Thread Generator - AI Toolkit",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: "system",
                content:
                  "You are a professional social media content creator specializing in viral Twitter threads. You MUST respond with ONLY valid JSON array format. No markdown code blocks, no explanations, no additional text. Just the raw JSON array with tweet objects.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.8,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      console.log("Raw API response content:", content);

      // Clean the content and try to parse as JSON
      let tweets;
      try {
        // First try direct parsing
        tweets = JSON.parse(content);
        console.log("Successfully parsed JSON directly:", tweets);
      } catch (e) {
        console.log(
          "Direct JSON parsing failed, trying alternative methods..."
        );
        try {
          // Try to extract JSON from markdown code blocks
          const jsonMatch =
            content.match(/```json\s*([\s\S]*?)\s*```/) ||
            content.match(/```\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            tweets = JSON.parse(jsonMatch[1]);
            console.log("Successfully parsed JSON from code block:", tweets);
          } else {
            // Try to find JSON array in the response
            const arrayMatch = content.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
              tweets = JSON.parse(arrayMatch[0]);
              console.log("Successfully parsed JSON array from text:", tweets);
            } else {
              throw new Error("No valid JSON found");
            }
          }
        } catch (e2) {
          // Final fallback: extract tweets manually from numbered format
          console.warn(
            "Failed to parse JSON, falling back to manual parsing:",
            content
          );
          const lines = content
            .split("\n")
            .filter((line: string) => line.trim());
          const tweetLines = lines.filter(
            (line: string) =>
              /^\d+\/\d+/.test(line.trim()) || line.includes("/")
          );

          if (tweetLines.length === 0) {
            // If no numbered tweets, split by paragraphs
            const paragraphs = content
              .split("\n\n")
              .filter((p: string) => p.trim());
            tweets = paragraphs.map((p: string, index: number) => ({
              content: `${index + 1}/${paragraphs.length} ${p.trim()}`,
            }));
          } else {
            tweets = tweetLines.map((line: string) => ({
              content: line.trim(),
            }));
          }

          console.log("Fallback parsing result:", tweets);
        }
      }

      // Convert to our Tweet format
      const formattedTweets: Tweet[] = tweets.map(
        (tweet: any, index: number) => ({
          id: index + 1,
          content: tweet.content,
          length: tweet.content.length,
        })
      );

      setGeneratedThread(formattedTweets);
    } catch (error) {
      console.error("Error generating thread:", error);
      alert(
        "Failed to generate thread. Please check your API key and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyTweet = async (content: string, tweetId: number) => {
    try {
      await navigator.clipboard.writeText(content);
      const button = document.getElementById(`copy-${tweetId}`);
      if (button) {
        const originalText = button.textContent;
        button.textContent = "✓";
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const copyAllTweets = async () => {
    const allTweets = generatedThread
      .map((tweet) => tweet.content)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(allTweets);
      const button = document.getElementById("copy-all");
      if (button) {
        const originalText = button.textContent;
        button.textContent = "✓ All Copied!";
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const openInTwitter = (content: string) => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      content
    )}`;
    window.open(url, "_blank");
  };

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
      {/* Header */}
      <div style={{ textAlign: "center", padding: "2rem 0" }}>
        <div
          style={{
            fontSize: "3rem",
            marginBottom: "1rem",
          }}
        >
          🐦
        </div>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            background: "linear-gradient(135deg, #1da1f2 0%, #1d9bf0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "0.5rem",
          }}
        >
          Tweet Thread Generator
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#a0aec0",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Transform any topic into engaging Twitter threads that capture
          attention and drive engagement
        </p>
      </div>

      {/* API Key Input */}
      <div
        style={{
          backgroundColor: "#2d3748",
          borderRadius: "12px",
          padding: "1.5rem",
          margin: "1rem auto 2rem",
          maxWidth: "800px",
          border: "1px solid #4a5568",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: showApiKeyInput ? "1rem" : "0",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
              🔑 API Configuration
            </h3>
            <p
              style={{
                margin: "0.25rem 0 0 0",
                fontSize: "0.8rem",
                color: "#a0aec0",
              }}
            >
              Using:{" "}
              {modelOptions.find((m) => m.id === selectedModel)?.name ||
                selectedModel}
            </p>
          </div>
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            style={{
              background: "#4299e1",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            {showApiKeyInput ? "Hide" : "Configure"}
          </button>
        </div>

        {showApiKeyInput && (
          <div style={{ marginTop: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "#cbd5e0",
              }}
            >
              OpenRouter API Key (get free key at openrouter.ai)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #4a5568",
                backgroundColor: "#1a202c",
                color: "#ffffff",
                fontSize: "0.9rem",
              }}
            />
            <p
              style={{
                fontSize: "0.8rem",
                color: "#a0aec0",
                marginTop: "0.5rem",
                margin: "0.5rem 0 0 0",
              }}
            >
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>
        )}
      </div>

      {/* Quick Presets */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto 2rem",
          padding: "0 1rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.3rem",
            fontWeight: "600",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          ⚡ Quick Presets
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => applyPreset(preset)}
              style={{
                background: "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
                border: `2px solid ${preset.color}`,
                borderRadius: "12px",
                padding: "1rem",
                color: "#ffffff",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 25px ${preset.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  marginBottom: "0.5rem",
                }}
              >
                {preset.icon}
              </div>
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  marginBottom: "0.25rem",
                }}
              >
                {preset.name}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#a0aec0",
                  lineHeight: "1.2",
                }}
              >
                {preset.example}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Configuration */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "#2d3748",
            borderRadius: "16px",
            padding: "2rem",
            marginBottom: "2rem",
            border: "1px solid #4a5568",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            🎯 Configure Your Thread
          </h2>

          {/* Topic Input */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "1rem",
                fontWeight: "500",
                color: "#e2e8f0",
              }}
            >
              Topic or Main Message
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder="What do you want to create a thread about?"
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #4a5568",
                backgroundColor: "#1a202c",
                color: "#ffffff",
                fontSize: "1rem",
                resize: "vertical",
                minHeight: "80px",
              }}
            />
          </div>

          {/* Model Selection */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "1rem",
                fontWeight: "500",
                color: "#e2e8f0",
              }}
            >
              AI Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #4a5568",
                backgroundColor: "#1a202c",
                color: "#ffffff",
                fontSize: "1rem",
              }}
            >
              {modelOptions.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#a0aec0",
                marginTop: "0.5rem",
                margin: "0.5rem 0 0 0",
              }}
            >
              All models are completely free via OpenRouter
            </p>
          </div>

          {/* Configuration Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            {/* Thread Length */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#e2e8f0",
                }}
              >
                Thread Length
              </label>
              <select
                value={threadLength}
                onChange={(e) => setThreadLength(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #4a5568",
                  backgroundColor: "#1a202c",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                }}
              >
                {threadLengthOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#e2e8f0",
                }}
              >
                Tone & Style
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #4a5568",
                  backgroundColor: "#1a202c",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                }}
              >
                {toneOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Audience */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#e2e8f0",
                }}
              >
                Target Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #4a5568",
                  backgroundColor: "#1a202c",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                }}
              >
                {audienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              <input
                type="checkbox"
                checked={includeHashtags}
                onChange={(e) => setIncludeHashtags(e.target.checked)}
                style={{
                  width: "1.2rem",
                  height: "1.2rem",
                  accentColor: "#1da1f2",
                }}
              />
              Include Hashtags
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              <input
                type="checkbox"
                checked={includeCTA}
                onChange={(e) => setIncludeCTA(e.target.checked)}
                style={{
                  width: "1.2rem",
                  height: "1.2rem",
                  accentColor: "#1da1f2",
                }}
              />
              Include Call-to-Action
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateThread}
            disabled={isLoading || !topic.trim()}
            style={{
              width: "100%",
              background: isLoading
                ? "#4a5568"
                : "linear-gradient(135deg, #1da1f2 0%, #1d9bf0 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "1rem 2rem",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(29, 161, 242, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            🐦 {isLoading ? "Generating Thread..." : "Generate Thread"}
          </button>
        </div>

        {/* Results */}
        {generatedThread.length > 0 && (
          <div
            style={{
              backgroundColor: "#2d3748",
              borderRadius: "16px",
              padding: "2rem",
              border: "1px solid #4a5568",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "600",
                  margin: 0,
                }}
              >
                📝 Your Thread ({generatedThread.length} tweets)
              </h3>
              <button
                id="copy-all"
                onClick={copyAllTweets}
                style={{
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                📋 Copy All
              </button>
            </div>

            <div style={{ gap: "1rem" }}>
              {generatedThread.map((tweet) => (
                <div
                  key={tweet.id}
                  style={{
                    backgroundColor: "#1a202c",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    marginBottom: "1rem",
                    border: "1px solid #4a5568",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        background: "#1da1f2",
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: "500",
                      }}
                    >
                      Tweet {tweet.id}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: tweet.length > 280 ? "#f56565" : "#68d391",
                        fontWeight: "500",
                      }}
                    >
                      {tweet.length}/280
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.6",
                      marginBottom: "1rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {tweet.content}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      id={`copy-${tweet.id}`}
                      onClick={() => copyTweet(tweet.content, tweet.id)}
                      style={{
                        background: "#4a5568",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      📋
                    </button>
                    <button
                      onClick={() => openInTwitter(tweet.content)}
                      style={{
                        background: "#1da1f2",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      🐦 Tweet
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div
              style={{
                background: "rgba(29, 161, 242, 0.1)",
                border: "1px solid rgba(29, 161, 242, 0.3)",
                borderRadius: "8px",
                padding: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <h4
                style={{
                  margin: "0 0 0.5rem 0",
                  color: "#1da1f2",
                  fontSize: "0.9rem",
                }}
              >
                💡 Pro Tips:
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.2rem",
                  fontSize: "0.85rem",
                  color: "#cbd5e0",
                }}
              >
                <li>
                  Post tweets with 30-60 second intervals for better engagement
                </li>
                <li>
                  Pin the first tweet to your profile for maximum visibility
                </li>
                <li>Engage with replies quickly to boost the thread's reach</li>
                <li>Consider posting during peak hours for your audience</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "3rem 1rem 2rem",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            color: "#a0aec0",
            fontSize: "0.9rem",
            lineHeight: "1.6",
          }}
        >
          Create engaging Twitter threads that capture attention and drive
          meaningful conversations. Perfect for sharing insights, stories, and
          building your audience.
        </p>
      </div>
    </div>
  );
};

export default TweetThreadGenerator;
