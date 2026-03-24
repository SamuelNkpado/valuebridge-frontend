import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../services/api";
import {
    BarChartIcon, BuildingIcon, StoreIcon, MessageIcon,
    TrendingUpIcon, ShieldIcon, UsersIcon, ZapIcon,
    LockIcon, HandshakeIcon, CheckCircleIcon, KeyIcon, UserIcon
} from "../components/Icons";

export default function Landing() {
    const { token, login } = useAuth();
    const navigate = useNavigate();
    const [modal, setModal] = useState(null); // null | 'auth'
    const [authStep, setAuthStep] = useState("choice"); // choice | login | register-seller | register-buyer
    const [scrolled, setScrolled] = useState(false);
    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [regForm, setRegForm] = useState({
        full_name: "", email: "", phone_number: "",
        password: "", confirm_password: "", role: "sme_owner"
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        setModal(null);
    };

    const openAuth = (step = "choice") => {
        setAuthStep(step);
        setError("");
        setModal("auth");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            const res = await loginUser(loginForm);
            login(res.data.user, res.data.access_token);
            setModal(null);
            navigate("/dashboard");
        } catch {
            setError("Invalid email or password.");
        } finally { setLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (regForm.password !== regForm.confirm_password) {
            setError("Passwords do not match."); return;
        }
        setLoading(true); setError("");
        try {
            await registerUser({
                full_name: regForm.full_name,
                email: regForm.email,
                phone_number: regForm.phone_number,
                password: regForm.password,
                role: regForm.role
            });
            setAuthStep("login");
            setError("");
            alert("Account created! Please sign in.");
        } catch (err) {
            setError(err.response?.data?.detail || "Registration failed.");
        } finally { setLoading(false); }
    };

    const inp = {
        width: "100%", padding: "12px 16px",
        border: "1.5px solid #e2e8f0", borderRadius: 8,
        fontSize: 15, outline: "none", background: "#f8fafc",
        color: "#0f172a", boxSizing: "border-box",
        transition: "border-color 0.2s, box-shadow 0.2s",
        marginBottom: 14
    };

    const navLinks = [
        { label: "Sellers", id: "sellers" },
        { label: "Investors", id: "investors" },
        { label: "Valuations", id: "features" },
        { label: "Marketplace", id: "marketplace" },
        { label: "How it Works", id: "how-it-works" },
    ];

    return (
        <div style={{ background: "#ffffff", minHeight: "100vh", overflowX: "hidden" }}>

            {/* ── MODAL OVERLAY ─────────────────────────────── */}
            {modal === "auth" && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 1000,
                    background: "rgba(2,8,23,0.7)", backdropFilter: "blur(6px)",
                    display: "flex", alignItems: "flex-start", justifyContent: "center",
                    paddingTop: 80
                }} onClick={() => setModal(null)}>
                    <div style={{
                        background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 440,
                        boxShadow: "0 32px 80px rgba(0,0,0,0.3)", overflow: "hidden",
                        animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)"
                    }} onClick={(e) => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div style={{
                            padding: "20px 24px 16px",
                            borderBottom: "1px solid #f1f5f9",
                            display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <img src="/logo.png" alt="ValueBridge" style={{ height: 28 }} />
                            </div>
                            <button onClick={() => setModal(null)} style={{
                                width: 30, height: 30, border: "none", background: "#f1f5f9",
                                borderRadius: "50%", fontSize: 16, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#64748b"
                            }}>✕</button>
                        </div>

                        <div style={{ padding: "24px" }}>

                            {/* ── CHOICE ── */}
                            {authStep === "choice" && (
                                <div className="fade-in">
                                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                                        Create Account
                                    </h2>
                                    <p style={{ color: "#64748b", fontSize: 15, marginBottom: 24 }}>
                                        Are you a buyer or seller?
                                    </p>
                                    <button onClick={() => { setRegForm({ ...regForm, role: "sme_owner" }); setAuthStep("register"); }} style={{
                                        width: "100%", padding: "15px",
                                        background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                                        color: "white", border: "none", borderRadius: 8,
                                        fontSize: 16, fontWeight: 700, marginBottom: 10,
                                        boxShadow: "0 4px 16px rgba(37,99,235,0.3)", cursor: "pointer"
                                    }}>I'm a Seller</button>
                                    <button onClick={() => { setRegForm({ ...regForm, role: "investor" }); setAuthStep("register"); }} style={{
                                        width: "100%", padding: "15px",
                                        background: "#f8fafc", color: "#1e293b",
                                        border: "1.5px solid #e2e8f0", borderRadius: 8,
                                        fontSize: 16, fontWeight: 600, cursor: "pointer"
                                    }}>I'm a Buyer</button>
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        margin: "20px 0"
                                    }}>
                                        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                                        <span style={{ color: "#94a3b8", fontSize: 13 }}>or</span>
                                        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                                    </div>
                                    <button onClick={() => setAuthStep("login")} style={{
                                        width: "100%", padding: "13px",
                                        background: "transparent", color: "#2563eb",
                                        border: "1.5px solid #2563eb", borderRadius: 8,
                                        fontSize: 15, fontWeight: 700, cursor: "pointer"
                                    }}>Sign in to existing account</button>
                                </div>
                            )}

                            {/* ── LOGIN ── */}
                            {authStep === "login" && (
                                <div className="fade-in">
                                    <button onClick={() => setAuthStep("choice")} style={{
                                        background: "none", border: "none", color: "#2563eb",
                                        fontSize: 14, fontWeight: 600, cursor: "pointer",
                                        marginBottom: 16, padding: 0
                                    }}>← Back to selection</button>
                                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
                                        Sign In
                                    </h2>
                                    {error && (
                                        <div style={{
                                            background: "#fff1f2", color: "#e11d48", padding: "11px 14px",
                                            borderRadius: 8, marginBottom: 16, fontSize: 14,
                                            border: "1px solid #fecdd3"
                                        }}>⚠️ {error}</div>
                                    )}
                                    <form onSubmit={handleLogin}>
                                        <label style={{
                                            display: "block", fontSize: 13, fontWeight: 700,
                                            color: "#374151", marginBottom: 6
                                        }}>Email</label>
                                        <input style={inp} type="email" placeholder="your@email.com"
                                            value={loginForm.email}
                                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                            onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                                            onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                                            required
                                        />
                                        <label style={{
                                            display: "block", fontSize: 13, fontWeight: 700,
                                            color: "#374151", marginBottom: 6
                                        }}>Password</label>
                                        <input style={inp} type="password" placeholder="••••••••"
                                            value={loginForm.password}
                                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                            onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                                            onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                                            required
                                        />
                                        <button type="submit" disabled={loading} style={{
                                            width: "100%", padding: "14px", marginTop: 4,
                                            background: loading ? "#94a3b8" : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                                            color: "white", border: "none", borderRadius: 8,
                                            fontSize: 16, fontWeight: 700,
                                            boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.3)",
                                            cursor: loading ? "not-allowed" : "pointer"
                                        }}>{loading ? "Signing in..." : "Sign In →"}</button>
                                    </form>
                                    <p style={{
                                        textAlign: "center", marginTop: 16,
                                        color: "#64748b", fontSize: 14
                                    }}>
                                        Don't have an account?{" "}
                                        <button onClick={() => setAuthStep("choice")} style={{
                                            background: "none", border: "none", color: "#2563eb",
                                            fontWeight: 700, cursor: "pointer", fontSize: 14
                                        }}>Create one free</button>
                                    </p>
                                </div>
                            )}

                            {/* ── REGISTER ── */}
                            {authStep === "register" && (
                                <div className="fade-in">
                                    <button onClick={() => setAuthStep("choice")} style={{
                                        background: "none", border: "none", color: "#2563eb",
                                        fontSize: 14, fontWeight: 600, cursor: "pointer",
                                        marginBottom: 16, padding: 0
                                    }}>← Back to selection</button>
                                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                                        Create Account
                                    </h2>
                                    <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
                                        Registering as: <strong>
                                            {regForm.role === "sme_owner" ? "Seller (SME Owner)" : "Buyer (Investor)"}
                                        </strong>
                                    </p>
                                    {error && (
                                        <div style={{
                                            background: "#fff1f2", color: "#e11d48", padding: "11px 14px",
                                            borderRadius: 8, marginBottom: 16, fontSize: 14,
                                            border: "1px solid #fecdd3"
                                        }}>⚠️ {error}</div>
                                    )}
                                    <form onSubmit={handleRegister}>
                                        {[
                                            { label: "Full Name", key: "full_name", type: "text", placeholder: "John Doe" },
                                            { label: "Email", key: "email", type: "email", placeholder: "your@email.com" },
                                            { label: "Phone Number", key: "phone_number", type: "text", placeholder: "08012345678" },
                                            { label: "Password", key: "password", type: "password", placeholder: "At least 6 characters" },
                                            { label: "Confirm Password", key: "confirm_password", type: "password", placeholder: "Repeat password" },
                                        ].map((f) => (
                                            <div key={f.key}>
                                                <label style={{
                                                    display: "block", fontSize: 13, fontWeight: 700,
                                                    color: "#374151", marginBottom: 6
                                                }}>{f.label}</label>
                                                <input style={inp} type={f.type} placeholder={f.placeholder}
                                                    value={regForm[f.key]}
                                                    onChange={(e) => setRegForm({ ...regForm, [f.key]: e.target.value })}
                                                    onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                                                    onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                                                    required
                                                />
                                            </div>
                                        ))}
                                        <button type="submit" disabled={loading} style={{
                                            width: "100%", padding: "14px", marginTop: 4,
                                            background: loading ? "#94a3b8" : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                                            color: "white", border: "none", borderRadius: 8,
                                            fontSize: 16, fontWeight: 700,
                                            boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.3)",
                                            cursor: loading ? "not-allowed" : "pointer"
                                        }}>{loading ? "Creating account..." : "Create Account →"}</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── NAVBAR ─────────────────────────────────────── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
                background: scrolled
                    ? "rgba(10,22,40,0.97)"
                    : "#0a1628",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                padding: "0 5%", height: 68,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "background 0.3s"
            }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    <img
                        src="/valuebridge_logo_dark-removebg-preview.png"
                        alt="ValueBridge"
                        style={{
                            height: 38,
                            objectFit: "contain",
                            mixBlendMode: "screen",
                            filter: "brightness(1.1) contrast(1.1)"
                        }}
                        onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                        }}
                    />
                    <div style={{
                        display: "none", alignItems: "center", gap: 8
                    }}>
                        <div style={{
                            width: 36, height: 36,
                            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                            borderRadius: 9, display: "flex", alignItems: "center",
                            justifyContent: "center", fontWeight: 900, color: "white",
                            fontSize: 16, fontFamily: "serif"
                        }}>VB</div>
                        <span style={{
                            fontWeight: 700, fontSize: 20, color: "white",
                            fontFamily: "Georgia, serif"
                        }}>ValueBridge</span>
                    </div>
                </div>

                {/* Nav Links */}
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {navLinks.map((item) => (
                        <button key={item.id} onClick={() => scrollTo(item.id)} style={{
                            padding: "8px 16px", color: "rgba(255,255,255,0.75)",
                            fontSize: 14, fontWeight: 500, background: "none",
                            border: "none", borderRadius: 6, cursor: "pointer",
                            transition: "all 0.15s"
                        }}
                            onMouseEnter={(e) => {
                                e.target.style.color = "white";
                                e.target.style.background = "rgba(255,255,255,0.08)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = "rgba(255,255,255,0.75)";
                                e.target.style.background = "none";
                            }}
                        >{item.label}</button>
                    ))}
                </div>

                {/* Right buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {token ? (
                        <button onClick={() => navigate("/dashboard")} style={{
                            padding: "10px 24px",
                            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                            color: "white", border: "none", borderRadius: 8,
                            fontSize: 14, fontWeight: 700, cursor: "pointer",
                            boxShadow: "0 4px 16px rgba(37,99,235,0.35)"
                        }}>Go to Dashboard →</button>
                    ) : (
                        <>
                            <button onClick={() => openAuth("login")} style={{
                                padding: "10px 18px", color: "rgba(255,255,255,0.85)",
                                fontSize: 14, fontWeight: 600, background: "none",
                                border: "1.5px solid rgba(255,255,255,0.2)",
                                borderRadius: 8, cursor: "pointer", transition: "all 0.15s"
                            }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = "rgba(255,255,255,0.08)";
                                    e.target.style.borderColor = "rgba(255,255,255,0.4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "none";
                                    e.target.style.borderColor = "rgba(255,255,255,0.2)";
                                }}
                            >Sign in</button>
                            <button onClick={() => openAuth("choice")} style={{
                                padding: "10px 22px",
                                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                                color: "white", border: "none", borderRadius: 8,
                                fontSize: 14, fontWeight: 700, cursor: "pointer",
                                boxShadow: "0 4px 16px rgba(37,99,235,0.35)"
                            }}>Get a Valuation</button>
                        </>
                    )}
                </div>
            </nav>

            {/* ── HERO ─────────────────────────────────────────── */}
            <section id="hero" style={{
                background: "linear-gradient(160deg, #020817 0%, #0a1628 40%, #0f2044 100%)",
                position: "relative", overflow: "hidden",
                padding: "140px 5% 120px", minHeight: "100vh",
                display: "flex", alignItems: "center"
            }}>
                {/* Background effects */}
                <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: `
            radial-gradient(ellipse 80% 60% at 20% 50%, rgba(37,99,235,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 20%, rgba(96,165,250,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 60% 80%, rgba(245,158,11,0.06) 0%, transparent 60%)
          `
                }} />
                <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px"
                }} />

                <div style={{
                    maxWidth: 1100, margin: "0 auto", position: "relative",
                    zIndex: 1, width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 40
                }}>

                    {/* Left content */}
                    <div style={{ maxWidth: 580 }}>
                        <div className="fade-up" style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: "rgba(37,99,235,0.2)",
                            border: "1px solid rgba(96,165,250,0.3)",
                            borderRadius: 100, padding: "7px 18px", marginBottom: 32
                        }}>
                            <span style={{
                                width: 7, height: 7, background: "#4ade80",
                                borderRadius: "50%", display: "inline-block",
                                animation: "pulse-ring 2s ease-out infinite"
                            }} />
                            <span style={{ fontSize: 13, color: "#bfdbfe", fontWeight: 600 }}>
                                Now live across Nigeria & Africa
                            </span>
                        </div>

                        <h1 className="fade-up-1" style={{
                            fontSize: "clamp(38px, 5.5vw, 68px)", fontWeight: 700,
                            color: "white", lineHeight: 1.05, marginBottom: 24
                        }}>
                            Turn your business into{" "}
                            <span style={{
                                background: "linear-gradient(135deg, #60a5fa, #93c5fd, #c4b5fd)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                            }}>opportunity.</span>
                            <br />Know its true value.
                        </h1>

                        <p className="fade-up-2" style={{
                            fontSize: 17, color: "#bfdbfe", lineHeight: 1.75,
                            marginBottom: 40, maxWidth: 500
                        }}>
                            ValueBridge combines professional valuation models with a secure
                            marketplace to help African SME owners sell, grow, or attract
                            investors with confidence.
                        </p>

                        <div className="fade-up-3" style={{
                            display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 56
                        }}>
                            <button onClick={() => openAuth("choice")} style={{
                                padding: "15px 32px",
                                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                color: "white", border: "none", borderRadius: 8,
                                fontSize: 16, fontWeight: 700, cursor: "pointer",
                                boxShadow: "0 8px 32px rgba(37,99,235,0.35)",
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 16px 40px rgba(37,99,235,0.45)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "0 8px 32px rgba(37,99,235,0.35)";
                                }}
                            >Get a Valuation →</button>
                            <button onClick={() => scrollTo("marketplace")} style={{
                                padding: "15px 28px", background: "rgba(255,255,255,0.08)",
                                color: "white", borderRadius: 8, fontSize: 16, fontWeight: 600,
                                border: "1.5px solid rgba(255,255,255,0.15)",
                                backdropFilter: "blur(8px)", cursor: "pointer",
                                transition: "background 0.2s"
                            }}
                                onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.14)"}
                                onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.08)"}
                            >Explore Marketplace</button>
                        </div>

                        {/* Micro features */}
                        <div className="fade-up-4" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                            {[
                                { icon: <BarChartIcon size={18} color="white" />, title: "Accurate Valuations", desc: "Asset-Based, DCF & Market Multiple" },
                                { icon: <HandshakeIcon size={18} color="white" />, title: "Investor Marketplace", desc: "Connect with serious buyers" },
                                { icon: <ZapIcon size={18} color="white" />, title: "Real-Time Insights", desc: "Track performance trends" },
                            ].map((f) => (
                                <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                    <div style={{
                                        width: 38, height: 38, background: "rgba(37,99,235,0.25)",
                                        border: "1px solid rgba(96,165,250,0.2)",
                                        borderRadius: 8, display: "flex", alignItems: "center",
                                        justifyContent: "center", flexShrink: 0
                                    }}>{f.icon}</div>
                                    <div>
                                        <div style={{ color: "white", fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                                            {f.title}
                                        </div>
                                        <div style={{ color: "#93c5fd", fontSize: 12 }}>{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Floating valuation card */}
                    <div className="fade-up-5" style={{
                        flexShrink: 0, width: 340,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 20, padding: 28,
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
                        animation: "float 4s ease-in-out infinite"
                    }}>
                        <div style={{
                            fontSize: 11, color: "#93c5fd", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14
                        }}>
                            Live Valuation Report
                        </div>
                        <div style={{
                            fontSize: 40, color: "white", fontWeight: 700,
                            fontFamily: "Georgia, serif", marginBottom: 4
                        }}>₦9.0M</div>
                        <div style={{ fontSize: 13, color: "#4ade80", fontWeight: 600, marginBottom: 20 }}>
                            ↑ Combined Estimate
                        </div>
                        {[
                            { label: "Asset-Based", val: "₦2.5M", pct: 28 },
                            { label: "Income-Based (DCF)", val: "₦12.0M", pct: 100 },
                            { label: "Market Multiples", val: "₦12.5M", pct: 100 },
                        ].map((item) => (
                            <div key={item.label} style={{ marginBottom: 14 }}>
                                <div style={{
                                    display: "flex", justifyContent: "space-between",
                                    marginBottom: 5, fontSize: 12
                                }}>
                                    <span style={{ color: "#bfdbfe" }}>{item.label}</span>
                                    <span style={{ color: "white", fontWeight: 700 }}>{item.val}</span>
                                </div>
                                <div style={{ height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 10 }}>
                                    <div style={{
                                        height: "100%", width: `${item.pct}%`,
                                        background: "linear-gradient(90deg, #2563eb, #60a5fa)",
                                        borderRadius: 10, transition: "width 1s ease"
                                    }} />
                                </div>
                            </div>
                        ))}
                        <div style={{
                            marginTop: 16, padding: "10px 14px",
                            background: "rgba(37,99,235,0.3)", borderRadius: 8,
                            fontSize: 13, color: "white", fontWeight: 600, textAlign: "center"
                        }}>✅ Valuation Complete — 3 Methods</div>
                    </div>
                </div>
            </section>

            {/* ── METRICS ────────────────────────────────────── */}
            <section style={{
                background: "#1d4ed8", padding: "40px 5%",
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)"
            }}>
                {[
                    { value: "1,000+", label: "SME profiles analyzed" },
                    { value: "500+", label: "Valuations generated" },
                    { value: "340+", label: "Verified investors" },
                    { value: "96%", label: "Satisfaction rate" },
                ].map((s, i) => (
                    <div key={s.label} style={{
                        textAlign: "center", padding: "16px",
                        borderRight: i < 3 ? "1px solid rgba(255,255,255,0.15)" : "none"
                    }}>
                        <div style={{
                            fontSize: 34, fontFamily: "Georgia, serif",
                            fontWeight: 700, color: "white", marginBottom: 4
                        }}>{s.value}</div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{s.label}</div>
                    </div>
                ))}
            </section>

            {/* ── SELLERS ────────────────────────────────────── */}
            <section id="sellers" style={{ padding: "100px 5%", background: "#ffffff" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 64 }}>
                        <p style={{
                            fontSize: 12, fontWeight: 700, color: "#2563eb",
                            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12
                        }}>
                            Who is ValueBridge for?
                        </p>
                        <h2 style={{ fontSize: 42, fontWeight: 700, marginBottom: 14 }}>
                            Two paths. One platform.
                        </h2>
                        <p style={{ color: "#475569", fontSize: 17, maxWidth: 500, margin: "0 auto" }}>
                            Whether you're selling or investing, ValueBridge gives you the tools to move with confidence.
                        </p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
                        <img
                            src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&auto=format&fit=crop&q=80"
                            alt="African business team in corporate office"
                            style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12, filter: "brightness(0.9)" }}
                        />
                        <img
                            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80"
                            alt="African SME business owner"
                            style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12, filter: "brightness(0.9)" }}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        {/* Sellers card */}
                        <div style={{
                            background: "linear-gradient(145deg, #020817 0%, #0f2044 100%)",
                            borderRadius: 20, padding: 44, position: "relative", overflow: "hidden"
                        }}>
                            <div style={{
                                position: "absolute", top: -60, right: -60, width: 220, height: 220,
                                borderRadius: "50%",
                                background: "radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)",
                                pointerEvents: "none"
                            }} />
                            <div style={{ position: "relative", zIndex: 1 }}>
                                <div style={{
                                    fontSize: 11, color: "#93c5fd", fontWeight: 700,
                                    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10
                                }}>
                                    For Sellers
                                </div>
                                <h3 style={{
                                    fontSize: 28, fontWeight: 700, color: "white",
                                    marginBottom: 16, lineHeight: 1.2
                                }}>Unlock your business value</h3>
                                {[
                                    "Create and manage your business profile",
                                    "Generate professional valuation reports",
                                    "List your business to attract investors",
                                    "Receive and manage offers securely",
                                ].map((item) => (
                                    <div key={item} style={{
                                        display: "flex", alignItems: "center",
                                        gap: 10, marginBottom: 12
                                    }}>
                                        <div style={{
                                            width: 20, height: 20, background: "rgba(74,222,128,0.2)",
                                            border: "1px solid rgba(74,222,128,0.3)", borderRadius: "50%",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 10, flexShrink: 0, color: "#4ade80"
                                        }}>✓</div>
                                        <span style={{ color: "#dbeafe", fontSize: 14 }}>{item}</span>
                                    </div>
                                ))}
                                <button onClick={() => openAuth("choice")} style={{
                                    marginTop: 20, padding: "13px 28px",
                                    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                    color: "white", border: "none", borderRadius: 8,
                                    fontSize: 15, fontWeight: 700, cursor: "pointer",
                                    boxShadow: "0 4px 16px rgba(37,99,235,0.4)"
                                }}>Start valuation →</button>
                            </div>
                        </div>

                        {/* Investors card */}
                        <div id="investors" style={{
                            background: "#f8fafc", borderRadius: 20, padding: 44,
                            border: "1px solid #e2e8f0", position: "relative", overflow: "hidden"
                        }}>
                            <div style={{
                                fontSize: 11, color: "#f59e0b", fontWeight: 700,
                                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10
                            }}>
                                For Investors
                            </div>
                            <h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
                                Discover high-potential businesses
                            </h3>
                            {[
                                "Browse curated SME listings",
                                "Access valuation insights and financial data",
                                "Submit offers directly to founders",
                                "Communicate securely with sellers",
                            ].map((item) => (
                                <div key={item} style={{
                                    display: "flex", alignItems: "center",
                                    gap: 10, marginBottom: 12
                                }}>
                                    <div style={{
                                        width: 20, height: 20, background: "#fef3c7",
                                        border: "1px solid rgba(245,158,11,0.3)", borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 10, flexShrink: 0, color: "#f59e0b"
                                    }}>✓</div>
                                    <span style={{ color: "#334155", fontSize: 14 }}>{item}</span>
                                </div>
                            ))}
                            <button onClick={() => openAuth("choice")} style={{
                                marginTop: 20, padding: "13px 28px",
                                background: "#f59e0b", color: "white",
                                border: "none", borderRadius: 8, fontSize: 15,
                                fontWeight: 700, cursor: "pointer",
                                boxShadow: "0 4px 16px rgba(245,158,11,0.3)"
                            }}>Browse listings →</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ───────────────────────────────────── */}
            <section id="features" style={{
                padding: "100px 5%", background: "#f8fafc",
                borderTop: "1px solid #e2e8f0"
            }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 64 }}>
                        <p style={{
                            fontSize: 12, fontWeight: 700, color: "#2563eb",
                            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12
                        }}>
                            Core Features
                        </p>
                        <h2 style={{ fontSize: 42, fontWeight: 700, marginBottom: 14 }}>
                            Everything you need to grow
                        </h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                        {[
                            {
                                icon: <BarChartIcon size={22} color="#1d4ed8" />, title: "Multi-Method Valuation Engine",
                                desc: "Asset-Based, DCF, and Market Multiples for accurate estimates.",
                                bg: "#eff6ff", border: "#dbeafe", iconBg: "#dbeafe"
                            },
                            {
                                icon: <BuildingIcon size={22} color="#059669" />, title: "Business Profile Management",
                                desc: "Full CRUD system for SME data, financials, and operations.",
                                bg: "#f0fdf4", border: "#bbf7d0", iconBg: "#dcfce7"
                            },
                            {
                                icon: <StoreIcon size={22} color="#d97706" />, title: "Marketplace System",
                                desc: "List businesses, receive offers, accept or reject deals.",
                                bg: "#fffbeb", border: "#fde68a", iconBg: "#fef3c7"
                            },
                            {
                                icon: <MessageIcon size={22} color="#7c3aed" />, title: "Secure Messaging",
                                desc: "Communicate with investors inside the platform. Encrypted.",
                                bg: "#faf5ff", border: "#e9d5ff", iconBg: "#f3e8ff"
                            },
                            {
                                icon: <TrendingUpIcon size={22} color="#1d4ed8" />, title: "Analytics Dashboard",
                                desc: "Track valuation history and business performance metrics.",
                                bg: "#eff6ff", border: "#dbeafe", iconBg: "#dbeafe"
                            },
                            {
                                icon: <ShieldIcon size={22} color="#be123c" />, title: "Admin & Oversight",
                                desc: "Platform moderation, verification, and full admin controls.",
                                bg: "#fff1f2", border: "#fecdd3", iconBg: "#ffe4e6"
                            },
                        ].map((f) => (
                            <div key={f.title} style={{
                                background: f.bg, borderRadius: 14, padding: 26,
                                border: `1px solid ${f.border}`, transition: "all 0.25s",
                                cursor: "default"
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <div style={{
                                    width: 46, height: 46, background: f.iconBg, borderRadius: 10,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    marginBottom: 16
                                }}>{f.icon}</div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                                <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ───────────────────────────────── */}
            <section id="how-it-works" style={{
                padding: "100px 5%", background: "#0a1628"
            }}>
                <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
                    <p style={{
                        fontSize: 12, fontWeight: 700, color: "#93c5fd",
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12
                    }}>
                        How it works
                    </p>
                    <h2 style={{ fontSize: 42, fontWeight: 700, color: "white", marginBottom: 14 }}>
                        Simple. Transparent. Data-driven.
                    </h2>
                    <p style={{ color: "#93c5fd", fontSize: 17, marginBottom: 64 }}>
                        From signup to closing a deal in 4 simple steps
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
                        {[
                            {
                                num: "01", title: "Build your profile",
                                desc: "Add your business data, financials, and operations."
                            },
                            {
                                num: "02", title: "Get valued",
                                desc: "Receive a valuation using multiple professional methods."
                            },
                            {
                                num: "03", title: "List your business",
                                desc: "Publish to 340+ verified buyers and investors."
                            },
                            {
                                num: "04", title: "Connect & transact",
                                desc: "Receive offers and close deals securely."
                            },
                        ].map((s, i) => (
                            <div key={s.num} style={{ position: "relative" }}>
                                {i < 3 && (
                                    <div style={{
                                        position: "absolute", top: 26, left: "calc(50% + 32px)",
                                        width: "calc(100% - 64px)", height: 1,
                                        background: "rgba(96,165,250,0.2)"
                                    }} />
                                )}
                                <div style={{
                                    width: 52, height: 52, margin: "0 auto 20px",
                                    background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                                    borderRadius: 12, display: "flex", alignItems: "center",
                                    justifyContent: "center", fontSize: 22, position: "relative", zIndex: 1,
                                    boxShadow: "0 4px 16px rgba(37,99,235,0.4)"
                                }}>
                                    {[
                                        <UserIcon size={22} color="white" />,
                                        <BarChartIcon size={22} color="white" />,
                                        <StoreIcon size={22} color="white" />,
                                        <HandshakeIcon size={22} color="white" />
                                    ][i]}
                                </div>
                                <div style={{
                                    fontSize: 11, color: "#60a5fa", fontWeight: 700,
                                    letterSpacing: "0.1em", marginBottom: 8
                                }}>{s.num}</div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8 }}>
                                    {s.title}
                                </h3>
                                <p style={{ fontSize: 13, color: "#93c5fd", lineHeight: 1.6 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 56 }}>
                        <button onClick={() => openAuth("choice")} style={{
                            padding: "15px 40px",
                            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                            color: "white", border: "none", borderRadius: 8,
                            fontSize: 16, fontWeight: 700, cursor: "pointer",
                            boxShadow: "0 8px 32px rgba(37,99,235,0.35)"
                        }}>Start now →</button>
                    </div>
                </div>
            </section>

            {/* ── MARKETPLACE ────────────────────────────────── */}
            <section id="marketplace" style={{ padding: "100px 5%", background: "#ffffff" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 56 }}>
                        <p style={{
                            fontSize: 12, fontWeight: 700, color: "#2563eb",
                            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12
                        }}>
                            Marketplace
                        </p>
                        <h2 style={{ fontSize: 42, fontWeight: 700, marginBottom: 14 }}>
                            Explore businesses ready for investment
                        </h2>
                        <p style={{ color: "#475569", fontSize: 17 }}>
                            Browse listings available for investment, acquisition, or partnership
                        </p>
                    </div>

                    {/* Sample listing cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
                        {[
                            {
                                name: "Lagos Fresh Foods", category: "Food & Beverage", revenue: "₦5.2M",
                                valuation: "₦9.0M", years: "4 years", tags: ["Verified", "Valuation available"]
                            },
                            {
                                name: "TechFlow Solutions", category: "Technology", revenue: "₦12.4M",
                                valuation: "₦28.5M", years: "6 years", tags: ["Verified"]
                            },
                            {
                                name: "Abuja Agro Farms", category: "Agriculture", revenue: "₦3.8M",
                                valuation: "₦7.2M", years: "3 years", tags: ["Valuation available"]
                            },
                        ].map((listing) => (
                            <div key={listing.name} style={{
                                background: "#f8fafc", borderRadius: 14, padding: 24,
                                border: "1px solid #e2e8f0", transition: "all 0.2s"
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                                    e.currentTarget.style.transform = "translateY(-3px)";
                                    e.currentTarget.style.borderColor = "#bfdbfe";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = "none";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.borderColor = "#e2e8f0";
                                }}
                            >
                                <div style={{
                                    display: "flex", justifyContent: "space-between",
                                    alignItems: "flex-start", marginBottom: 14
                                }}>
                                    <div>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                                            {listing.name}
                                        </h3>
                                        <span style={{
                                            fontSize: 12, padding: "3px 10px", borderRadius: 20,
                                            background: "#dbeafe", color: "#1d4ed8", fontWeight: 600
                                        }}>{listing.category}</span>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{
                                            fontSize: 18, fontWeight: 800,
                                            color: "#0f172a", fontFamily: "Georgia, serif"
                                        }}>
                                            {listing.valuation}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#64748b" }}>Valuation</div>
                                    </div>
                                </div>
                                <div style={{
                                    display: "grid", gridTemplateColumns: "1fr 1fr",
                                    gap: 8, marginBottom: 16
                                }}>
                                    <div style={{
                                        background: "#ffffff", padding: "8px 12px",
                                        borderRadius: 8, border: "1px solid #e2e8f0"
                                    }}>
                                        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>Revenue</div>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{listing.revenue}</div>
                                    </div>
                                    <div style={{
                                        background: "#ffffff", padding: "8px 12px",
                                        borderRadius: 8, border: "1px solid #e2e8f0"
                                    }}>
                                        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>Operating</div>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{listing.years}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                                    {listing.tags.map((tag) => (
                                        <span key={tag} style={{
                                            fontSize: 11, padding: "3px 8px", borderRadius: 20,
                                            background: "#dcfce7", color: "#166534", fontWeight: 600
                                        }}>{tag}</span>
                                    ))}
                                </div>
                                <button onClick={() => openAuth("choice")} style={{
                                    width: "100%", padding: "11px",
                                    background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                                    color: "white", border: "none", borderRadius: 8,
                                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                                    boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
                                }}>View listing →</button>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: "center" }}>
                        <button onClick={() => openAuth("choice")} style={{
                            padding: "13px 36px", background: "#f8fafc",
                            color: "#1d4ed8", border: "2px solid #1d4ed8",
                            borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer"
                        }}>Browse all listings →</button>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ───────────────────────────────── */}
            <section style={{
                padding: "100px 5%", background: "#f8fafc",
                borderTop: "1px solid #e2e8f0"
            }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 56 }}>
                        <h2 style={{ fontSize: 40, fontWeight: 700, marginBottom: 12 }}>
                            What founders and investors say
                        </h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                        {[
                            {
                                quote: "ValueBridge helped me finally understand what my business is truly worth. The 3-method approach gave me confidence to approach investors.",
                                author: "Chukwuemeka O.", role: "SME Owner, Lagos"
                            },
                            {
                                quote: "The ability to see valuation data before making an offer is incredibly powerful. This is the tool the Nigerian investment space has been missing.",
                                author: "Amina K.", role: "Angel Investor, Abuja"
                            },
                            {
                                quote: "I listed my business and received my first offer within a week. The platform is transparent, secure and genuinely built for founders like me.",
                                author: "Taiwo B.", role: "Founder, Kano"
                            },
                        ].map((t) => (
                            <div key={t.author} style={{
                                background: "#ffffff", borderRadius: 14, padding: 28,
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                            }}>
                                <div style={{
                                    fontSize: 40, color: "#dbeafe",
                                    fontFamily: "Georgia", marginBottom: 16, lineHeight: 1
                                }}>"</div>
                                <p style={{
                                    color: "#334155", fontSize: 15, lineHeight: 1.7,
                                    marginBottom: 24, fontStyle: "italic"
                                }}>{t.quote}</p>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.author}</div>
                                    <div style={{ color: "#94a3b8", fontSize: 13 }}>{t.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TRUST ──────────────────────────────────────── */}
            <section style={{
                padding: "72px 5%", background: "#eff6ff",
                borderTop: "1px solid #dbeafe"
            }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
                    <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
                        Built for trust and transparency
                    </h2>
                    <p style={{ color: "#475569", marginBottom: 48 }}>
                        Your data and deals are protected at every step.
                    </p>
                    <div style={{
                        display: "flex", justifyContent: "center",
                        gap: 20, flexWrap: "wrap"
                    }}>
                        {[
                            { icon: <KeyIcon size={26} color="#1d4ed8" />, label: "JWT Authentication", desc: "Secure token-based login" },
                            { icon: <UsersIcon size={26} color="#1d4ed8" />, label: "Role-Based Access", desc: "Custom permissions per user" },
                            { icon: <CheckCircleIcon size={26} color="#059669" />, label: "KYC Verified Users", desc: "Identity-verified accounts" },
                            { icon: <LockIcon size={26} color="#1d4ed8" />, label: "Encrypted Data", desc: "TLS 1.3 + AES-256 at rest" },
                        ].map((item) => (
                            <div key={item.label} style={{
                                background: "#ffffff", borderRadius: 12,
                                padding: "20px 28px", border: "1px solid #dbeafe",
                                textAlign: "center", minWidth: 180,
                                boxShadow: "0 2px 8px rgba(37,99,235,0.06)"
                            }}>
                                <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}>
                                    {item.icon}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.label}</div>
                                <div style={{ fontSize: 12, color: "#64748b" }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ──────────────────────────────────── */}
            <section style={{
                padding: "100px 5%", textAlign: "center",
                background: "linear-gradient(160deg, #0a1628 0%, #020817 100%)",
                position: "relative", overflow: "hidden"
            }}>
                <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: 700, height: 400, pointerEvents: "none",
                    background: "radial-gradient(ellipse, rgba(37,99,235,0.2) 0%, transparent 70%)"
                }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                    <h2 style={{
                        fontSize: 50, fontWeight: 700, color: "white",
                        marginBottom: 16, lineHeight: 1.1
                    }}>
                        Ready to know your<br />
                        <span style={{
                            background: "linear-gradient(135deg, #60a5fa, #93c5fd, #c4b5fd)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                        }}>business worth?</span>
                    </h2>
                    <p style={{ color: "#93c5fd", fontSize: 18, marginBottom: 40 }}>
                        Join 1,000+ Nigerian SMEs on ValueBridge. Free to start.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                        <button onClick={() => openAuth("choice")} style={{
                            padding: "16px 40px",
                            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                            color: "white", border: "none", borderRadius: 8,
                            fontSize: 16, fontWeight: 700, cursor: "pointer",
                            boxShadow: "0 8px 32px rgba(37,99,235,0.35)"
                        }}>Get started free →</button>
                        <button onClick={() => openAuth("login")} style={{
                            padding: "16px 32px", background: "rgba(255,255,255,0.08)",
                            color: "white", borderRadius: 8, fontSize: 16, fontWeight: 600,
                            border: "1.5px solid rgba(255,255,255,0.15)", cursor: "pointer"
                        }}>Sign in</button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ─────────────────────────────────────── */}
            <footer style={{
                background: "#020817",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                padding: "48px 5% 32px"
            }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{
                        display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
                        gap: 40, marginBottom: 48
                    }}>
                        <div>
                            <div style={{ marginBottom: 16 }}>
                                <img src="/logo.png" alt="ValueBridge"
                                    style={{ height: 32, objectFit: "contain" }}
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display = "block";
                                    }}
                                />
                                <span style={{
                                    display: "none", fontWeight: 700,
                                    fontSize: 18, color: "white"
                                }}>ValueBridge</span>
                            </div>
                            <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
                                A data-driven valuation and marketplace platform helping African SMEs
                                understand their value and connect with investors.
                            </p>
                        </div>
                        {[
                            { title: "Sellers", links: ["Start Valuation", "List Business", "View Offers", "Pricing"] },
                            { title: "Investors", links: ["Browse Listings", "How to Invest", "Due Diligence", "Pricing"] },
                            { title: "Company", links: ["About", "Resources", "Privacy", "Terms", "Contact"] },
                        ].map((col) => (
                            <div key={col.title}>
                                <div style={{
                                    fontSize: 12, fontWeight: 700, color: "white",
                                    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16
                                }}>
                                    {col.title}
                                </div>
                                {col.links.map((l) => (
                                    <a key={l} href="#" style={{
                                        display: "block", color: "#475569", fontSize: 14, marginBottom: 10,
                                        transition: "color 0.15s"
                                    }}
                                        onMouseEnter={(e) => e.target.style.color = "white"}
                                        onMouseLeave={(e) => e.target.style.color = "#475569"}
                                    >{l}</a>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div style={{
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        paddingTop: 24, display: "flex",
                        justifyContent: "space-between", alignItems: "center"
                    }}>
                        <p style={{ color: "#334155", fontSize: 13 }}>
                            © 2026 ValueBridge Inc. Built for African SMEs by Samuel Chima.
                        </p>
                        <p style={{ color: "#334155", fontSize: 13 }}>🇳🇬 Made in Nigeria</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
