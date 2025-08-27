import React from "react";
import {
  FaExternalLinkAlt,
  FaTrophy,
  FaCode,
  FaRocket,
  FaDatabase,
} from "react-icons/fa";

const SpotlightSection: React.FC = () => {
  const researchHighlights = [
    {
      title: "Novel Genetic Algorithm Research",
      description:
        "Presented my genetic algorithm work for community detection problem using ERBGA a novel algorithm.",
      url: "https://www.umsl.edu/cmpsci/dept-news-events/news-listings/hope-center.html",
      icon: "🧬",
      color: "#667eea",
    },
    {
      title: "Masters Winner Prize",
      description:
        "Masters Winner Prize for presenting my research work ERBGA.",
      url: "https://www.umsl.edu/cmpsci/dept-news-events/news-listings/grad-research-fair.html",
      icon: "🏆",
      color: "#f59e0b",
    },
    {
      title: "Midwest Bioinformatics Conference",
      description:
        "ERBGA Presentation at 2018 Midwest Bioinformatics Conference",
      url: "https://www.umsl.edu/cmpsci/dept-news-events/news-listings/midwest-bioinformatics.html",
      icon: "🎯",
      color: "#10b981",
    },
    {
      title: "Published Research Paper",
      description:
        "Efficient Reduced-Bias Genetic Algorithm (ERBGA) for Generic Community Detection Objectives",
      url: "https://profiles.umsl.edu/en/publications/efficient-reduced-bias-genetic-algorithm-erbga-for-generic-commun-2",
      icon: "📄",
      color: "#8b5cf6",
    },
  ];

  const articles = {
    "AI & Machine Learning": [
      {
        title: "Predicting Diabetes Types: A Deep Learning Approach",
        url: "https://dzone.com/articles/predicting-diabetes-types-deep-learning",
        platform: "DZone",
      },
      {
        title: "Building an AI-Powered Cold Email System With CrewAI",
        url: "https://dzone.com/articles/building-ai-powered-cold-email-system-with-crewai",
        platform: "DZone",
      },
      {
        title: "Building an AI-Powered Cold Email System with CrewAI",
        url: "https://levelup.gitconnected.com/building-an-ai-powered-cold-email-system-with-crewai-18925ab2d7fb?source=rss-68177ac3c0be------2",
        platform: "Level Up Coding",
      },
      {
        title:
          "Building Chat GPT from Scratch: A Journey into Conversational AI",
        url: "https://medium.com/@adityakarnam/building-chat-gpt-from-scratch-a-journey-into-conversational-ai-d301ed0d3cd2?source=rss-68177ac3c0be------2",
        platform: "Medium",
      },
      {
        title: "Building Custom Tools With Model Context Protocol",
        url: "https://dzone.com/articles/building-custom-tools-model-context-protocol",
        platform: "DZone",
      },
      {
        title: "Krutrim: India's indigenous LLM",
        url: "https://levelup.gitconnected.com/krutrim-indias-own-ai-chat-engine-8c962f4bcd58?source=rss-68177ac3c0be------2",
        platform: "Level Up Coding",
      },
      {
        title: "Building a Rust Command Line Interface to Chat with Llama 3.2",
        url: "https://levelup.gitconnected.com/building-a-rust-command-line-interface-to-chat-with-llama-3-2-c23380a5329e?source=rss-68177ac3c0be------2",
        platform: "Level Up Coding",
      },
      {
        title: "Part 1: Setup your LLM home server for under 100$",
        url: "https://levelup.gitconnected.com/setup-your-llm-home-server-for-under-100-edf44d44782a?source=rss-68177ac3c0be------2",
        platform: "Level Up Coding",
      },
    ],
    "Software Engineering": [
      {
        title: "Mastering Async Context Manager Mocking in Python Tests",
        url: "https://dzone.com/articles/mastering-async-context-manager-mocking-in-python",
        platform: "DZone",
      },
      {
        title:
          "Beyond Sequential: Why Rust's Threading Model Changed How I Think About Concurrent Programming",
        url: "https://levelup.gitconnected.com/beyond-sequential-why-rusts-threading-model-changed-how-i-think-about-concurrent-programming-475b11e8cafe?source=rss-68177ac3c0be------2",
        platform: "Level Up Coding",
      },
      {
        title:
          "Why You Should Use ZSTD Instead of GZIP or ZLIB to Compress Data",
        url: "https://levelup.gitconnected.com/why-you-should-use-zstd-instead-of-gzip-or-zlib-to-compress-data-971e9b27f8c7?source=rss-68177ac3c0be------2",
        platform: "Level Up Coding",
      },
      {
        title: "Leveraging Feature Flags for Dynamic Route Handling in FastAPI",
        url: "https://levelup.gitconnected.com/leveraging-feature-flags-for-dynamic-route-handling-in-fastapi-1f0a40bf8be6?source=rss-68177ac3c0be------2",
        platform: "Level Up Coding",
      },
    ],
    "Blockchain & Data": [
      {
        title:
          "Writing a simple blockchain oracle contract, oracle server, and client in under 5 mins",
        url: "https://levelup.gitconnected.com/writing-a-simple-blockchain-oracle-contract-oracle-server-and-client-in-under-5-mins-7ec8ee33df91?source=rss-68177ac3c0be------2",
        platform: "Level Up Coding",
      },
      {
        title:
          "Exploring Chandrayaan 3 Satellite Data: Tracking Altitude with JavaScript",
        url: "https://levelup.gitconnected.com/exploring-chandrayaan-3-satellite-data-tracking-altitude-with-javascript-1fce4d3526d0?source=rss-68177ac3c0be------2",
        platform: "Level Up Coding",
      },
    ],
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AI & Machine Learning":
        return "🤖";
      case "Software Engineering":
        return "⚙️";
      case "Blockchain & Data":
        return "⛓️";
      default:
        return "📚";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AI & Machine Learning":
        return "#667eea";
      case "Software Engineering":
        return "#10b981";
      case "Blockchain & Data":
        return "#f59e0b";
      default:
        return "#8b5cf6";
    }
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#1b202b",
        minHeight: "100vh",
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
            "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
          pointerEvents: "none",
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
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "1rem",
              lineHeight: "1.1",
            }}
          >
            🎯 Spotlight
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              color: "#a0aec0",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Research achievements, publications, and technical contributions
            that showcase the intersection of AI, software engineering, and
            innovative problem-solving.
          </p>
        </div>

        {/* Research Highlights */}
        <div style={{ marginBottom: "4rem" }}>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            🏆 Research Highlights
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
              marginBottom: "3rem",
            }}
          >
            {researchHighlights.map((highlight, index) => (
              <a
                key={index}
                href={highlight.url}
                target="_blank"
                rel="noopener noreferrer"
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
                  transition: "all 0.3s ease",
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
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
                    background: `linear-gradient(90deg, ${highlight.color} 0%, ${highlight.color}80 100%)`,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>{highlight.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: "700",
                        color: "#ffffff",
                        marginBottom: "0.5rem",
                        lineHeight: "1.3",
                      }}
                    >
                      {highlight.title}
                    </h3>
                  </div>
                  {React.createElement(FaExternalLinkAlt, {
                    style: { color: "#667eea", fontSize: "1rem" },
                  })}
                </div>

                <p
                  style={{
                    color: "#a0aec0",
                    lineHeight: "1.6",
                    marginBottom: "0",
                    fontSize: "0.95rem",
                  }}
                >
                  {highlight.description}
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* Technical Articles */}
        <div>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            📚 Technical Articles
          </h2>

          {Object.entries(articles).map(
            ([category, categoryArticles], categoryIndex) => (
              <div key={categoryIndex} style={{ marginBottom: "3rem" }}>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#ffffff",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>
                    {getCategoryIcon(category)}
                  </span>
                  {category}
                  <span
                    style={{
                      backgroundColor: getCategoryColor(category),
                      color: "#ffffff",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      padding: "0.2rem 0.8rem",
                      borderRadius: "12px",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {categoryArticles.length}
                  </span>
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {categoryArticles.map((article, articleIndex) => (
                    <a
                      key={articleIndex}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "rgba(47, 47, 47, 0.5)",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        border: "1px solid #404040",
                        backdropFilter: "blur(10px)",
                        transition: "all 0.3s ease",
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(47, 47, 47, 0.8)";
                        e.currentTarget.style.borderColor =
                          getCategoryColor(category);
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(47, 47, 47, 0.5)";
                        e.currentTarget.style.borderColor = "#404040";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "1rem",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h4
                            style={{
                              fontSize: "1rem",
                              fontWeight: "600",
                              color: "#ffffff",
                              marginBottom: "0.5rem",
                              lineHeight: "1.4",
                            }}
                          >
                            {article.title}
                          </h4>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: getCategoryColor(category),
                              fontWeight: "500",
                            }}
                          >
                            {article.platform}
                          </span>
                        </div>
                        {React.createElement(FaExternalLinkAlt, {
                          style: {
                            color: "#667eea",
                            fontSize: "0.9rem",
                            flexShrink: 0,
                            marginTop: "0.2rem",
                          },
                        })}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotlightSection;
