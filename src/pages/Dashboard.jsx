import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboard, getMyOffers, getMyDealRooms } from "../services/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  BuildingIcon, BarChartIcon, StoreIcon,
  HandshakeIcon, MessageIcon, ArrowRightIcon,
  CheckCircleIcon, UsersIcon, ShieldIcon
} from "../components/Icons";

// ── Stat Card ─────────────────────────────────────────
function StatCard({ label, value, sub, icon, bg }) {
  return (
    <div style={{
      background: "#ffffff", borderRadius: 14,
      padding: "22px 24px", border: "1px solid #e2e8f0",
      boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
      display: "flex", alignItems: "flex-start",
      justifyContent: "space-between"
    }}>
      <div>
        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
          {label}
        </div>
        <div style={{
          fontSize: 32, fontWeight: 800, color: "#0f172a",
          fontFamily: "Georgia, serif", letterSpacing: "-0.02em", marginBottom: 4
        }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "#64748b" }}>{sub}</div>}
      </div>
      <div style={{
        width: 46, height: 46, background: bg, borderRadius: 12,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
      }}>
        {icon}
      </div>
    </div>
  );
}

// ── Quick Action Button ───────────────────────────────
function QuickAction({ to, icon, label, desc, primary }) {
  return (
    <Link to={to} style={{
      padding: "16px 20px", borderRadius: 12, textDecoration: "none",
      background: primary ? "linear-gradient(135deg, #1d4ed8, #2563eb)" : "#f8fafc",
      border: primary ? "none" : "1px solid #e2e8f0",
      display: "flex", alignItems: "center", gap: 14,
      boxShadow: primary ? "0 4px 14px rgba(37,99,235,0.25)" : "none",
      transition: "all 0.2s"
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = primary
          ? "0 8px 24px rgba(37,99,235,0.35)"
          : "0 4px 12px rgba(15,23,42,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = primary
          ? "0 4px 14px rgba(37,99,235,0.25)" : "none";
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: primary ? "rgba(255,255,255,0.15)" : "#eff6ff",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>{icon}</div>
      <div>
        <div style={{
          fontSize: 14, fontWeight: 700,
          color: primary ? "white" : "#0f172a", marginBottom: 2
        }}>{label}</div>
        <div style={{ fontSize: 12, color: primary ? "rgba(255,255,255,0.7)" : "#64748b" }}>
          {desc}
        </div>
      </div>
      <ArrowRightIcon size={16} color={primary ? "white" : "#94a3b8"}
        style={{ marginLeft: "auto" }} />
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [offers, setOffers]   = useState([]);
  const [deals, setDeals]     = useState([]);
  const [loading, setLoading] = useState(true);

  const role = user?.role;

  useEffect(() => {
    const fetches = [
      getDashboard().then((r) => setData(r.data)).catch(() => {}),
    ];
    if (role === "investor") {
      fetches.push(getMyOffers().then((r) => setOffers(r.data)).catch(() => {}));
      fetches.push(getMyDealRooms().then((r) => setDeals(r.data)).catch(() => {}));
    }
    if (role === "advisor") {
      fetches.push(getMyDealRooms().then((r) => setDeals(r.data)).catch(() => {}));
    }
    Promise.all(fetches).finally(() => setLoading(false));
  }, [role]);

  if (loading) return (
    <Layout title="Dashboard" subtitle="Loading...">
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: 80,
        flexDirection: "column", gap: 14
      }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid #dbeafe", borderTopColor: "#2563eb",
          borderRadius: "50%", animation: "spin 0.7s linear infinite"
        }} />
        <span style={{ color: "#64748b", fontSize: 14 }}>Loading dashboard...</span>
      </div>
    </Layout>
  );

  // ── SME OWNER DASHBOARD ────────────────────────────
  if (role === "sme_owner") {
    return (
      <Layout
        title="My Business Hub"
        subtitle={`Welcome back, ${user?.full_name?.split(" ")[0]} 👋`}
      >
        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16, marginBottom: 28
        }}>
          <StatCard
            label="My Businesses"
            value={data?.total_businesses ?? 0}
            sub="Registered profiles"
            icon={<BuildingIcon size={22} color="#1d4ed8" />}
            bg="#dbeafe"
          />
          <StatCard
            label="Valuations Run"
            value={data?.total_valuations ?? 0}
            sub={data?.highest_valuation
              ? `Highest: ₦${(data.highest_valuation / 1e6).toFixed(1)}M`
              : "None yet"}
            icon={<BarChartIcon size={22} color="#059669" />}
            bg="#d1fae5"
          />
          <StatCard
            label="Active Listings"
            value={data?.active_listings ?? 0}
            sub={`${data?.total_offers_received ?? 0} offers received`}
            icon={<StoreIcon size={22} color="#d97706" />}
            bg="#fef3c7"
          />
          <StatCard
            label="Pending Offers"
            value={data?.pending_offers ?? 0}
            sub="Awaiting your response"
            icon={<HandshakeIcon size={22} color="#7c3aed" />}
            bg="#ede9fe"
          />
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{
            fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 14
          }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <QuickAction
              to="/businesses" primary
              icon={<BuildingIcon size={20} color="white" />}
              label="Add Business"
              desc="Register a new business profile"
            />
            <QuickAction
              to="/valuations"
              icon={<BarChartIcon size={20} color="#1d4ed8" />}
              label="Get Valuation"
              desc="Run a professional valuation"
            />
            <QuickAction
              to="/marketplace"
              icon={<StoreIcon size={20} color="#1d4ed8" />}
              label="List on Marketplace"
              desc="Connect with investors"
            />
          </div>
        </div>

        {/* My Businesses Table */}
        <div style={{
          background: "#ffffff", borderRadius: 14,
          border: "1px solid #e2e8f0", overflow: "hidden",
          boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
        }}>
          <div style={{
            padding: "18px 24px", borderBottom: "1px solid #f1f5f9",
            background: "#f8fafc", display: "flex",
            justifyContent: "space-between", alignItems: "center"
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              My Businesses
            </h2>
            <Link to="/businesses" style={{
              fontSize: 13, color: "#1d4ed8", fontWeight: 600,
              textDecoration: "none"
            }}>View all →</Link>
          </div>
          {!data?.businesses?.length ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, background: "#f1f5f9", borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px"
              }}>
                <BuildingIcon size={26} color="#94a3b8" />
              </div>
              <p style={{ color: "#64748b", fontSize: 15, marginBottom: 18 }}>
                No businesses yet. Add your first one to get started.
              </p>
              <Link to="/businesses" style={{
                padding: "11px 24px",
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", borderRadius: 8, fontSize: 14,
                fontWeight: 700, textDecoration: "none",
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
              }}>Add your first business →</Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Business", "Industry", "Revenue", "Status", ""].map((h) => (
                      <th key={h} style={{
                        padding: "12px 20px", textAlign: "left",
                        fontSize: 11, fontWeight: 700, color: "#94a3b8",
                        textTransform: "uppercase", letterSpacing: "0.07em"
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.businesses.map((b) => (
                    <tr key={b.id} style={{ borderTop: "1px solid #f1f5f9" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, background: "#dbeafe",
                            borderRadius: 8, display: "flex",
                            alignItems: "center", justifyContent: "center",
                            border: "1px solid #bfdbfe"
                          }}>
                            <BuildingIcon size={16} color="#1d4ed8" />
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                            {b.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>
                        {b.industry}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>
                        {b.annual_revenue
                          ? `₦${(b.annual_revenue / 1e6).toFixed(1)}M`
                          : "—"}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          fontSize: 11, padding: "3px 10px", borderRadius: 20,
                          fontWeight: 700,
                          background: b.status === "active" ? "#d1fae5" : "#f1f5f9",
                          color: b.status === "active" ? "#065f46" : "#64748b"
                        }}>{b.status}</span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <Link to="/valuations" style={{
                          fontSize: 12, color: "#1d4ed8",
                          fontWeight: 600, textDecoration: "none"
                        }}>Value →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // ── INVESTOR DASHBOARD ─────────────────────────────
  if (role === "investor") {
    const acceptedOffers  = offers.filter((o) => o.status === "accepted");
    const pendingOffers   = offers.filter((o) => o.status === "pending");
    const totalInvested   = acceptedOffers.reduce((sum, o) => sum + o.amount, 0);
    const activeDealRooms = deals.length;

    return (
      <Layout
        title="My Investment Portfolio"
        subtitle={`Welcome back, ${user?.full_name?.split(" ")[0]} 👋`}
      >
        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16, marginBottom: 28
        }}>
          <StatCard
            label="Offers Sent"
            value={offers.length}
            sub={`${pendingOffers.length} pending`}
            icon={<HandshakeIcon size={22} color="#1d4ed8" />}
            bg="#dbeafe"
          />
          <StatCard
            label="Accepted Deals"
            value={acceptedOffers.length}
            sub="Offers accepted by sellers"
            icon={<CheckCircleIcon size={22} color="#059669" />}
            bg="#d1fae5"
          />
          <StatCard
            label="Total Committed"
            value={totalInvested > 0
              ? `₦${(totalInvested / 1e6).toFixed(1)}M` : "₦0"}
            sub="Across accepted offers"
            icon={<BarChartIcon size={22} color="#d97706" />}
            bg="#fef3c7"
          />
          <StatCard
            label="Active Deal Rooms"
            value={activeDealRooms}
            sub="Due diligence in progress"
            icon={<ShieldIcon size={22} color="#7c3aed" />}
            bg="#ede9fe"
          />
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{
            fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 14
          }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <QuickAction
              to="/marketplace" primary
              icon={<StoreIcon size={20} color="white" />}
              label="Browse Marketplace"
              desc="Find businesses to invest in"
            />
            <QuickAction
              to="/marketplace?tab=sent"
              icon={<HandshakeIcon size={20} color="#1d4ed8" />}
              label="My Offers"
              desc="Track your sent offers"
            />
            <QuickAction
              to="/messages"
              icon={<MessageIcon size={20} color="#1d4ed8" />}
              label="Messages"
              desc="Chat with business owners"
            />
          </div>
        </div>

        {/* My Offers Table */}
        <div style={{
          background: "#ffffff", borderRadius: 14,
          border: "1px solid #e2e8f0", overflow: "hidden",
          boxShadow: "0 1px 4px rgba(15,23,42,0.05)", marginBottom: 20
        }}>
          <div style={{
            padding: "18px 24px", borderBottom: "1px solid #f1f5f9",
            background: "#f8fafc", display: "flex",
            justifyContent: "space-between", alignItems: "center"
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              My Offers
            </h2>
            <Link to="/marketplace" style={{
              fontSize: 13, color: "#1d4ed8", fontWeight: 600, textDecoration: "none"
            }}>View all →</Link>
          </div>
          {!offers.length ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ color: "#64748b", fontSize: 15, marginBottom: 18 }}>
                No offers yet. Browse the marketplace to find investment opportunities.
              </p>
              <Link to="/marketplace" style={{
                padding: "11px 24px",
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", borderRadius: 8, fontSize: 14,
                fontWeight: 700, textDecoration: "none"
              }}>Browse marketplace →</Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Listing", "My Offer", "Status", "Date", ""].map((h) => (
                      <th key={h} style={{
                        padding: "12px 20px", textAlign: "left",
                        fontSize: 11, fontWeight: 700, color: "#94a3b8",
                        textTransform: "uppercase", letterSpacing: "0.07em"
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {offers.map((o) => {
                    const statusColors = {
                      pending:  { bg: "#fffbeb", color: "#d97706" },
                      accepted: { bg: "#d1fae5", color: "#059669" },
                      rejected: { bg: "#fff1f2", color: "#e11d48" },
                    };
                    const sc = statusColors[o.status] || statusColors.pending;
                    return (
                      <tr key={o.id} style={{ borderTop: "1px solid #f1f5f9" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "14px 20px", fontSize: 14,
                          fontWeight: 600, color: "#0f172a" }}>
                          Listing #{o.listing_id}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            fontSize: 15, fontWeight: 800, color: "#0f172a",
                            fontFamily: "Georgia, serif"
                          }}>₦{(o.amount / 1e6).toFixed(2)}M</span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            fontSize: 11, padding: "3px 10px", borderRadius: 20,
                            fontWeight: 700, background: sc.bg, color: sc.color
                          }}>{o.status}</span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: 12, color: "#94a3b8" }}>
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          {o.status === "accepted" && (
                            <Link to="/marketplace" style={{
                              fontSize: 12, color: "#1d4ed8",
                              fontWeight: 600, textDecoration: "none"
                            }}>Deal Room →</Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Deal Rooms */}
        {deals.length > 0 && (
          <div style={{
            background: "linear-gradient(160deg, #0a1628, #1e3a5f)",
            borderRadius: 14, padding: 24,
            border: "1px solid rgba(96,165,250,0.2)"
          }}>
            <h2 style={{
              fontSize: 15, fontWeight: 700, color: "white", marginBottom: 16
            }}>Active Deal Rooms</h2>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12
            }}>
              {deals.map((d) => (
                <Link key={d.id} to={`/deal-room/${d.id}`} style={{
                  padding: "16px", background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, textDecoration: "none",
                  transition: "all 0.15s"
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                >
                  <div style={{
                    fontSize: 11, color: "#60a5fa", fontWeight: 700,
                    textTransform: "uppercase", marginBottom: 6
                  }}>Deal Room #{d.id}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4
                  }}>Listing #{d.listing_id}</div>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 20,
                    background: "rgba(74,222,128,0.15)",
                    color: "#4ade80", fontWeight: 600
                  }}>{d.stage.replace("_", " ")}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Layout>
    );
  }

  // ── ADVISOR DASHBOARD ──────────────────────────────
  if (role === "advisor") {
    return (
      <Layout
        title="My Advisory Desk"
        subtitle={`Welcome back, ${user?.full_name?.split(" ")[0]} 👋`}
      >
        {/* Verification notice */}
        {!user?.is_verified && (
          <div style={{
            background: "#fffbeb", border: "1px solid #fde68a",
            borderRadius: 12, padding: "16px 20px", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 12
          }}>
            <ShieldIcon size={20} color="#d97706" />
            <div>
              <div style={{ fontWeight: 700, color: "#92400e", fontSize: 14 }}>
                Verification Pending
              </div>
              <div style={{ fontSize: 13, color: "#b45309" }}>
                Your advisor account is awaiting admin verification before
                you can be assigned to deals.
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16, marginBottom: 28
        }}>
          <StatCard
            label="Assigned Deals"
            value={deals.length}
            sub="Active deal rooms"
            icon={<HandshakeIcon size={22} color="#1d4ed8" />}
            bg="#dbeafe"
          />
          <StatCard
            label="Verification Status"
            value={user?.is_verified ? "Verified" : "Pending"}
            sub={user?.is_verified ? "You can be assigned to deals" : "Awaiting admin approval"}
            icon={<ShieldIcon size={22} color={user?.is_verified ? "#059669" : "#d97706"} />}
            bg={user?.is_verified ? "#d1fae5" : "#fef3c7"}
          />
          <StatCard
            label="Messages"
            value="—"
            sub="Check your inbox"
            icon={<MessageIcon size={22} color="#7c3aed" />}
            bg="#ede9fe"
          />
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
            Quick Actions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            <QuickAction
              to="/messages" primary
              icon={<MessageIcon size={20} color="white" />}
              label="Messages"
              desc="Communicate with deal parties"
            />
            <QuickAction
              to="/marketplace"
              icon={<StoreIcon size={20} color="#1d4ed8" />}
              label="Browse Marketplace"
              desc="View active business listings"
            />
          </div>
        </div>

        {/* Assigned Deal Rooms */}
        <div style={{
          background: "#ffffff", borderRadius: 14,
          border: "1px solid #e2e8f0", overflow: "hidden",
          boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
        }}>
          <div style={{
            padding: "18px 24px", borderBottom: "1px solid #f1f5f9",
            background: "#f8fafc"
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Assigned Deal Rooms
            </h2>
          </div>
          {!deals.length ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, background: "#f1f5f9", borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px"
              }}>
                <UsersIcon size={26} color="#94a3b8" />
              </div>
              <p style={{ color: "#64748b", fontSize: 15 }}>
                No deals assigned yet. Deal parties can assign you as their advisor
                once your account is verified.
              </p>
            </div>
          ) : (
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {deals.map((d) => (
                <Link key={d.id} to={`/deal-room/${d.id}`} style={{
                  padding: 18, background: "#f8fafc", borderRadius: 10,
                  border: "1px solid #e2e8f0", textDecoration: "none",
                  transition: "all 0.15s"
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#eff6ff";
                    e.currentTarget.style.borderColor = "#bfdbfe";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  <div style={{
                    fontSize: 11, color: "#1d4ed8", fontWeight: 700,
                    textTransform: "uppercase", marginBottom: 6
                  }}>Deal Room #{d.id}</div>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6
                  }}>Listing #{d.listing_id}</div>
                  <span style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 20,
                    background: "#dbeafe", color: "#1d4ed8", fontWeight: 600
                  }}>{d.stage.replace("_", " ")}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // ── FALLBACK ───────────────────────────────────────
  return (
    <Layout title="Dashboard" subtitle="Welcome to ValueBridge">
      <div style={{ textAlign: "center", padding: 60 }}>
        <p style={{ color: "#64748b" }}>
          Your dashboard is being set up. Please log out and log back in.
        </p>
      </div>
    </Layout>
  );
}