import { useState, useEffect } from "react";

export default function LlamaChat() {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // add user prompt
    setHistory((prev) => [...prev, { role: "user", text: prompt }]);
    setLoading(true);

    try {
      const res = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (res.ok) {
        setHistory((prev) => [
          ...prev,
          { role: "assistant", text: data.response },
        ]);
      } else {
        setHistory((prev) => [
          ...prev,
          { role: "assistant", text: `Error: ${data.error}` },
        ]);
      }
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { role: "assistant", text: `Error: ${err.message}` },
      ]);
    } finally {
      setPrompt("");
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Llama Model Interface</h1>

        <div style={styles.chatBox} id="response">
          {history.length === 0 ? (
            <p style={styles.placeholder}>No messages yet.</p>
          ) : (
            history.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.message,
                  ...(msg.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage),
                }}
              >
                <strong>{msg.role === "user" ? "You: " : "Llama: "}</strong>
                {msg.text}
              </div>
            ))
          )}
          {loading && <p style={styles.loading}>Generating response...</p>}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            required
            style={styles.textarea}
          ></textarea>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Generating..." : "Generate Response"}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Styling ---

const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f6f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    margin: 0,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    padding: "30px",
    width: "100%",
    maxWidth: "700px",
  },
  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  textarea: {
    width: "100%",
    height: "120px",
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    marginBottom: "10px",
    resize: "vertical",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  chatBox: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    padding: "15px",
    minHeight: "200px",
    maxHeight: "350px",
    overflowY: "auto",
    marginBottom: "20px",
  },
  message: {
    padding: "8px 10px",
    borderRadius: "6px",
    marginBottom: "8px",
    lineHeight: "1.4",
  },
  userMessage: {
    backgroundColor: "#e3f2fd",
    textAlign: "right",
  },
  assistantMessage: {
    backgroundColor: "#eeeeee",
    textAlign: "left",
  },
  loading: {
    fontStyle: "italic",
    color: "#555",
  },
  placeholder: {
    color: "#999",
    fontStyle: "italic",
  },
};
