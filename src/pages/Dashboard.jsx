import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboard } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import {
    BuildingIcon, DiamondIcon, StoreIcon, HandshakeIcon,
    BarChartIcon, TrendingUpIcon, MessageIcon, PlusIcon
} from "../components/Icons";

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        getDashboard()
            .then((res) => setData(res.data))
            .catch(() => navigate("/login"))
            .finally(() => setLoading(false));
    }, [navigate]);

    if (loading) return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100vh", flexDirection: "column", gap: 14,
            background: "#f8fafc"
        }}>
            <div style={{
                width: 36, height: 36,
                border: "3px solid #dbeafe",
                borderTopColor: "#2563eb",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite"
            }} />
            <span style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>
                Loading your dashboard...
            </span>
        </div>
    );

    const stats = [
        {
            label: "Total Businesses",
            value: data?.total_businesses ?? 0,
            icon: <BuildingIcon size={20} color="#1d4ed8" />,
            iconBg: "#dbeafe", border: "#bfdbfe",
            link: "/businesses"
        },
        {
            label: "Highest Valuation",
            value: `₦${((data?.highest_valuation ?? 0) / 1e6).toFixed(1)}M`,
            icon: <DiamondIcon size={20} color="#059669" />,
            iconBg: "#d1fae5", border: "#a7f3d0",
            link: "/valuations"
        },
        {
            label: "Active Listings",
            value: data?.active_listings ?? 0,
            icon: <StoreIcon size={20} color="#d97706" />,
            iconBg: "#fef3c7", border: "#fde68a",
            link: "/marketplace"
        },
        {
            label: "Offers Received",
            value: data?.total_offers_received ?? 0,
            icon: <HandshakeIcon size={20} color="#7c3aed" />,
            iconBg: "#ede9fe", border: "#ddd6fe",
            link: "/marketplace"
        },
    ];

    const quickActions = [
        {
            icon: <BuildingIcon size={16} color="#1d4ed8" />,
            label: "Add new business",
            path: "/businesses",
            iconBg: "#dbeafe", hoverBg: "#eff6ff"
        },
        {
            icon: <BarChartIcon size={16} color="#059669" />,
            label: "Run valuation",
            path: "/valuations",
            iconBg: "#d1fae5", hoverBg: "#f0fdf4"
        },
        {
            icon: <StoreIcon size={16} color="#d97706" />,
            label: "Browse marketplace",
            path: "/marketplace",
            iconBg: "#fef3c7", hoverBg: "#fffbeb"
        },
        {
            icon: <MessageIcon size={16} color="#475569" />,
            label: "Messages",
            path: "/messages",
            iconBg: "#f1f5f9", hoverBg: "#f8fafc"
        },
    ];

    return (
        <Layout
            title={`Good day, ${user?.full_name?.split(" ")[0]} 👋`}
            subtitle="Here's your business overview for today"
            action={
                <Link to="/businesses" style={{
                    padding: "9px 20px",
                    background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                    color: "white", borderRadius: 8,
                    fontSize: 13, fontWeight: 700,
                    boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                    display: "flex", alignItems: "center", gap: 6,
                    textDecoration: "none"
                }}>
                    <PlusIcon size={14} color="white" />
                    Add Business
                </Link>
            }
        >
            {/* ── STAT CARDS ──────────────────────────── */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16, marginBottom: 24
            }}>
                {stats.map((s) => (
                    <Link key={s.label} to={s.link} style={{
                        background: "#ffffff",
                        borderRadius: 12,
                        padding: "20px 22px",
                        border: `1px solid ${s.border}`,
                        boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                        transition: "all 0.2s",
                        display: "block",
                        textDecoration: "none"
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.10)";
                            e.currentTarget.style.transform = "translateY(-3px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.06)";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "flex-start", marginBottom: 14
                        }}>
                            <p style={{
                                fontSize: 11, color: "#64748b", fontWeight: 700,
                                textTransform: "uppercase", letterSpacing: "0.07em",
                                margin: 0
                            }}>{s.label}</p>
                            <div style={{
                                width: 38, height: 38,
                                background: s.iconBg,
                                borderRadius: 9,
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>{s.icon}</div>
                        </div>
                        <p style={{
                            fontSize: 34, fontWeight: 800,
                            color: "#0f172a", margin: 0,
                            letterSpacing: "-0.03em",
                            fontFamily: "Georgia, serif"
                        }}>{s.value}</p>
                    </Link>
                ))}
            </div>

            {/* ── MAIN GRID ───────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>

                {/* Businesses table */}
                <div style={{
                    background: "#ffffff", borderRadius: 12,
                    border: "1px solid #e2e8f0", overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
                }}>
                    <div style={{
                        padding: "18px 22px",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                            My Businesses
                        </h2>
                        <Link to="/businesses" style={{
                            fontSize: 13, color: "#2563eb", fontWeight: 600,
                            textDecoration: "none"
                        }}>View all →</Link>
                    </div>

                    {!data?.businesses?.length ? (
                        <div style={{ padding: "52px 22px", textAlign: "center" }}>
                            <div style={{
                                width: 56, height: 56,
                                background: "#eff6ff",
                                border: "1px solid #dbeafe",
                                borderRadius: 12,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 16px"
                            }}>
                                <BuildingIcon size={26} color="#2563eb" />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#0f172a" }}>
                                No businesses yet
                            </h3>
                            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
                                Add your first business to start getting valuations
                            </p>
                            <Link to="/businesses" style={{
                                padding: "10px 22px",
                                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                                color: "white", borderRadius: 8, fontSize: 14, fontWeight: 700,
                                textDecoration: "none",
                                boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
                            }}>Add Business</Link>
                        </div>
                    ) : (
                        <>
                            {/* Table header */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr 1fr 100px",
                                gap: 12, padding: "10px 22px",
                                background: "#f8fafc",
                                borderBottom: "1px solid #f1f5f9"
                            }}>
                                {["Business", "Revenue", "Status", ""].map((h) => (
                                    <span key={h} style={{
                                        fontSize: 11, fontWeight: 700, color: "#94a3b8",
                                        textTransform: "uppercase", letterSpacing: "0.07em"
                                    }}>{h}</span>
                                ))}
                            </div>

                            {/* Table rows */}
                            {data.businesses.map((b, i) => (
                                <div key={b.id} style={{
                                    display: "grid",
                                    gridTemplateColumns: "2fr 1fr 1fr 100px",
                                    gap: 12, padding: "14px 22px",
                                    alignItems: "center",
                                    borderBottom: i < data.businesses.length - 1
                                        ? "1px solid #f1f5f9" : "none",
                                    transition: "background 0.15s"
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{
                                            width: 36, height: 36,
                                            background: "#eff6ff",
                                            border: "1px solid #dbeafe",
                                            borderRadius: 8,
                                            display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                            <BuildingIcon size={16} color="#2563eb" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                                                {b.name}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#94a3b8" }}>
                                                {b.industry} · {b.location}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                                        ₦{((b.annual_revenue ?? 0) / 1e6).toFixed(1)}M
                                    </div>

                                    <div>
                                        <span style={{
                                            fontSize: 11, padding: "4px 10px",
                                            borderRadius: 20, fontWeight: 700,
                                            background: b.status === "active" ? "#d1fae5" : "#f1f5f9",
                                            color: b.status === "active" ? "#065f46" : "#64748b"
                                        }}>{b.status}</span>
                                    </div>

                                    <Link to="/valuations" style={{
                                        fontSize: 12, color: "#2563eb", fontWeight: 700,
                                        padding: "6px 12px",
                                        background: "#eff6ff",
                                        border: "1px solid #dbeafe",
                                        borderRadius: 6,
                                        textDecoration: "none", textAlign: "center",
                                        transition: "all 0.15s"
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "#dbeafe";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "#eff6ff";
                                        }}
                                    >Value →</Link>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Right column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Quick Actions */}
                    <div style={{
                        background: "#ffffff", borderRadius: 12,
                        border: "1px solid #e2e8f0", padding: "18px",
                        boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
                    }}>
                        <h2 style={{
                            fontSize: 15, fontWeight: 700,
                            color: "#0f172a", marginBottom: 14, margin: "0 0 14px"
                        }}>Quick Actions</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {quickActions.map((item) => (
                                <Link key={item.path} to={item.path} style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "11px 12px", borderRadius: 8,
                                    border: "1px solid #e2e8f0",
                                    background: "#f8fafc",
                                    transition: "all 0.15s",
                                    textDecoration: "none"
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = item.hoverBg;
                                        e.currentTarget.style.borderColor = "transparent";
                                        e.currentTarget.style.transform = "translateX(4px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#f8fafc";
                                        e.currentTarget.style.borderColor = "#e2e8f0";
                                        e.currentTarget.style.transform = "translateX(0)";
                                    }}
                                >
                                    <span style={{
                                        width: 32, height: 32,
                                        background: item.iconBg,
                                        borderRadius: 8,
                                        display: "flex", alignItems: "center", justifyContent: "center"
                                    }}>{item.icon}</span>
                                    <span style={{
                                        fontSize: 13, fontWeight: 600, color: "#334155"
                                    }}>{item.label}</span>
                                    <span style={{
                                        marginLeft: "auto", color: "#94a3b8", fontSize: 14
                                    }}>→</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Platform Overview */}
                    <div style={{
                        background: "linear-gradient(160deg, #0a1628, #020817)",
                        borderRadius: 12, padding: "20px",
                        border: "1px solid rgba(255,255,255,0.06)"
                    }}>
                        <div style={{
                            fontSize: 10, color: "#60a5fa", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: "0.1em",
                            marginBottom: 16
                        }}>Platform Overview</div>

                        {[
                            { label: "Total valuations", value: data?.total_valuations ?? 0 },
                            { label: "Pending offers", value: data?.pending_offers ?? 0 },
                            { label: "Unread messages", value: data?.unread_messages ?? 0 },
                        ].map((item, i) => (
                            <div key={item.label} style={{
                                display: "flex", justifyContent: "space-between",
                                alignItems: "center", padding: "11px 0",
                                borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none"
                            }}>
                                <span style={{ color: "#93c5fd", fontSize: 13 }}>{item.label}</span>
                                <span style={{
                                    color: "white", fontWeight: 800, fontSize: 18,
                                    fontFamily: "Georgia, serif"
                                }}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Valuation CTA */}
                    <div style={{
                        background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                        borderRadius: 12, padding: "20px",
                        boxShadow: "0 8px 24px rgba(37,99,235,0.25)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{
                                width: 36, height: 36,
                                background: "rgba(255,255,255,0.15)",
                                borderRadius: 8, display: "flex",
                                alignItems: "center", justifyContent: "center"
                            }}>
                                <BarChartIcon size={18} color="white" />
                            </div>
                            <div>
                                <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>
                                    Run a Valuation
                                </div>
                                <div style={{ color: "#bfdbfe", fontSize: 12 }}>
                                    Get your business valued today
                                </div>
                            </div>
                        </div>
                        <Link to="/valuations" style={{
                            display: "block", padding: "10px",
                            background: "rgba(255,255,255,0.15)",
                            color: "white", borderRadius: 7,
                            fontSize: 13, fontWeight: 700, textAlign: "center",
                            textDecoration: "none",
                            border: "1px solid rgba(255,255,255,0.2)",
                            transition: "background 0.15s"
                        }}
                            onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.25)"}
                            onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.15)"}
                        >Start valuation →</Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}