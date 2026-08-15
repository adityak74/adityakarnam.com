/** @jsx jsx */
import * as React from "react"
import { Box, Flex, Text, jsx } from "theme-ui"
import { VISITOR_LENSES, type VisitorLens } from "./hero-chat/hero-chat-types"

type SourceLink = { label: string; href: string }
type ChatMessage = { role: "user" | "assistant"; content: string; sources?: SourceLink[] }

const HeroChat = () => {
  const [persona, setPersona] = React.useState<VisitorLens>("AI Researcher")
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const sendMessage = async () => {
    const content = input.trim()
    if (!content || loading) return

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/hero-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          messages: nextMessages.map(({ role, content: messageContent }) => ({ role, content: messageContent })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Hero chat request failed with ${response.status}`)
      }

      const payload = await response.json()
      setMessages((current) => [...current, { role: "assistant", content: payload.text, sources: payload.sources }])
    } catch (_error) {
      setError("Could not reach the assistant. Try again in a moment.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divide",
        borderRadius: "10px",
        background: "#FFFFFF",
        p: [4, 5],
        mb: [5, 6],
      }}
    >
      <Text
        sx={{
          display: "inline-block",
          color: "secondary",
          fontFamily: "monospace",
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          mb: 2,
        }}
      >
        Ask about the work
      </Text>

      <Flex sx={{ gap: 2, flexWrap: "wrap", mb: 3 }}>
        {VISITOR_LENSES.map((lens) => (
          <Box
            as="button"
            key={lens}
            type="button"
            onClick={() => setPersona(lens)}
            sx={{
              borderRadius: "999px",
              border: "1px solid",
              borderColor: lens === persona ? "primary" : "divide",
              background: lens === persona ? "primary" : "transparent",
              color: lens === persona ? "#ffffff" : "secondary",
              px: 3,
              py: 1,
              fontSize: 0,
              cursor: "pointer",
            }}
          >
            {lens}
          </Box>
        ))}
      </Flex>

      <Box sx={{ display: "grid", gap: 3, mb: 3, minHeight: "8rem" }}>
        {messages.length === 0 ? (
          <Text sx={{ color: "secondary", fontSize: "17px", lineHeight: 1.65 }}>
            Ask about projects, research direction, or what a recruiter, engineer, or researcher should know about
            this work.
          </Text>
        ) : (
          messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                justifySelf: message.role === "user" ? "end" : "start",
                maxWidth: "80%",
                background: message.role === "user" ? "primary" : "muted",
                color: message.role === "user" ? "#ffffff" : "text",
                borderRadius: "12px",
                p: 3,
              }}
            >
              <Text sx={{ fontSize: "17px", lineHeight: 1.6 }}>{message.content}</Text>
              {message.sources && message.sources.length > 0 ? (
                <Flex sx={{ gap: 2, flexWrap: "wrap", mt: 2 }}>
                  {message.sources.map((source) => (
                    <a
                      key={source.href}
                      href={source.href}
                      sx={{
                        fontSize: "0.8rem",
                        color: message.role === "user" ? "#ffffff" : "primary",
                        textDecoration: "underline",
                      }}
                    >
                      {source.label}
                    </a>
                  ))}
                </Flex>
              ) : null}
            </Box>
          ))
        )}
      </Box>

      {error ? <Text sx={{ color: "primary", fontSize: 0, mb: 2 }}>{error}</Text> : null}

      <Flex sx={{ gap: 2 }}>
        <Box
          as="input"
          value={input}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
              void sendMessage()
            }
          }}
          placeholder="Ask about the work..."
          sx={{
            flex: 1,
            border: "1px solid",
            borderColor: "divide",
            borderRadius: "8px",
            px: 3,
            py: 2,
            fontSize: "17px",
            background: "transparent",
            color: "text",
          }}
        />
        <Box
          as="button"
          type="button"
          onClick={() => void sendMessage()}
          disabled={loading}
          sx={{
            borderRadius: "8px",
            border: "none",
            background: "primary",
            color: "#ffffff",
            px: 4,
            py: 2,
            fontSize: "17px",
            cursor: loading ? "progress" : "pointer",
          }}
        >
          {loading ? "..." : "Ask"}
        </Box>
      </Flex>
    </Box>
  )
}

export default HeroChat
