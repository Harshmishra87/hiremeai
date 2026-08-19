import { useCallback, useRef, useState } from 'react'
import { streamChat, resetConversation } from '../services/api'

/**
 * Manages a streaming chat conversation with the HarshOS backend.
 * Messages: [{ id, role: 'user' | 'assistant', text, streaming, timestamp }]
 */
export function useChat() {
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const idRef = useRef(0)

  const nextId = () => {
    idRef.current += 1
    return idRef.current
  }

  const sendMessage = useCallback(async (question) => {
    if (!question || !question.trim() || isStreaming) return

    setError(null)
    const userMsg = {
      id: nextId(),
      role: 'user',
      text: question,
      timestamp: Date.now(),
    }
    const assistantId = nextId()
    const assistantMsg = {
      id: assistantId,
      role: 'assistant',
      text: '',
      streaming: true,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      await streamChat(
        question,
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + chunk } : m
            )
          )
        },
        controller.signal
      )
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Could not reach the AI backend. Is it running on localhost:8000?')
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  text:
                    m.text ||
                    "I couldn't reach my backend just now. Make sure the HarshOS API is running on localhost:8000 and try again.",
                }
              : m
          )
        )
      }
    } finally {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
      )
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [isStreaming])

  const reset = useCallback(async () => {
    setMessages([])
    setError(null)
    try {
      await resetConversation()
    } catch {
      // Silently ignore — chat is cleared locally regardless.
    }
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { messages, isStreaming, error, sendMessage, reset, stop }
}
