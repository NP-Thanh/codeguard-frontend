import { useState } from "react";
import "./AuthPages.css";

function LoginPage({ onLoginSuccess, onGoRegister }) {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle | loading | success | error
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function validate() {
    const e = {};
    if (!form.identifier.trim())
      e.identifier = "Vui lòng nhập tên đăng nhập hoặc email.";
    if (!form.password)
      e.password = "Vui lòng nhập mật khẩu.";
    return e;
  }

  function handleChange(evt) {
    const { name, value } = evt.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitStatus("loading");
    setServerError("");

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.identifier.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg =
          response.status === 401
            ? "Tên đăng nhập, email hoặc mật khẩu không đúng."
            : data.detail || "Đăng nhập thất bại. Vui lòng thử lại.";
        setServerError(msg);
        setSubmitStatus("error");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      setSubmitStatus("success");
      setTimeout(() => onLoginSuccess(data), 800);
    } catch {
      setServerError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
      setSubmitStatus("error");
    }
  }

  const isLoading = submitStatus === "loading";

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-in">
        {/* Logo — chỉ text, không emoji */}
        <div className="auth-logo">
          <span className="logo-text">CodeGuard</span>
        </div>

        <h1 className="auth-title">Đăng nhập</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Identifier */}
          <div className="field-group">
            <label htmlFor="identifier">Username / Email</label>
            <div className={`input-wrap ${errors.identifier ? "input-wrap--error" : ""}`}>
              <i className="bi bi-person input-icon" />
              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="email@example.com"
                value={form.identifier}
                onChange={handleChange}
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
            {errors.identifier && (
              <span className="field-error">{errors.identifier}</span>
            )}
          </div>

          {/* Password */}
          <div className="field-group">
            <div className="label-row">
              <label htmlFor="password">Mật khẩu</label>
              <button type="button" className="forgot-link">
                Quên mật khẩu?
              </button>
            </div>
            <div className={`input-wrap ${errors.password ? "input-wrap--error" : ""}`}>
              <i className="bi bi-lock input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          {/* Server error */}
          {submitStatus === "error" && serverError && (
            <div className="alert alert-error" role="alert">
              <i className="bi bi-exclamation-circle-fill alert-icon" />
              {serverError}
            </div>
          )}

          {/* Success */}
          {submitStatus === "success" && (
            <div className="alert alert-success" role="status">
              <i className="bi bi-check-circle-fill alert-icon" />
              Đăng nhập thành công! Đang chuyển trang…
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading || submitStatus === "success"}
          >
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Đang đăng nhập…
              </span>
            ) : submitStatus === "success" ? (
              <>
                <i className="bi bi-check-lg" /> Thành công
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Bạn chưa có tài khoản?{" "}
          <button type="button" className="switch-link" onClick={onGoRegister}>
            Đăng ký
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
