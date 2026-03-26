import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  getDealRoom, updateDealStage, acknowledgeNDA,
  uploadDocument, toggleChecklist, addChecklistItem,
  confirmClose, proposeTermSheet, approveTermSheet,
  confirmDocument, getAvailableAdvisors, assignAdvisor
} from "../services/api";
import {
  CheckCircleIcon, ShieldIcon, BuildingIcon,
  BarChartIcon, MessageIcon, ArrowRightIcon,
  PlusIcon, UsersIcon
} from "../components/Icons";

const STAGES = [
  { key: "interested",    label: "Interested",   desc: "Offer accepted, parties connected" },
  { key: "nda_sent",      label: "NDA Sent",      desc: "NDA shared with both parties" },
  { key: "nda_signed",    label: "NDA Signed",    desc: "Both parties acknowledged NDA" },
  { key: "due_diligence", label: "Due Diligence", desc: "Documents under review" },
  { key: "term_sheet",    label: "Term Sheet",    desc: "Deal terms being finalised" },
  { key: "closed",        label: "Closed",        desc: "Deal successfully completed 🎉" },
];

const NDA_TEXT = `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into by and between the Seller and the Investor/Buyer identified in this deal room on the ValueBridge platform.

1. CONFIDENTIAL INFORMATION
Both parties agree that all business information, financial data, operational details, customer lists, and any other proprietary information shared during this due diligence process shall be considered confidential.

2. OBLIGATIONS
Both parties agree to:
- Keep all shared information strictly confidential
- Not disclose any information to third parties without written consent
- Use the information solely for evaluating this potential transaction
- Return or destroy all confidential materials if the deal does not proceed

3. DURATION
This agreement shall remain in effect for 2 years from the date of signing.

4. GOVERNING LAW
This agreement shall be governed by the laws of the Federal Republic of Nigeria.

By acknowledging this NDA on the ValueBridge platform, both parties agree to be bound by these terms.`;

export default function DealRoom() {
  const { id }    = useParams();
  const { user }  = useAuth();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newItem, setNewItem]     = useState("");
  const [docName, setDocName]     = useState("");
  const [docType, setDocType]     = useState("financial");
  const [docDesc, setDocDesc]     = useState("");
  const [showNDA, setShowNDA]     = useState(false);
  const [updating, setUpdating]   = useState(false);
  const [tsForm, setTsForm] = useState({
    amount: "", stake: "", payment_terms: "", conditions: ""
  });
  const [advisors, setAdvisors]         = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");

  const load = () => {
    getDealRoom(id)
      .then((r) => setData(r.data))
      .catch(() => alert("Could not load deal room."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getAvailableAdvisors().then((r) => setAdvisors(r.data)).catch(() => {});
  }, [id]);

  if (loading) return (
    <Layout title="Deal Room" subtitle="Loading...">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        padding: 80, flexDirection: "column", gap: 14 }}>
        <div style={{ width: 36, height: 36, border: "3px solid #dbeafe",
          borderTopColor: "#2563eb", borderRadius: "50%",
          animation: "spin 0.7s linear infinite" }} />
        <span style={{ color: "#64748b", fontSize: 14 }}>Loading deal room...</span>
      </div>
    </Layout>
  );

  if (!data) return (
    <Layout title="Deal Room">
      <div style={{ textAlign: "center", padding: 60 }}>
        <h3>Deal room not found</h3>
        <Link to="/marketplace">← Back to Marketplace</Link>
      </div>
    </Layout>
  );

  const { deal_room, documents, checklist } = data;
  const isSeller   = user?.id === deal_room.seller_id;
  const isInvestor = user?.id === deal_room.investor_id;
  const isAdvisor  = user?.id === deal_room.advisor_id;
  const ndaComplete     = deal_room.nda_acknowledged_seller && deal_room.nda_acknowledged_investor;
  const myNDADone       = isSeller ? deal_room.nda_acknowledged_seller : deal_room.nda_acknowledged_investor;
  const currentStageIdx = STAGES.findIndex((s) => s.key === deal_room.stage);
  const completedItems  = checklist.filter((c) => c.completed).length;
  const isTerminated    = deal_room.stage === "terminated";
  const isClosed        = deal_room.stage === "closed";

  const act = async (fn, ...args) => {
    setUpdating(true);
    try { await fn(...args); load(); }
    catch (err) { alert(err.response?.data?.detail || "Action failed."); }
    finally { setUpdating(false); }
  };

  const tabs = [
    { key: "overview",    label: "Overview" },
    { key: "nda",         label: `NDA ${ndaComplete ? "✓" : ""}` },
    { key: "documents",   label: `Documents (${documents.length})` },
    { key: "checklist",   label: `Checklist (${completedItems}/${checklist.length})` },
    { key: "termsheet",   label: "Term Sheet" },
  ];

  const inp = {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, outline: "none", background: "#f8fafc",
    color: "#0f172a", boxSizing: "border-box"
  };
  const focusInp = (e) => {
    e.target.style.borderColor = "#2563eb";
    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
  };
  const blurInp = (e) => {
    e.target.style.borderColor = "#e2e8f0";
    e.target.style.boxShadow = "none";
  };

  return (
    <Layout
      title={`Deal Room #${deal_room.id} — ${deal_room.business_name || `Listing #${deal_room.listing_id}`}`}
      subtitle={isSeller ? "You are the Seller" : isInvestor ? "You are the Investor" : "You are the Advisor"}
      action={
        <Link to="/marketplace" style={{
          padding: "9px 18px", background: "#f8fafc",
          color: "#475569", border: "1.5px solid #e2e8f0",
          borderRadius: 8, fontSize: 13, fontWeight: 600,
          textDecoration: "none"
        }}>← Back to Marketplace</Link>
      }
    >

      {/* ── NDA MODAL ─────────────────────────────── */}
      {showNDA && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(2,8,23,0.75)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 600,
            maxHeight: "80vh", overflow: "hidden",
            display: "flex", flexDirection: "column",
            boxShadow: "0 32px 80px rgba(0,0,0,0.3)"
          }}>
            <div style={{
              padding: "20px 24px",
              background: "linear-gradient(135deg, #0a1628, #1e3a5f)",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>
                  Non-Disclosure Agreement
                </div>
                <div style={{ color: "#93c5fd", fontSize: 13, marginTop: 3 }}>
                  Please read carefully before acknowledging
                </div>
              </div>
              <button onClick={() => setShowNDA(false)} style={{
                width: 32, height: 32, border: "none",
                background: "rgba(255,255,255,0.1)", borderRadius: "50%",
                color: "white", fontSize: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "#f8fafc" }}>
              <pre style={{ fontFamily: "inherit", fontSize: 13, color: "#334155",
                lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{NDA_TEXT}</pre>
            </div>
            <div style={{
              padding: "16px 24px", borderTop: "1px solid #e2e8f0",
              display: "flex", gap: 10, alignItems: "center"
            }}>
              <div style={{ flex: 1, fontSize: 13, color: "#64748b" }}>
                By clicking "I Acknowledge", you agree to be bound by these terms.
              </div>
              <button onClick={() => act(acknowledgeNDA, id)} disabled={updating} style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8
              }}>
                <ShieldIcon size={15} color="white" />
                {updating ? "Processing..." : "I Acknowledge"}
              </button>
              <button onClick={() => setShowNDA(false)} style={{
                padding: "12px 18px", background: "#f1f5f9",
                color: "#475569", border: "1px solid #e2e8f0",
                borderRadius: 8, fontSize: 14, cursor: "pointer"
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TERMINATED BANNER ─────────────────────── */}
      {isTerminated && (
        <div style={{
          background: "#fff1f2", border: "1px solid #fecdd3",
          borderRadius: 12, padding: "16px 20px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 12
        }}>
          <div style={{
            width: 40, height: 40, background: "#fecdd3", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0
          }}>✕</div>
          <div>
            <div style={{ fontWeight: 700, color: "#e11d48", fontSize: 15 }}>
              Deal Terminated
            </div>
            <div style={{ fontSize: 13, color: "#be123c" }}>
              This deal was terminated. The business listing remains active on the marketplace.
            </div>
          </div>
        </div>
      )}

      {/* ── CLOSED BANNER ─────────────────────────── */}
      {isClosed && (
        <div style={{
          background: "linear-gradient(135deg, #0a1628, #1e3a5f)",
          borderRadius: 12, padding: "20px 24px", marginBottom: 24,
          border: "1px solid rgba(74,222,128,0.2)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <CheckCircleIcon size={28} color="#4ade80" />
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>
                🎉 Deal Successfully Closed!
              </div>
              <div style={{ color: "#93c5fd", fontSize: 13, marginTop: 3 }}>
                Final amount: <strong style={{ color: "white" }}>
                  ₦{((deal_room.closed_amount || deal_room.term_sheet_amount || 0) / 1e6).toFixed(2)}M
                </strong>
                {deal_room.term_sheet_stake && (
                  <span> · Stake: <strong style={{ color: "white" }}>
                    {deal_room.term_sheet_stake}%
                  </strong></span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE TRACKER ─────────────────────────── */}
      {!isTerminated && (
        <div style={{
          background: "#ffffff", borderRadius: 14,
          border: "1px solid #e2e8f0", padding: "24px 28px",
          marginBottom: 24, boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 20
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Deal Progress
            </h2>
            <span style={{
              fontSize: 12, padding: "4px 14px", borderRadius: 20, fontWeight: 700,
              background: isClosed ? "#d1fae5" : "#dbeafe",
              color: isClosed ? "#065f46" : "#1d4ed8"
            }}>{STAGES[currentStageIdx]?.label || deal_room.stage}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            {STAGES.map((stage, i) => {
              const done    = i < currentStageIdx;
              const current = i === currentStageIdx;
              return (
                <div key={stage.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ textAlign: "center", flex: "none", width: 80 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", margin: "0 auto 8px",
                      background: done ? "#059669"
                        : current ? "linear-gradient(135deg, #1d4ed8, #2563eb)" : "#f1f5f9",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: current ? "0 4px 14px rgba(37,99,235,0.4)" : "none",
                      border: !done && !current ? "2px solid #e2e8f0" : "none"
                    }}>
                      {done
                        ? <CheckCircleIcon size={18} color="white" />
                        : <span style={{ fontSize: 13, fontWeight: 700,
                          color: current ? "white" : "#94a3b8" }}>{i + 1}</span>
                      }
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 700,
                      color: done ? "#059669" : current ? "#1d4ed8" : "#94a3b8",
                      lineHeight: 1.3
                    }}>{stage.label}</div>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, borderRadius: 1,
                      background: done ? "#059669" : "#e2e8f0"
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Stage advance */}
          {!isClosed && !isTerminated && isSeller && (() => {
            const nextStage = STAGES[currentStageIdx + 1];
            if (!nextStage || nextStage.key === "closed") return null; // Never show "Advance to Closed"
            const ndaRequired = ["due_diligence","term_sheet"].includes(nextStage?.key);
            const ndaBlocked  = ndaRequired && !ndaComplete;
            return (
              <div style={{
                marginTop: 20, padding: "12px 16px",
                background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
                    Current: {STAGES[currentStageIdx]?.label}
                  </span>
                  <span style={{ fontSize: 12, color: "#3b82f6", marginLeft: 8 }}>
                    — {STAGES[currentStageIdx]?.desc}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  {ndaBlocked && (
                    <div style={{ fontSize: 11, color: "#e11d48" }}>
                      ⚠️ Both parties must sign NDA first
                    </div>
                  )}
                  <button
                    onClick={() => act(updateDealStage, id, nextStage.key)}
                    disabled={updating || ndaBlocked}
                    style={{
                      padding: "7px 16px",
                      background: ndaBlocked ? "#94a3b8"
                        : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                      color: "white", border: "none", borderRadius: 7,
                      fontSize: 12, fontWeight: 700,
                      cursor: ndaBlocked ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: 6
                    }}>
                    Advance to {nextStage?.label}
                    <ArrowRightIcon size={12} color="white" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── TABS ──────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 24,
        background: "#f1f5f9", borderRadius: 10, padding: 4,
        width: "fit-content"
      }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: "9px 18px", border: "none", borderRadius: 7,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: activeTab === t.key ? "#ffffff" : "transparent",
            color: activeTab === t.key ? "#0f172a" : "#64748b",
            boxShadow: activeTab === t.key ? "0 1px 4px rgba(15,23,42,0.08)" : "none",
            transition: "all 0.15s"
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────── */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Deal info */}
          <div style={{
            background: "#ffffff", borderRadius: 14,
            border: "1px solid #e2e8f0", padding: 24,
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: "#0f172a" }}>
              Deal Information
            </h3>
            {[
              { label: "Business",     value: deal_room.business_name || `Listing #${deal_room.listing_id}` },
              { label: "Industry",     value: deal_room.business_industry || "—" },
              { label: "Deal Room",    value: `#${deal_room.id}` },
              { label: "Your Role",    value: isSeller ? "Seller" : isInvestor ? "Investor" : "Advisor" },
              { label: "Seller",       value: deal_room.seller_name || "—" },
              { label: "Investor",     value: deal_room.investor_name || "—" },
              { label: "Advisor",      value: deal_room.advisor_name || "Not assigned" },
              { label: "Stage",        value: STAGES.find(s => s.key === deal_room.stage)?.label || deal_room.stage },
              { label: "Started",      value: new Date(deal_room.created_at).toLocaleDateString() },
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex", justifyContent: "space-between",
                padding: "9px 0", borderBottom: "1px solid #f8fafc"
              }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Business info — locked until NDA */}
          <div style={{
            background: "#ffffff", borderRadius: 14,
            border: "1px solid #e2e8f0", padding: 24,
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: "#0f172a" }}>
              Business Details
            </h3>
            {!ndaComplete ? (
              <div style={{
                padding: "32px 16px", textAlign: "center",
                background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0",
                marginTop: 12
              }}>
                <ShieldIcon size={32} color="#94a3b8" />
                <div style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginTop: 12, marginBottom: 6 }}>
                  Locked until NDA is signed
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  Full business details are revealed after both parties acknowledge the NDA
                </div>
              </div>
            ) : (
              <div>
                {[
                  { label: "Location",     value: deal_room.business_location || "—" },
                  { label: "Annual Revenue", value: deal_room.business_revenue
                    ? `₦${(deal_room.business_revenue / 1e6).toFixed(2)}M` : "—" },
                  { label: "Total Assets", value: deal_room.business_assets
                    ? `₦${(deal_room.business_assets / 1e6).toFixed(2)}M` : "—" },
                  { label: "Liabilities",  value: deal_room.business_liabilities
                    ? `₦${(deal_room.business_liabilities / 1e6).toFixed(2)}M` : "—" },
                  { label: "Employees",    value: deal_room.business_employees || "—" },
                  { label: "Founded",      value: deal_room.business_founded || "—" },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "9px 0", borderBottom: "1px solid #f8fafc"
                  }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{item.value}</span>
                  </div>
                ))}
                {deal_room.business_description && (
                  <div style={{
                    marginTop: 12, padding: "10px 12px",
                    background: "#f8fafc", borderRadius: 8,
                    fontSize: 13, color: "#475569", lineHeight: 1.6
                  }}>
                    {deal_room.business_description}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Advisor assignment */}
          <div style={{
            gridColumn: "1 / -1", background: "#ffffff", borderRadius: 14,
            border: "1px solid #e2e8f0", padding: 24,
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: "#0f172a" }}>
              Advisor Assignment
              <span style={{ fontSize: 12, fontWeight: 400, color: "#64748b", marginLeft: 8 }}>
                (Either party can assign a verified advisor)
              </span>
            </h3>
            {deal_room.advisor_id ? (
              <div style={{
                padding: "14px 16px", background: "#f0fdf4",
                border: "1px solid #bbf7d0", borderRadius: 8,
                display: "flex", alignItems: "center", gap: 10
              }}>
                <CheckCircleIcon size={18} color="#059669" />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#065f46" }}>
                  {deal_room.advisor_name} assigned as advisor
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <select value={selectedAdvisor}
                  onChange={(e) => setSelectedAdvisor(e.target.value)}
                  style={{ ...inp, minWidth: 220, width: "auto" }}
                  onFocus={focusInp} onBlur={blurInp}
                >
                  <option value="">Select a verified advisor</option>
                  {advisors.map((a) => (
                    <option key={a.id} value={a.id}>{a.full_name}</option>
                  ))}
                </select>
                <button
                  onClick={() => act(assignAdvisor, id, parseInt(selectedAdvisor))}
                  disabled={!selectedAdvisor || updating}
                  style={{
                    padding: "11px 20px",
                    background: !selectedAdvisor ? "#94a3b8"
                      : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                    color: "white", border: "none", borderRadius: 8,
                    fontSize: 13, fontWeight: 700,
                    cursor: !selectedAdvisor ? "not-allowed" : "pointer"
                  }}>
                  {advisors.length === 0 ? "No advisors available" : "Assign Advisor"}
                </button>
              </div>
            )}
          </div>

          {/* Message link */}
          <div style={{
            gridColumn: "1 / -1",
            background: "linear-gradient(135deg, #0a1628, #1e3a5f)",
            borderRadius: 14, padding: "20px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            border: "1px solid rgba(96,165,250,0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44, height: 44, background: "rgba(37,99,235,0.3)",
                border: "1px solid rgba(96,165,250,0.3)", borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <MessageIcon size={20} color="#60a5fa" />
              </div>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>
                  Secure Communication
                </div>
                <div style={{ color: "#93c5fd", fontSize: 13 }}>
                  Use Messages to discuss deal details with {isSeller ? "the Investor" : "the Seller"}
                </div>
              </div>
            </div>
            <Link to="/messages" style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              color: "white", borderRadius: 8, fontSize: 13, fontWeight: 700,
              textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)"
            }}>
              <MessageIcon size={14} color="white" />
              Open Messages
            </Link>
          </div>
        </div>
      )}

      {/* ── NDA TAB ───────────────────────────────── */}
      {activeTab === "nda" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{
            background: "#ffffff", borderRadius: 14,
            border: "1px solid #e2e8f0", overflow: "hidden"
          }}>
            <div style={{
              padding: "16px 22px",
              background: "linear-gradient(135deg, #0a1628, #1e3a5f)",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <ShieldIcon size={18} color="#60a5fa" />
              <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
                Non-Disclosure Agreement
              </span>
            </div>
            <div style={{ padding: 20, maxHeight: 400, overflowY: "auto", background: "#f8fafc" }}>
              <pre style={{ fontFamily: "inherit", fontSize: 13, color: "#334155",
                lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{NDA_TEXT}</pre>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
              background: "#ffffff", borderRadius: 14,
              border: "1px solid #e2e8f0", padding: 24
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
                Acknowledgement Status
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {[
                  { label: deal_room.seller_name || "Seller",   done: deal_room.nda_acknowledged_seller },
                  { label: deal_room.investor_name || "Investor", done: deal_room.nda_acknowledged_investor },
                ].map((p) => (
                  <div key={p.label} style={{
                    padding: "12px 16px",
                    background: p.done ? "#f0fdf4" : "#fffbeb",
                    border: `1px solid ${p.done ? "#bbf7d0" : "#fde68a"}`,
                    borderRadius: 8, display: "flex",
                    alignItems: "center", justifyContent: "space-between"
                  }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{p.label}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: p.done ? "#059669" : "#d97706"
                    }}>{p.done ? "✓ Acknowledged" : "⏳ Pending"}</span>
                  </div>
                ))}
              </div>
              {ndaComplete ? (
                <div style={{
                  padding: "14px 16px", background: "#f0fdf4",
                  border: "1px solid #bbf7d0", borderRadius: 8,
                  fontSize: 14, fontWeight: 700, color: "#059669", textAlign: "center"
                }}>✅ NDA Fully Executed — Full business details now visible</div>
              ) : !myNDADone ? (
                <button onClick={() => setShowNDA(true)} style={{
                  width: "100%", padding: "14px",
                  background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "white", border: "none", borderRadius: 8,
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}>
                  <ShieldIcon size={16} color="white" />
                  Review & Sign NDA
                </button>
              ) : (
                <div style={{
                  padding: "14px", background: "#fffbeb",
                  border: "1px solid #fde68a", borderRadius: 8,
                  fontSize: 14, color: "#d97706", textAlign: "center"
                }}>✓ You signed — waiting for other party</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DOCUMENTS TAB ─────────────────────────── */}
      {activeTab === "documents" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Add document */}
          <div style={{
            background: "#ffffff", borderRadius: 14,
            border: "1px solid #e2e8f0", overflow: "hidden"
          }}>
            <div style={{
              padding: "16px 22px",
              background: "linear-gradient(135deg, #0a1628, #1e3a5f)"
            }}>
              <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
                Track Document
              </div>
              <div style={{ color: "#93c5fd", fontSize: 12, marginTop: 3 }}>
                Record documents shared. Both parties confirm receipt.
              </div>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!docName.trim()) return;
              await act(uploadDocument, id, docName, docType, docDesc);
              setDocName(""); setDocType("financial"); setDocDesc("");
            }} style={{ padding: 22 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700,
                  color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
                  Document Name *
                </label>
                <input style={inp} placeholder="e.g. Financial Statement 2024"
                  value={docName} onChange={(e) => setDocName(e.target.value)}
                  onFocus={focusInp} onBlur={blurInp} required />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700,
                  color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
                  Document Type
                </label>
                <select style={{ ...inp, background: "#f8fafc" }}
                  value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value="financial">Financial Statement</option>
                  <option value="legal">Legal Document</option>
                  <option value="registration">Business Registration (CAC)</option>
                  <option value="tax">Tax Records</option>
                  <option value="contract">Contract / Agreement</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700,
                  color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
                  Description
                </label>
                <textarea style={{ ...inp, height: 70, resize: "none" }}
                  placeholder="Brief description..."
                  value={docDesc} onChange={(e) => setDocDesc(e.target.value)}
                  onFocus={focusInp} onBlur={blurInp}
                />
              </div>
              <button type="submit" style={{
                width: "100%", padding: "13px",
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}>
                <PlusIcon size={14} color="white" />
                Add Document Record
              </button>
            </form>
          </div>

          {/* Document list with dual acknowledgement */}
          <div style={{
            background: "#ffffff", borderRadius: 14,
            border: "1px solid #e2e8f0", overflow: "hidden"
          }}>
            <div style={{
              padding: "16px 22px", borderBottom: "1px solid #f1f5f9",
              background: "#f8fafc", display: "flex",
              justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Documents</span>
              <span style={{
                background: "#dbeafe", color: "#1d4ed8",
                padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700
              }}>{documents.length}</span>
            </div>
            <div style={{ padding: 16 }}>
              {!documents.length ? (
                <div style={{ padding: "40px 16px", textAlign: "center" }}>
                  <BarChartIcon size={28} color="#94a3b8" />
                  <div style={{ fontSize: 14, color: "#64748b", marginTop: 10 }}>
                    No documents tracked yet
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {documents.map((doc) => {
                    const typeColors = {
                      financial: { bg: "#eff6ff", color: "#1d4ed8" },
                      legal:     { bg: "#faf5ff", color: "#7c3aed" },
                      registration: { bg: "#f0fdf4", color: "#059669" },
                      tax:       { bg: "#fffbeb", color: "#d97706" },
                      contract:  { bg: "#fff1f2", color: "#e11d48" },
                      other:     { bg: "#f8fafc", color: "#475569" },
                    };
                    const tc = typeColors[doc.file_type] || typeColors.other;
                    const myConfirmed = isSeller ? doc.seller_confirmed : doc.investor_confirmed;
                    const bothConfirmed = doc.seller_confirmed && doc.investor_confirmed;
                    return (
                      <div key={doc.id} style={{
                        padding: "14px 16px", background: "#f8fafc",
                        borderRadius: 10,
                        border: bothConfirmed ? "1px solid #bbf7d0" : "1px solid #f1f5f9"
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, background: tc.bg,
                            borderRadius: 8, display: "flex",
                            alignItems: "center", justifyContent: "center", flexShrink: 0
                          }}>
                            <BarChartIcon size={16} color={tc.color} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 3 }}>
                              {doc.filename}
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                              <span style={{
                                fontSize: 10, padding: "2px 8px", borderRadius: 20,
                                background: tc.bg, color: tc.color, fontWeight: 700
                              }}>{doc.file_type}</span>
                              <span style={{
                                fontSize: 10, padding: "2px 8px", borderRadius: 20,
                                background: doc.seller_confirmed ? "#d1fae5" : "#f1f5f9",
                                color: doc.seller_confirmed ? "#059669" : "#94a3b8"
                              }}>
                                Seller {doc.seller_confirmed ? "✓" : "pending"}
                              </span>
                              <span style={{
                                fontSize: 10, padding: "2px 8px", borderRadius: 20,
                                background: doc.investor_confirmed ? "#d1fae5" : "#f1f5f9",
                                color: doc.investor_confirmed ? "#059669" : "#94a3b8"
                              }}>
                                Investor {doc.investor_confirmed ? "✓" : "pending"}
                              </span>
                            </div>
                            {!myConfirmed && !isAdvisor && (
                              <button
                                onClick={() => act(confirmDocument, id, doc.id)}
                                style={{
                                  padding: "6px 14px", fontSize: 12, fontWeight: 700,
                                  background: "linear-gradient(135deg, #059669, #10b981)",
                                  color: "white", border: "none", borderRadius: 6,
                                  cursor: "pointer"
                                }}>
                                ✓ Confirm Received
                              </button>
                            )}
                            {bothConfirmed && (
                              <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>
                                ✅ Both parties confirmed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CHECKLIST TAB ─────────────────────────── */}
      {activeTab === "checklist" && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <div style={{
            background: "#ffffff", borderRadius: 14,
            border: "1px solid #e2e8f0", overflow: "hidden"
          }}>
            <div style={{
              padding: "16px 22px", borderBottom: "1px solid #f1f5f9",
              background: "#f8fafc", display: "flex",
              justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                  Due Diligence Checklist
                </span>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  {completedItems} of {checklist.length} items completed ·
                  <span style={{ color: "#1d4ed8", marginLeft: 4 }}>
                    Investor-driven verification
                  </span>
                </div>
              </div>
              <div style={{ width: 100 }}>
                <div style={{ height: 6, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: checklist.length > 0
                      ? `${(completedItems / checklist.length) * 100}%` : "0%",
                    background: "linear-gradient(90deg, #1d4ed8, #3b82f6)",
                    borderRadius: 10
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, textAlign: "right" }}>
                  {checklist.length > 0
                    ? Math.round((completedItems / checklist.length) * 100) : 0}%
                </div>
              </div>
            </div>
            <div style={{ padding: "12px 16px" }}>
              {/* Investor priority note */}
              <div style={{
                padding: "10px 14px", background: "#eff6ff",
                borderRadius: 8, border: "1px solid #bfdbfe",
                marginBottom: 12, fontSize: 12, color: "#1d4ed8"
              }}>
                {isInvestor || isAdvisor
                  ? "💡 Click items to confirm you have verified them during due diligence."
                  : "📋 As the seller, your role is to provide documents. The investor verifies each item."
                }
              </div>
              {checklist.map((item) => {
                const canComplete = isInvestor || isAdvisor;
                const roleLabel = item.completed_by_role;
                return (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 8, marginBottom: 6,
                    background: item.completed ? "#f0fdf4" : "#f8fafc",
                    border: `1px solid ${item.completed ? "#bbf7d0" : "#f1f5f9"}`,
                    cursor: canComplete ? "pointer" : "default",
                    opacity: (!canComplete && !isAdvisor) ? 0.7 : 1
                  }}
                    onClick={() => canComplete && act(toggleChecklist, id, item.id)}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      background: item.completed ? "linear-gradient(135deg, #059669, #10b981)" : "#ffffff",
                      border: item.completed ? "none" : "2px solid #cbd5e1",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {item.completed && <CheckCircleIcon size={14} color="white" />}
                    </div>
                    <span style={{
                      fontSize: 14, flex: 1, color: item.completed ? "#065f46" : "#334155",
                      textDecoration: item.completed ? "line-through" : "none"
                    }}>{item.item}</span>
                    {item.completed && roleLabel && (
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 20,
                        background: roleLabel === "investor" ? "#dbeafe" : "#fef3c7",
                        color: roleLabel === "investor" ? "#1d4ed8" : "#d97706",
                        fontWeight: 700, textTransform: "capitalize"
                      }}>✓ {roleLabel}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
              background: "#ffffff", borderRadius: 14,
              border: "1px solid #e2e8f0", padding: 20
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#0f172a" }}>
                Add Item
              </h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newItem.trim()) return;
                await act(addChecklistItem, id, newItem);
                setNewItem("");
              }}>
                <input style={{ ...inp, marginBottom: 10 }}
                  placeholder="e.g. Verify property ownership"
                  value={newItem} onChange={(e) => setNewItem(e.target.value)}
                  onFocus={focusInp} onBlur={blurInp} required
                />
                <button type="submit" style={{
                  width: "100%", padding: "11px",
                  background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "white", border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                }}>
                  <PlusIcon size={13} color="white" />
                  Add Item
                </button>
              </form>
            </div>
            <div style={{
              background: "linear-gradient(160deg, #0a1628, #020817)",
              borderRadius: 14, padding: 20,
              border: "1px solid rgba(255,255,255,0.06)"
            }}>
              <div style={{ fontSize: 10, color: "#60a5fa", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
                Summary
              </div>
              {[
                { label: "Total",     value: checklist.length },
                { label: "Completed", value: completedItems },
                { label: "Remaining", value: checklist.length - completedItems },
                { label: "Progress",  value: checklist.length > 0
                  ? `${Math.round((completedItems / checklist.length) * 100)}%` : "0%" },
              ].map((item, i) => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between", padding: "10px 0",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none"
                }}>
                  <span style={{ color: "#93c5fd", fontSize: 13 }}>{item.label}</span>
                  <span style={{ color: "white", fontWeight: 800, fontSize: 16,
                    fontFamily: "Georgia, serif" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TERM SHEET TAB ────────────────────────── */}
      {activeTab === "termsheet" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Propose term sheet */}
          {!isTerminated && !isClosed && (
            <div style={{
              background: "#ffffff", borderRadius: 14,
              border: "1px solid #e2e8f0", overflow: "hidden"
            }}>
              <div style={{
                padding: "16px 22px",
                background: "linear-gradient(135deg, #0a1628, #1e3a5f)"
              }}>
                <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
                  {deal_room.term_sheet_amount ? "Update Term Sheet" : "Propose Term Sheet"}
                </div>
                <div style={{ color: "#93c5fd", fontSize: 12, marginTop: 3 }}>
                  Either party can propose. Both must approve to proceed.
                </div>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                await act(proposeTermSheet, id, {
                  amount:        parseFloat(tsForm.amount),
                  stake:         parseFloat(tsForm.stake),
                  payment_terms: tsForm.payment_terms,
                  conditions:    tsForm.conditions || null
                });
                setTsForm({ amount: "", stake: "", payment_terms: "", conditions: "" });
              }} style={{ padding: 22 }}>
                {[
                  { label: "Final Amount (₦) *", key: "amount", type: "number", placeholder: "e.g. 9000000" },
                  { label: "Stake / Equity (%) *", key: "stake", type: "number", placeholder: "e.g. 30" },
                  { label: "Payment Terms *", key: "payment_terms", type: "text", placeholder: "e.g. 50% upfront, 50% on completion" },
                ].map((f) => (
                  <div key={f.key} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700,
                      color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
                      {f.label}
                    </label>
                    <input style={inp} type={f.type} placeholder={f.placeholder}
                      value={tsForm[f.key]}
                      onChange={(e) => setTsForm({ ...tsForm, [f.key]: e.target.value })}
                      onFocus={focusInp} onBlur={blurInp} required
                    />
                  </div>
                ))}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700,
                    color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
                    Conditions / Notes
                  </label>
                  <textarea style={{ ...inp, height: 80, resize: "none" }}
                    placeholder="Any additional conditions or notes..."
                    value={tsForm.conditions}
                    onChange={(e) => setTsForm({ ...tsForm, conditions: e.target.value })}
                    onFocus={focusInp} onBlur={blurInp}
                  />
                </div>
                <button type="submit" style={{
                  width: "100%", padding: "13px",
                  background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "white", border: "none", borderRadius: 8,
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}>
                  <ArrowRightIcon size={14} color="white" />
                  Submit Term Sheet
                </button>
              </form>
            </div>
          )}

          {/* Term sheet status + approval + close confirmation */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {deal_room.term_sheet_amount ? (
              <>
                {/* Current term sheet */}
                <div style={{
                  background: "#ffffff", borderRadius: 14,
                  border: "1px solid #e2e8f0", padding: 24
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: "#0f172a" }}>
                    Current Term Sheet
                  </h3>
                  {[
                    { label: "Final Amount", value: `₦${(deal_room.term_sheet_amount / 1e6).toFixed(2)}M` },
                    { label: "Stake / Equity", value: `${deal_room.term_sheet_stake}%` },
                    { label: "Payment Terms", value: deal_room.term_sheet_payment_terms },
                    { label: "Conditions", value: deal_room.term_sheet_conditions || "None" },
                    { label: "Proposed by", value: deal_room.term_sheet_proposed_by === deal_room.seller_id
                      ? deal_room.seller_name : deal_room.investor_name },
                  ].map((item) => (
                    <div key={item.label} style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "9px 0", borderBottom: "1px solid #f8fafc"
                    }}>
                      <span style={{ fontSize: 13, color: "#64748b" }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a",
                        maxWidth: 200, textAlign: "right" }}>{item.value}</span>
                    </div>
                  ))}

                  {/* Approval status */}
                  <div style={{ marginTop: 16 }}>
                    {[
                      { label: deal_room.seller_name || "Seller",
                        status: deal_room.term_sheet_seller_approved },
                      { label: deal_room.investor_name || "Investor",
                        status: deal_room.term_sheet_investor_approved },
                    ].map((p) => (
                      <div key={p.label} style={{
                        padding: "10px 14px", marginBottom: 8, borderRadius: 8,
                        background: p.status === true ? "#f0fdf4"
                          : p.status === false ? "#fff1f2" : "#fffbeb",
                        border: `1px solid ${p.status === true ? "#bbf7d0"
                          : p.status === false ? "#fecdd3" : "#fde68a"}`
                      }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{p.label}: </span>
                        <span style={{
                          fontSize: 13, fontWeight: 700,
                          color: p.status === true ? "#059669"
                            : p.status === false ? "#e11d48" : "#d97706"
                        }}>
                          {p.status === true ? "✓ Approved"
                            : p.status === false ? "✕ Rejected" : "⏳ Pending"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Approve / Reject buttons */}
                  {!isTerminated && !isClosed && (() => {
                    const myApproval = isSeller
                      ? deal_room.term_sheet_seller_approved
                      : deal_room.term_sheet_investor_approved;
                    if (myApproval === null || myApproval === undefined) {
                      return (
                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                          <button onClick={() => act(approveTermSheet, id, true)} style={{
                            flex: 1, padding: "11px",
                            background: "linear-gradient(135deg, #059669, #10b981)",
                            color: "white", border: "none", borderRadius: 8,
                            fontSize: 14, fontWeight: 700, cursor: "pointer"
                          }}>✓ Approve</button>
                          <button onClick={() => {
                            if (window.confirm("Rejecting the term sheet will terminate this deal. The business will remain listed. Are you sure?")) {
                              act(approveTermSheet, id, false);
                            }
                          }} style={{
                            flex: 1, padding: "11px", background: "#fff1f2",
                            color: "#e11d48", border: "1.5px solid #fecdd3",
                            borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer"
                          }}>✕ Reject</button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Two-party close confirmation */}
                {deal_room.term_sheet_seller_approved && deal_room.term_sheet_investor_approved
                  && !isClosed && !isTerminated && (
                  <div style={{
                    background: "linear-gradient(135deg, #0a1628, #1e3a5f)",
                    borderRadius: 14, padding: 24,
                    border: "1px solid rgba(74,222,128,0.2)"
                  }}>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                      🎉 Term Sheet Approved by Both Parties!
                    </div>
                    <div style={{ color: "#93c5fd", fontSize: 13, marginBottom: 18 }}>
                      Both parties must now confirm to officially close the deal.
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                      {[
                        { label: deal_room.seller_name || "Seller",
                          confirmed: deal_room.close_confirmed_seller },
                        { label: deal_room.investor_name || "Investor",
                          confirmed: deal_room.close_confirmed_investor },
                      ].map((p) => (
                        <div key={p.label} style={{
                          padding: "10px 14px", borderRadius: 8,
                          background: p.confirmed ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${p.confirmed ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)"}`
                        }}>
                          <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>
                            {p.label}:
                          </span>
                          <span style={{
                            marginLeft: 8, fontSize: 13, fontWeight: 700,
                            color: p.confirmed ? "#4ade80" : "#94a3b8"
                          }}>{p.confirmed ? "✓ Confirmed" : "⏳ Pending"}</span>
                        </div>
                      ))}
                    </div>
                    {(() => {
                      const myConfirmed = isSeller
                        ? deal_room.close_confirmed_seller
                        : deal_room.close_confirmed_investor;
                      const incompleteItems = checklist.filter((c) => !c.completed);
                      const allComplete = incompleteItems.length === 0;

                      if (!myConfirmed && !isAdvisor) {
                        return (
                          <div>
                            {!allComplete && (
                              <div style={{
                                padding: "12px 14px", background: "#fff1f2",
                                border: "1px solid #fecdd3", borderRadius: 8, marginBottom: 12
                              }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#e11d48", marginBottom: 6 }}>
                                  ⚠️ {incompleteItems.length} checklist item{incompleteItems.length > 1 ? "s" : ""} still pending
                                </div>
                                <div style={{ fontSize: 12, color: "#be123c" }}>
                                  All due diligence items must be completed before closing.
                                  Go to the Checklist tab to complete them.
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => act(confirmClose, id)}
                              disabled={updating || !allComplete}
                              style={{
                                width: "100%", padding: "14px",
                                background: !allComplete ? "#94a3b8"
                                  : "linear-gradient(135deg, #059669, #10b981)",
                                color: "white", border: "none", borderRadius: 8,
                                fontSize: 15, fontWeight: 700,
                                cursor: !allComplete ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center",
                                justifyContent: "center", gap: 8,
                                boxShadow: !allComplete ? "none" : "0 4px 14px rgba(5,150,105,0.3)"
                              }}>
                              <CheckCircleIcon size={18} color="white" />
                              {!allComplete ? "Complete all checklist items first" : "Confirm Deal Closure"}
                            </button>
                          </div>
                        );
                      }
                      return (
                        <div style={{
                          padding: "12px", background: "rgba(74,222,128,0.1)",
                          borderRadius: 8, color: "#4ade80",
                          fontSize: 14, fontWeight: 700, textAlign: "center"
                        }}>✓ You have confirmed — waiting for other party</div>
                      );
                    })()}
                  </div>
                )}
              </>
            ) : (
              <div style={{
                background: "#ffffff", borderRadius: 14,
                border: "1px solid #e2e8f0", padding: 40, textAlign: "center"
              }}>
                <div style={{
                  width: 56, height: 56, background: "#f1f5f9", borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px"
                }}>
                  <BarChartIcon size={26} color="#94a3b8" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  No term sheet yet
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>
                  Either party can propose a term sheet from the form on the left.
                  Both parties must approve before the deal can be closed.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}