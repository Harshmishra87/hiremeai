import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchResume } from "../services/api";

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetchResume()
      .then((data) => {
        setResume(data);
      })
      .catch((err) => {
        const message =
          err?.response?.status === 404
            ? "No resume has been uploaded to the backend yet."
            : err?.message || "Could not reach the resume API.";
        console.error("[HarshOS] fetchResume failed:", err);
        setError(message);
        setResume(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ResumeContext.Provider
      value={{
        resume,
        loading,
        error,
        hasResume: Boolean(resume),
        refetch: load,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return ctx;
}
