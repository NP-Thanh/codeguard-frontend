import { useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState("idle");
  const [responseTime, setResponseTime] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const testApi = async () => {
    setStatus("loading");
    setResponseTime(null);
    setErrorMessage("");

    const startTime = performance.now();

    try {
      const response = await fetch("/health", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();
      const elapsed = Math.round(performance.now() - startTime);

      if (!response.ok || data.status !== "healthy") {
        throw new Error(`API returned HTTP ${response.status}`);
      }

      setResponseTime(elapsed);
      setStatus("success");
    } catch (error) {
      setErrorMessage(error.message || "Unable to connect to API");
      setStatus("error");
    }
  };

  return (
    <main className="app">
      <section className="health-card">

        <h1>Backend Health Check</h1>

        <p className="description">
          Check the connection between frontend and backend.
        </p>

        <button
          className="test-button"
          onClick={testApi}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Testing..." : "Test API"}
        </button>

        {status === "idle" && (
          <p className="result neutral">
            Click the button to test the backend.
          </p>
        )}

        {status === "loading" && (
          <p className="result neutral">
            Connecting to backend...
          </p>
        )}

        {status === "success" && (
          <div className="result success">
            <strong>API Connection Successful</strong>
            <p>Status: OK</p>
            <p>Response time: {responseTime} ms</p>
          </div>
        )}

        {status === "error" && (
          <div className="result error">
            <strong>API Connection Failed</strong>
            <p>{errorMessage}</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;