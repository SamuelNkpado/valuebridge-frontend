import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import {
  BuildingIcon, HandshakeIcon, BarChartIcon,
  ArrowRightIcon, CheckCircleIcon, ShieldIcon, UsersIcon
} from "../components/Icons";

const roles = [
  {
    value: "sme_owner",
    icon: <BuildingIcon size={22} color="#1d4ed8" />,
    iconBg: "#dbeafe",
    title: "SME Owner",
    desc: "I want to value & sell my business",
    activeColor: "#1d4ed8",
    activeBg: "#eff6ff",
    activeBorder: "#1d4ed8"
  },
  {
    value: "investor",
    icon: <HandshakeIcon size={22} color="#d97706" />,
    iconBg: "#fef3c7",
    title: "Investor / Buyer",
    desc: "I'm looking to invest or acquire",
    activeColor: "#d97706",
    activeBg: "#fffbeb",
    activeBorder: "#d97706"
  },
  {
    value: "advisor",
    icon: <BarChartIcon size={22} color="#059669" />,
    iconBg: "#d1fae5",
    title: "Advisor",
    desc: "I provide advisory services to SMEs",
    activeColor: "#059669",
    activeBg: "#f0fdf4",
    activeBorder: "#059669"
  },
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: "", email: "", password: "",
    phone_number: "", role: "sme_owner"
  });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  const inp = {
    width: "100%", padding: "13px 16px",
    border: "1.5px solid #e2e8f0", borderRadius: 8,
    fontSize: 15, outline: "none",
    background: "#f8fafc", color: "#0f172a",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s"
  };

  const focusInp = (e) => {
    e.target.style.borderColor = "#2563eb";
    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
    e.target.style.background = "#ffffff";
  };
  const blurInp = (e) => {
    e.target.style.borderColor = "#e2e8f0";
    e.target.style.boxShadow = "none";
    e.target.style.background = "#f8fafc";
  };

  const selectedRole = roles.find((r) => r.value === form.role);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0f4ff 0%, #f8fafc 50%, #f0fdf4 100%)",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: "32px 20px"
    }}>
      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* ── HEADER ────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{
            display: "inline-flex", alignItems: "center",
            gap: 10, marginBottom: 24, textDecoration: "none"
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
                fontWeight: 700, fontSize: 20, color: "#0f172a"
              }}>ValueBridge</span>
            </div>
          </Link>

          <h1 style={{
            fontSize: 30, fontWeight: 700, color: "#0f172a",
            letterSpacing: "-0.02em", marginBottom: 6
          }}>Create your account</h1>
          <p style={{ color: "#64748b", fontSize: 15 }}>
            Join 1,200+ Nigerian SMEs on ValueBridge
          </p>
        </div>

        {/* ── CARD ──────────────────────────────── */}
        <div style={{
          background: "#ffffff", borderRadius: 20,
          padding: 40, boxShadow: "0 8px 40px rgba(15,23,42,0.10)",
          border: "1px solid #e2e8f0"
        }}>

          {/* Progress */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 10
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {[1, 2].map((s) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: step > s
                        ? "#059669"
                        : step === s
                          ? "linear-gradient(135deg, #1d4ed8, #2563eb)"
                          : "#f1f5f9",
                      color: step >= s ? "white" : "#94a3b8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700,
                      boxShadow: step === s ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
                      transition: "all 0.3s"
                    }}>
                      {step > s ? <CheckCircleIcon size={14} color="white" /> : s}
                    </div>
                    {s === 1 && (
                      <div style={{
                        width: 40, height: 2, borderRadius: 2,
                        background: step > 1
                          ? "#059669"
                          : "#e2e8f0",
                        transition: "background 0.3s"
                      }} />
                    )}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                Step {step} of 2
              </span>
            </div>

            {/* Progress bar */}
            <div style={{
              height: 4, background: "#f1f5f9",
              borderRadius: 10, overflow: "hidden"
            }}>
              <div style={{
                height: "100%",
                width: step === 1 ? "50%" : "100%",
                background: "linear-gradient(90deg, #1d4ed8, #2563eb)",
                borderRadius: 10,
                transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)"
              }} />
            </div>
          </div>

          {/* Error */}
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

          {/* ── STEP 1: Role ─────────────────────── */}
          {step === 1 && (
            <div>
              <h2 style={{
                fontSize: 20, fontWeight: 700,
                color: "#0f172a", marginBottom: 6
              }}>What best describes you?</h2>
              <p style={{
                color: "#64748b", fontSize: 14, marginBottom: 24
              }}>Choose your role on ValueBridge</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {roles.map((r) => {
                  const active = form.role === r.value;
                  return (
                    <div
                      key={r.value}
                      onClick={() => setForm({ ...form, role: r.value })}
                      style={{
                        padding: "16px 20px", borderRadius: 12, cursor: "pointer",
                        border: active
                          ? `2px solid ${r.activeBorder}`
                          : "2px solid #e2e8f0",
                        background: active ? r.activeBg : "#f8fafc",
                        display: "flex", alignItems: "center", gap: 16,
                        transition: "all 0.15s",
                        boxShadow: active
                          ? `0 0 0 3px ${r.activeBorder}22`
                          : "none"
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "#f1f5f9";
                          e.currentTarget.style.borderColor = "#cbd5e1";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "#f8fafc";
                          e.currentTarget.style.borderColor = "#e2e8f0";
                        }
                      }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 48, height: 48,
                        background: active ? r.iconBg : "#f1f5f9",
                        borderRadius: 12, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        flexShrink: 0, transition: "background 0.15s",
                        border: active ? `1px solid ${r.activeBorder}33` : "1px solid #e2e8f0"
                      }}>
                        {r.icon}
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 700, fontSize: 15,
                          color: active ? r.activeColor : "#0f172a",
                          marginBottom: 3
                        }}>{r.title}</div>
                        <div style={{
                          fontSize: 13,
                          color: active ? r.activeColor : "#64748b",
                          opacity: active ? 0.8 : 1
                        }}>{r.desc}</div>
                      </div>

                      {/* Check */}
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: active ? r.activeBorder : "transparent",
                        border: active ? "none" : "2px solid #cbd5e1",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", transition: "all 0.15s",
                        flexShrink: 0
                      }}>
                        {active && <CheckCircleIcon size={14} color="white" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setStep(2)}
                style={{
                  width: "100%", padding: "15px",
                  background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "white", border: "none", borderRadius: 8,
                  fontSize: 16, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 10,
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 28px rgba(37,99,235,0.45)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,99,235,0.35)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Continue
                <ArrowRightIcon size={18} color="white" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Details ───────────────────── */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              {/* Role badge */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", marginBottom: 24,
                background: selectedRole?.activeBg || "#eff6ff",
                border: `1px solid ${selectedRole?.activeBorder || "#bfdbfe"}33`,
                borderRadius: 8
              }}>
                <div style={{
                  width: 32, height: 32,
                  background: selectedRole?.iconBg || "#dbeafe",
                  borderRadius: 8, display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}>
                  {selectedRole?.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: 12, fontWeight: 700,
                    color: selectedRole?.activeColor || "#1d4ed8",
                    textTransform: "uppercase", letterSpacing: "0.06em"
                  }}>Registering as</div>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: "#0f172a"
                  }}>{selectedRole?.title}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    marginLeft: "auto", padding: "5px 12px",
                    background: "transparent", color: "#64748b",
                    border: "1px solid #e2e8f0", borderRadius: 6,
                    fontSize: 12, fontWeight: 600, cursor: "pointer"
                  }}
                >Change</button>
              </div>

              <h2 style={{
                fontSize: 20, fontWeight: 700,
                color: "#0f172a", marginBottom: 6
              }}>Your details</h2>
              <p style={{
                color: "#64748b", fontSize: 14, marginBottom: 22
              }}>Almost there! Create your account.</p>

              {/* Name + Phone grid */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 14, marginBottom: 14
              }}>
                <div>
                  <label style={{
                    display: "block", fontSize: 13, fontWeight: 700,
                    color: "#374151", marginBottom: 7
                  }}>Full Name *</label>
                  <input
                    style={inp} type="text" name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="John Doe" required
                    onFocus={focusInp} onBlur={blurInp}
                  />
                </div>
                <div>
                  <label style={{
                    display: "block", fontSize: 13, fontWeight: 700,
                    color: "#374151", marginBottom: 7
                  }}>Phone Number</label>
                  <input
                    style={inp} type="text" name="phone_number"
                    value={form.phone_number}
                    onChange={handleChange}
                    placeholder="08012345678"
                    onFocus={focusInp} onBlur={blurInp}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <label style={{
                  display: "block", fontSize: 13, fontWeight: 700,
                  color: "#374151", marginBottom: 7
                }}>Email Address *</label>
                <input
                  style={inp} type="email" name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com" required
                  onFocus={focusInp} onBlur={blurInp}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 28 }}>
                <label style={{
                  display: "block", fontSize: 13, fontWeight: 700,
                  color: "#374151", marginBottom: 7
                }}>Password *</label>
                <input
                  style={inp} type="password" name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters" required
                  onFocus={focusInp} onBlur={blurInp}
                />
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    {/* Password strength indicator */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map((i) => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 2,
                          background: form.password.length >= i * 2
                            ? form.password.length >= 8 ? "#059669" : "#d97706"
                            : "#e2e8f0",
                          transition: "background 0.2s"
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {form.password.length < 4 ? "Too short" :
                       form.password.length < 6 ? "Weak" :
                       form.password.length < 8 ? "Good" : "Strong ✓"}
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    padding: "14px 20px",
                    background: "#f8fafc", color: "#475569",
                    border: "1.5px solid #e2e8f0", borderRadius: 8,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
                  onMouseLeave={(e) => e.target.style.background = "#f8fafc"}
                >← Back</button>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1, padding: "14px",
                    background: loading
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                    color: "white", border: "none", borderRadius: 8,
                    fontSize: 16, fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.35)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 10,
                    transition: "all 0.2s"
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRightIcon size={18} color="white" />
                    </>
                  )}
                </button>
              </div>

              {/* Security note */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 14px",
                background: "#f0fdf4", borderRadius: 8,
                border: "1px solid #bbf7d0"
              }}>
                <ShieldIcon size={16} color="#059669" />
                <span style={{ fontSize: 12, color: "#065f46" }}>
                  Your data is encrypted and protected. We never share your information.
                </span>
              </div>
            </form>
          )}
        </div>

        {/* ── FOOTER ────────────────────────────── */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            Already have an account?{" "}
            <Link to="/login" style={{
              color: "#1d4ed8", fontWeight: 700,
              textDecoration: "none"
            }}>Sign in →</Link>
          </p>

          {/* Trust row */}
          <div style={{
            display: "flex", justifyContent: "center",
            gap: 20, marginTop: 16, flexWrap: "wrap"
          }}>
            {[
              { icon: <ShieldIcon size={12} color="#94a3b8" />, text: "Secure & encrypted" },
              { icon: <UsersIcon size={12} color="#94a3b8" />, text: "1,200+ SMEs joined" },
              { icon: <BarChartIcon size={12} color="#94a3b8" />, text: "Free to start" },
            ].map((item) => (
              <div key={item.text} style={{
                display: "flex", alignItems: "center", gap: 5,
                color: "#94a3b8", fontSize: 12
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