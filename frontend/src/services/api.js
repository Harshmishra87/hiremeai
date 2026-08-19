import axios from "axios";
import { API_BASE_URL } from "../data/constants";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Upload a resume PDF.
 * @param {File} file
 */
export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * Fetch the currently loaded resume (parsed by the backend from the PDF).
 * Returns the Resume schema: name, email, phone, skills, experiences,
 * education, projects, certifications.
 */
export async function fetchResume() {
  const { data } = await api.get("/resume");
  return data;
}

/**
 * Reset the conversation history on the backend.
 */
export async function resetConversation() {
  const { data } = await api.post("/reset");
  return data;
}

/**
 * Send a chat question to the backend and stream the response.
 * Falls back gracefully if the backend or streaming body is unavailable.
 *
 * @param {string} question
 * @param {(chunk: string) => void} onChunk - called with each new text chunk
 * @param {AbortSignal} [signal]
 * @returns {Promise<string>} the full accumulated response text
 */
export async function streamChat(question, onChunk, signal) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  if (!response.body || !response.body.getReader) {
    const text = await response.text();
    onChunk(text);
    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      full += chunk;
      onChunk(chunk);
    }
  }

  return full;
}
