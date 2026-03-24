import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  BarChartIcon, HandshakeIcon, ShieldIcon, ArrowRightIcon
} from "../components/Icons";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await loginUser({ email, password });
      login(res.data.user, res.data.access_token);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally { setLoading(false); }
  };

  const features = [
    {
      icon: <BarChartIcon size={20} color="#60a5fa" />,
      text: "3-method valuation engine trusted by accountants"
    },
    {
      icon: <HandshakeIcon size={20} color="#60a5fa" />,
      text: "Direct access to 340+ verified Nigerian investors"
    },
    {
      icon: <ShieldIcon size={20} color="#60a5fa" />,
      text: "Bank-grade security for your business data"
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      margin: 0, padding: 0
    }}>

      {/* ── LEFT PANEL ─────────────────────────── */}
      <div style={{
        flex: 1,
        background: "linear-gradient(160deg, #020817 0%, #0a1628 50%, #0f2044 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "44px 52px",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh"
      }}>

        {/* Background glow effects */}
        <div style={{
          position: "absolute", bottom: -120, right: -120,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", top: -80, left: -80,
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        {/* Grid lines */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px"
        }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Link to="/" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            textDecoration: "none"
          }}>
            <img
              src="/logo.png"
              alt="ValueBridge"
              style={{ height: 36, objectFit: "contain" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            {/* Fallback */}
            <div style={{
              display: "none", alignItems: "center", gap: 8
            }}>
              <div style={{
                width: 36, height: 36,
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                borderRadius: 9, display: "flex", alignItems: "center",
                justifyContent: "center", color: "white",
                fontWeight: 900, fontSize: 16
              }}>VB</div>
              <span style={{
                color: "white", fontWeight: 700, fontSize: 20
              }}>ValueBridge</span>
            </div>
          </Link>
        </div>

        {/* Main content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Live badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(74,222,128,0.12)",
            border: "1px solid rgba(74,222,128,0.2)",
            borderRadius: 100, padding: "6px 16px", marginBottom: 28
          }}>
            <span style={{
              width: 7, height: 7, background: "#4ade80",
              borderRadius: "50%", display: "inline-block",
              boxShadow: "0 0 8px rgba(74,222,128,0.6)"
            }} />
            <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>
              340+ verified investors on the platform
            </span>
          </div>

          <h2 style={{
            color: "white", fontSize: 38, fontWeight: 700,
            lineHeight: 1.1, marginBottom: 20,
            letterSpacing: "-0.02em"
          }}>
            Your business is worth<br />
            <span style={{
              background: "linear-gradient(135deg, #60a5fa, #93c5fd, #c4b5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>more than you think.</span>
          </h2>

          <p style={{
            color: "#93c5fd", fontSize: 15, lineHeight: 1.8,
            marginBottom: 40, maxWidth: 400
          }}>
            ValueBridge helps Nigerian SME owners accurately value their businesses,
            find the right investors, and close life-changing deals.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "13px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10
              }}>
                <div style={{
                  width: 38, height: 38,
                  background: "rgba(37,99,235,0.25)",
                  border: "1px solid rgba(96,165,250,0.2)",
                  borderRadius: 8, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  flexShrink: 0
                }}>
                  {f.icon}
                </div>
                <span style={{ color: "#bfdbfe", fontSize: 14 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{
          color: "#1e40af", fontSize: 12,
          position: "relative", zIndex: 1
        }}>
          © 2026 ValueBridge Inc. — Built for African SMEs
        </p>
      </div>

      {/* ── RIGHT PANEL ────────────────────────── */}
      <div style={{
        width: 520,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 52px",
        background: "#ffffff"
      }}>
        <div style={{ width: "100%" }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{
              fontSize: 30, fontWeight: 700, color: "#0f172a",
              letterSpacing: "-0.02em", marginBottom: 6
            }}>Welcome back</h1>
            <p style={{ color: "#64748b", fontSize: 15 }}>
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: "#fff1f2", color: "#e11d48",
              padding: "13px 16px", borderRadius: 8,
              marginBottom: 20, fontSize: 14,
              border: "1px solid #fecdd3",
              display: "flex", alignItems: "center", gap: 8
            }}>
              <span style={{
                width: 20, height: 20, background: "#fecdd3",
                borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#e11d48",
                flexShrink: 0
              }}>!</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: "block", fontSize: 13, fontWeight: 700,
                color: "#374151", marginBottom: 8
              }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={{
                  width: "100%", padding: "13px 16px",
                  border: "1.5px solid #e2e8f0", borderRadius: 8,
                  fontSize: 15, outline: "none",
                  background: "#f8fafc", color: "#0f172a",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                  e.target.style.background = "#ffffff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "#f8fafc";
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: "block", fontSize: 13, fontWeight: 700,
                color: "#374151", marginBottom: 8
              }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%", padding: "13px 50px 13px 16px",
                    border: "1.5px solid #e2e8f0", borderRadius: 8,
                    fontSize: 15, outline: "none",
                    background: "#f8fafc", color: "#0f172a",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s, box-shadow 0.2s"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                    e.target.style.background = "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                    e.target.style.background = "#f8fafc";
                  }}
                />
                {/* Show/hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: 14, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    color: "#94a3b8", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, padding: "2px 6px"
                  }}
                >{showPass ? "Hide" : "Show"}</button>
              </div>
            </div>

            {/* SIGN IN BUTTON — prominent and impossible to miss */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "16px",
                background: loading
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 16, fontWeight: 700, cursor: loading
                  ? "not-allowed" : "pointer",
                boxShadow: loading
                  ? "none"
                  : "0 4px 16px rgba(37,99,235,0.35)",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 10,
                transition: "all 0.2s",
                letterSpacing: "-0.01em"
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 8px 28px rgba(37,99,235,0.45)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = loading
                  ? "none" : "0 4px 16px rgba(37,99,235,0.35)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 18, height: 18,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite"
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRightIcon size={18} color="white" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center",
            gap: 12, margin: "24px 0"
          }}>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            <span style={{ color: "#94a3b8", fontSize: 13 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          </div>

          {/* Register link */}
          <div style={{
            background: "#f8fafc", borderRadius: 10,
            padding: "16px 20px", border: "1px solid #e2e8f0",
            textAlign: "center"
          }}>
            <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
              New to ValueBridge?{" "}
              <Link to="/register" style={{
                color: "#1d4ed8", fontWeight: 700,
                textDecoration: "none"
              }}>
                Create a free account →
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div style={{
            display: "flex", justifyContent: "center",
            gap: 20, marginTop: 24, flexWrap: "wrap"
          }}>
            {[
              { icon: <ShieldIcon size={13} color="#64748b" />, text: "Secure login" },
              { icon: <BarChartIcon size={13} color="#64748b" />, text: "Professional tools" },
              { icon: <HandshakeIcon size={13} color="#64748b" />, text: "Verified investors" },
            ].map((item) => (
              <div key={item.text} style={{
                display: "flex", alignItems: "center", gap: 5,
                color: "#64748b", fontSize: 12
              }}>
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}