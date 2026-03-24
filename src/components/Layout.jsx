import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    DashboardIcon, BuildingIcon, BarChartIcon,
    StoreIcon, MessageIcon, LogOutIcon
} from "./Icons";

const navItems = [
    { path: "/dashboard", icon: <DashboardIcon size={17} />, label: "Dashboard" },
    { path: "/businesses", icon: <BuildingIcon size={17} />, label: "My Businesses" },
    { path: "/valuations", icon: <BarChartIcon size={17} />, label: "Valuations" },
    { path: "/marketplace", icon: <StoreIcon size={17} />, label: "Marketplace" },
    { path: "/messages", icon: <MessageIcon size={17} />, label: "Messages" },
];

export default function Layout({ children, title, subtitle, action }) {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>

            {/* ── SIDEBAR ────────────────────────────────── */}
            <aside style={{
                width: 256,
                background: "#0a1628",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                top: 0, left: 0,
                height: "100vh",
                zIndex: 100,
                borderRight: "1px solid rgba(255,255,255,0.06)"
            }}>

                {/* Logo */}
                <div style={{
                    padding: "20px 20px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.07)"
                }}>
                    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <img
                            src="/valuebridge_logo_dark-removebg-preview.png"
                            alt="ValueBridge"
                            style={{
                                height: 32,
                                objectFit: "contain",
                                mixBlendMode: "screen",
                                filter: "brightness(1.1) contrast(1.1)"
                            }}
                            onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                            }}
                        />
                        {/* Fallback if logo fails */}
                        <div style={{
                            display: "none", alignItems: "center", gap: 8
                        }}>
                            <div style={{
                                width: 32, height: 32,
                                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                                borderRadius: 8, display: "flex", alignItems: "center",
                                justifyContent: "center", color: "white",
                                fontWeight: 900, fontSize: 14
                            }}>VB</div>
                            <span style={{
                                color: "white", fontWeight: 700, fontSize: 17
                            }}>ValueBridge</span>
                        </div>
                    </Link>
                </div>

                {/* User card */}
                <div style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.07)"
                }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8
                    }}>
                        <div style={{
                            width: 36, height: 36,
                            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                            borderRadius: "50%", display: "flex", alignItems: "center",
                            justifyContent: "center", color: "white",
                            fontWeight: 800, fontSize: 15, flexShrink: 0
                        }}>
                            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div style={{ overflow: "hidden", flex: 1 }}>
                            <div style={{
                                fontSize: 13, fontWeight: 700, color: "white",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                            }}>
                                {user?.full_name}
                            </div>
                            <div style={{
                                fontSize: 11, color: "#60a5fa",
                                textTransform: "capitalize"
                            }}>
                                {user?.role?.replace("_", " ")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
                    <div style={{
                        fontSize: 10, fontWeight: 700, color: "#3b82f6",
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        padding: "0 8px 12px"
                    }}>Main Menu</div>

                    {navItems.map((item) => {
                        const active = pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 12px", borderRadius: 8,
                                marginBottom: 3, fontSize: 14,
                                fontWeight: active ? 700 : 500,
                                color: active ? "white" : "#93c5fd",
                                background: active
                                    ? "linear-gradient(135deg, rgba(37,99,235,0.5), rgba(59,130,246,0.25))"
                                    : "transparent",
                                border: active
                                    ? "1px solid rgba(96,165,250,0.3)"
                                    : "1px solid transparent",
                                transition: "all 0.15s",
                                textDecoration: "none"
                            }}
                                onMouseEnter={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                        e.currentTarget.style.color = "white";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.background = "transparent";
                                        e.currentTarget.style.color = "#93c5fd";
                                    }
                                }}
                            >
                                <span style={{
                                    minWidth: 20, display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    opacity: active ? 1 : 0.8
                                }}>
                                    {item.icon}
                                </span>
                                {item.label}
                                {active && (
                                    <div style={{
                                        marginLeft: "auto", width: 6, height: 6,
                                        background: "#3b82f6", borderRadius: "50%"
                                    }} />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign out */}
                <div style={{
                    padding: "12px 16px",
                    borderTop: "1px solid rgba(255,255,255,0.07)"
                }}>
                    <button onClick={() => { logout(); navigate("/login"); }} style={{
                        width: "100%", padding: "10px 14px",
                        background: "rgba(239,68,68,0.08)",
                        color: "rgba(252,165,165,0.9)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 8, fontSize: 13, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 8,
                        cursor: "pointer", transition: "all 0.15s"
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(239,68,68,0.18)";
                            e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                            e.currentTarget.style.color = "#fca5a5";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                            e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
                            e.currentTarget.style.color = "rgba(252,165,165,0.9)";
                        }}
                    >
                        <LogOutIcon size={15} color="currentColor" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ──────────────────────────── */}
            <main style={{ marginLeft: 256, flex: 1, minHeight: "100vh", background: "#f8fafc" }}>

                {/* Top bar */}
                <div style={{
                    position: "sticky", top: 0, zIndex: 50,
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(16px)",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "0 32px", height: 64,
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 1px 3px rgba(15,23,42,0.06)"
                }}>
                    <div>
                        <h1 style={{
                            fontSize: 19, fontWeight: 700,
                            color: "#0f172a", margin: 0,
                            letterSpacing: "-0.02em"
                        }}>{title}</h1>
                        {subtitle && (
                            <p style={{
                                fontSize: 12, color: "#94a3b8",
                                marginTop: 2, marginBottom: 0
                            }}>{subtitle}</p>
                        )}
                    </div>
                    {action}
                </div>

                {/* Page content */}
                <div style={{ padding: "28px 32px" }}>
                    {children}
                </div>
            </main>
        </div>
    );
}