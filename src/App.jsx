import { useState, useEffect, useRef } from "react";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import "./App.css";

function HealthPage({ loginData }) {
  const [status, setStatus] = useState("idle");
  const [responseTime, setResponseTime] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const testApi = async () => {
    setStatus("loading");
    setResponseTime(null);
    setErrorMessage("");
    const t0 = performance.now();
    try {
      const res = await fetch("/api/v1/health", { method: "GET", cache: "no-store" });
      const data = await res.json();
      const elapsed = Math.round(performance.now() - t0);
      if (!res.ok || data.status !== "healthy") throw new Error(`HTTP ${res.status}`);
      setResponseTime(elapsed);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err.message || "Không thể kết nối API");
      setStatus("error");
    }
  };

  return (
    <main className="app">
      <section className="health-card">
          <p className="welcome-message">
            Đăng nhập thành công!
          </p>

        <button
          className="test-button"
          onClick={testApi}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Đang kiểm tra…" : "Kiểm tra API"}
        </button>

        {status === "idle" && (
          <p className="result neutral">Nhấn nút để kiểm tra backend.</p>
        )}
        {status === "loading" && (
          <p className="result neutral">Đang kết nối tới backend…</p>
        )}
        {status === "success" && (
          <div className="result success">
            <strong>Kết nối thành công</strong>
            <p>Trạng thái: OK</p>
            <p>Thời gian phản hồi: {responseTime} ms</p>
          </div>
        )}
        {status === "error" && (
          <div className="result error">
            <strong>Kết nối thất bại</strong>
            <p>{errorMessage}</p>
          </div>
        )}
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────
   Page transition wrapper
───────────────────────────────────────── */
function PageTransition({ pageKey, children }) {
  const [displayed, setDisplayed] = useState({ key: pageKey, node: children });
  const [phase, setPhase] = useState("in"); // "in" | "out"
  const pendingRef = useRef(null);

  useEffect(() => {
    if (pageKey === displayed.key) return;

    // Start exit
    setPhase("out");
    pendingRef.current = { key: pageKey, node: children };

    const timer = setTimeout(() => {
      setDisplayed({ key: pendingRef.current.key, node: pendingRef.current.node });
      setPhase("in");
    }, 260); // match CSS transition duration

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey]);

  // Keep children fresh when phase is "in" and key matches
  useEffect(() => {
    if (phase === "in" && pageKey === displayed.key) {
      setDisplayed({ key: pageKey, node: children });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  return (
    <div
      className="page-layer"
      style={{
        opacity: phase === "in" ? 1 : 0,
        transform: phase === "in" ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.26s ease, transform 0.26s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {displayed.node}
    </div>
  );
}

/* ─────────────────────────────────────────
   Root App
───────────────────────────────────────── */
function App() {
  // page: "login" | "register" | "health"
  const [page, setPage] = useState("login");
  const [loginData, setLoginData] = useState(null);

  function handleLoginSuccess(data) {
    setLoginData(data);
    setPage("health");
  }

  function handleRegisterSuccess() {
    setPage("login");
  }

  const content =
    page === "login" ? (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoRegister={() => setPage("register")}
      />
    ) : page === "register" ? (
      <RegisterPage
        onRegisterSuccess={handleRegisterSuccess}
        onGoLogin={() => setPage("login")}
      />
    ) : (
      <HealthPage loginData={loginData} />
    );

  return (
    <PageTransition pageKey={page}>
      {content}
    </PageTransition>
  );
}

export default App;
