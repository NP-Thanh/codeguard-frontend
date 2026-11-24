import { useState } from "react";
import "./AuthPages.css";

// ── Validation helpers ────────────────────────────────────────────────────────

/**
 * Họ tên:
 *  - Chỉ chứa chữ cái (kể cả có dấu tiếng Việt) và dấu cách
 *  - Không chứa số, ký tự đặc biệt
 *  - Không có hai khoảng trắng liên tiếp
 *  - Dài ít nhất 2 ký tự (sau khi trim)
 */
function validateFullName(value) {
  const trimmed = value.trim();
  if (trimmed.length < 2) return "Họ tên phải có ít nhất 2 ký tự.";
  if (/[0-9]/.test(trimmed)) return "Họ tên không được chứa số.";
  // Chỉ cho phép chữ cái Unicode và khoảng trắng
  if (/[^p{L}\s]/u.test(trimmed)) {
    // Fallback regex cho môi trường không hỗ trợ \p{L}
    // Cho phép: a-z, A-Z, và toàn bộ ký tự Unicode > 127 (tiếng Việt, v.v.)
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9`~]/.test(trimmed))
      return "Họ tên không được chứa ký tự đặc biệt hoặc số.";
  }
  if (/  /.test(value)) return "Họ tên không được có hai khoảng trắng liên tiếp.";
  return "";
}

/**
 * Username:
 *  - Chỉ chứa chữ cái (a-z, A-Z), số, dấu gạch ngang (-) và gạch dưới (_)
 *  - Không chứa khoảng trắng
 *  - Độ dài 3–50
 */
function validateUsername(value) {
  if (value.length < 3 || value.length > 50)
    return "Tên đăng nhập phải từ 3 đến 50 ký tự.";
  if (/\s/.test(value)) return "Tên đăng nhập không được chứa khoảng trắng.";
  if (!/^[a-zA-Z0-9_-]+$/.test(value))
    return "Tên đăng nhập chỉ được chứa chữ, số, dấu - hoặc _.";
  return "";
}

/**
 * Email: kiểm tra định dạng user@domain.tld hợp lệ
 *  - domain phải có ít nhất một dấu chấm, TLD ít nhất 2 ký tự
 */
function validateEmail(value) {
  // RFC-5321 simplified: local@domain.tld
  const re = /^[^\s@]+@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!re.test(value.trim())) return "Email không hợp lệ (ví dụ: ten@example.com).";
  return "";
}

// ─────────────────────────────────────────────────────────────────────────────

function RegisterPage({ onRegisterSuccess, onGoLogin }) {
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function validate() {
    const e = {};

    const fnErr = validateFullName(form.full_name);
    if (fnErr) e.full_name = fnErr;

    const unErr = validateUsername(form.username);
    if (unErr) e.username = unErr;

    const emErr = validateEmail(form.email);
    if (emErr) e.email = emErr;

    if (form.password.length < 8)
      e.password = "Mật khẩu phải có ít nhất 8 ký tự.";

    if (form.confirm_password !== form.password)
      e.confirm_password = "Mật khẩu xác nhận không khớp.";

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
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name.trim().replace(/\s+/g, " "),
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let msg = data.detail || "Đăng ký thất bại. Vui lòng thử lại.";
        if (msg === "Email already registered") msg = "Email này đã được sử dụng.";
        if (msg === "Username already taken") msg = "Tên đăng nhập đã tồn tại.";
        if (msg === "Email or username already exists") msg = "Email hoặc tên đăng nhập đã tồn tại.";
        setServerError(msg);
        setSubmitStatus("error");
        return;
      }

      setSubmitStatus("success");
      setTimeout(() => onRegisterSuccess(data), 1200);
    } catch {
      setServerError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
      setSubmitStatus("error");
    }
  }

  const isLoading = submitStatus === "loading";

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-in">
        {/* Back button */}
        <button
          type="button"
          className="back-btn"
          onClick={onGoLogin}
          aria-label="Quay lại đăng nhập"
        >
          <i className="bi bi-arrow-left" />
          Quay lại
        </button>

        {/* Logo */}
        <div className="auth-logo">
          <span className="logo-text">CodeGuard</span>
        </div>

        <h1 className="auth-title">Đăng ký tài khoản mới</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Full name */}
          <div className="field-group">
            <label htmlFor="full_name">Họ và tên</label>
            <div className={`input-wrap ${errors.full_name ? "input-wrap--error" : ""}`}>
              <i className="bi bi-person input-icon" />
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.full_name}
                onChange={handleChange}
                autoComplete="name"
                disabled={isLoading}
              />
            </div>
            {errors.full_name && (
              <span className="field-error">{errors.full_name}</span>
            )}
          </div>

          {/* Username */}
          <div className="field-group">
            <label htmlFor="username">Username</label>
            <div className={`input-wrap ${errors.username ? "input-wrap--error" : ""}`}>
              <i className="bi bi-at input-icon" />
              <input
                id="username"
                name="username"
                type="text"
                placeholder="nguyenvana_01"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
          </div>

          {/* Email */}
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <div className={`input-wrap ${errors.email ? "input-wrap--error" : ""}`}>
              <i className="bi bi-envelope input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="field-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className={`input-wrap ${errors.password ? "input-wrap--error" : ""}`}>
              <i className="bi bi-lock input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 8 ký tự"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
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

          {/* Confirm password */}
          <div className="field-group">
            <label htmlFor="confirm_password">Xác nhận mật khẩu</label>
            <div className={`input-wrap ${errors.confirm_password ? "input-wrap--error" : ""}`}>
              <i className="bi bi-shield-lock input-icon" />
              <input
                id="confirm_password"
                name="confirm_password"
                type={showConfirm ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={form.confirm_password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
                aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
            {errors.confirm_password && (
              <span className="field-error">{errors.confirm_password}</span>
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
              Đăng ký thành công! Đang chuyển sang trang đăng nhập…
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
                Đang đăng ký…
              </span>
            ) : submitStatus === "success" ? (
              <>
                <i className="bi bi-check-lg" /> Thành công
              </>
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Bạn đã có tài khoản?{" "}
          <button type="button" className="switch-link" onClick={onGoLogin}>
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
