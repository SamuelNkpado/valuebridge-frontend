import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { getAdminDashboard, verifyAdvisor } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  UsersIcon, BuildingIcon, StoreIcon,
  HandshakeIcon, BarChartIcon, ShieldIcon, CheckCircleIcon
} from "../components/Icons";

function MetricCard({ label, value, sub, icon, bg }) {
  return (
    <div style={{
      background: "#ffffff", borderRadius: 14, padding: "22px 24px",
      border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
      display: "flex", alignItems: "flex-start", justifyContent: "space-between"
    }}>
      <div>
        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
          {label}
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#0f172a",
          fontFamily: "Georgia, serif", marginBottom: 4 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "#64748b" }}>{sub}</div>}
      </div>
      <div style={{
        width: 46, height: 46, background: bg, borderRadius: 12,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>{icon}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);

  useEffect(() => {
    if (user?.role !== "admin") { navigate("/dashboard"); return; }
    getAdminDashboard()
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (advisorId) => {
    setVerifying(advisorId);
    try {
      await verifyAdvisor(advisorId);
      const updated = await getAdminDashboard();
      setData(updated.data);
    } catch { alert("Failed to verify advisor."); }
    finally { setVerifying(null); }
  };

  if (loading) return (
    <Layout title="Admin Dashboard" subtitle="Loading...">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        padding: 80, flexDirection: "column", gap: 14 }}>
        <div style={{ width: 36, height: 36, border: "3px solid #dbeafe",
          borderTopColor: "#2563eb", borderRadius: "50%",
          animation: "spin 0.7s linear infinite" }} />
      </div>
    </Layout>
  );

  if (!data) return null;

  return (
    <Layout
      title="Admin Dashboard"
      subtitle="Platform overview and management"
    >
      {/* ── USER STATS ────────────────────────────── */}
      <h2 style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8",
        textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
        Users
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16, marginBottom: 28 }}>
        <MetricCard label="Total Users" value={data.users.total}
          icon={<UsersIcon size={22} color="#1d4ed8" />} bg="#dbeafe" />
        <MetricCard label="SME Owners" value={data.users.sme_owners}
          sub="Business sellers"
          icon={<BuildingIcon size={22} color="#059669" />} bg="#d1fae5" />
        <MetricCard label="Investors" value={data.users.investors}
          sub="Active buyers"
          icon={<HandshakeIcon size={22} color="#d97706" />} bg="#fef3c7" />
        <MetricCard label="Advisors" value={data.users.advisors_total}
          sub={`${data.users.advisors_verified} verified · ${data.users.advisors_pending} pending`}
          icon={<ShieldIcon size={22} color="#7c3aed" />} bg="#ede9fe" />
      </div>

      {/* ── PLATFORM STATS ────────────────────────── */}
      <h2 style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8",
        textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
        Platform Activity
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16, marginBottom: 28 }}>
        <MetricCard label="Businesses" value={data.businesses.total}
          sub={`${data.businesses.active} active · ${data.businesses.acquired} acquired`}
          icon={<BuildingIcon size={22} color="#1d4ed8" />} bg="#dbeafe" />
        <MetricCard label="Listings" value={data.listings.total}
          sub={`${data.listings.active} active · ${data.listings.closed} closed`}
          icon={<StoreIcon size={22} color="#059669" />} bg="#d1fae5" />
        <MetricCard label="Total Offers" value={data.offers.total}
          sub={`Success rate: ${data.offers.success_rate}`}
          icon={<HandshakeIcon size={22} color="#d97706" />} bg="#fef3c7" />
        <MetricCard label="Deal Rooms" value={data.deals.total}
          sub={`${data.deals.active} active · ${data.deals.closed} closed · ${data.deals.terminated} terminated`}
          icon={<BarChartIcon size={22} color="#7c3aed" />} bg="#ede9fe" />
      </div>

      {/* ── CLOSED DEAL VALUE ─────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #0a1628, #1e3a5f)",
        borderRadius: 14, padding: "24px 28px", marginBottom: 28,
        border: "1px solid rgba(96,165,250,0.2)",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontSize: 12, color: "#60a5fa", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Total Closed Deal Value
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: "white",
            fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
            ₦{((data.deals.total_closed_value || 0) / 1e6).toFixed(2)}M
          </div>
          <div style={{ fontSize: 13, color: "#93c5fd", marginTop: 4 }}>
            Across {data.deals.closed} successfully closed deal{data.deals.closed !== 1 ? "s" : ""}
          </div>
        </div>
        <div style={{
          width: 80, height: 80, background: "rgba(37,99,235,0.3)",
          border: "1px solid rgba(96,165,250,0.3)", borderRadius: 20,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <BarChartIcon size={36} color="#60a5fa" />
        </div>
      </div>

      {/* ── PENDING ADVISOR VERIFICATION ──────────── */}
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
            Pending Advisor Verification
          </h2>
          <span style={{
            background: data.pending_advisors.length > 0 ? "#fef3c7" : "#d1fae5",
            color: data.pending_advisors.length > 0 ? "#d97706" : "#059669",
            padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700
          }}>
            {data.pending_advisors.length} pending
          </span>
        </div>

        {!data.pending_advisors.length ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <CheckCircleIcon size={32} color="#059669" />
            <p style={{ color: "#64748b", fontSize: 15, marginTop: 12 }}>
              All advisors are verified ✅
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Name", "Email", "Registered", "Action"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 20px", textAlign: "left",
                      fontSize: 11, fontWeight: 700, color: "#94a3b8",
                      textTransform: "uppercase", letterSpacing: "0.07em"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.pending_advisors.map((a) => (
                  <tr key={a.id} style={{ borderTop: "1px solid #f1f5f9" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 36, height: 36,
                          background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
                          borderRadius: "50%", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          color: "white", fontWeight: 800, fontSize: 13
                        }}>
                          {a.full_name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                          {a.full_name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>
                      {a.email}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 12, color: "#94a3b8" }}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <button
                        onClick={() => handleVerify(a.id)}
                        disabled={verifying === a.id}
                        style={{
                          padding: "8px 18px",
                          background: verifying === a.id ? "#94a3b8"
                            : "linear-gradient(135deg, #059669, #10b981)",
                          color: "white", border: "none", borderRadius: 7,
                          fontSize: 13, fontWeight: 700, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6
                        }}>
                        <ShieldIcon size={13} color="white" />
                        {verifying === a.id ? "Verifying..." : "Verify Advisor"}
                      </button>
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