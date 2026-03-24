import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  getDealRoom, updateDealStage, acknowledgeNDA,
  uploadDocument, toggleChecklist, addChecklistItem
} from "../services/api";
import {
  CheckCircleIcon, ShieldIcon, BuildingIcon,
  BarChartIcon, MessageIcon, ArrowRightIcon, PlusIcon
} from "../components/Icons";

const STAGES = [
  { key: "interested",    label: "Interested",     desc: "Offer accepted, parties connected" },
  { key: "nda_sent",      label: "NDA Sent",        desc: "NDA document shared with both parties" },
  { key: "nda_signed",    label: "NDA Signed",      desc: "Both parties acknowledged NDA" },
  { key: "due_diligence", label: "Due Diligence",   desc: "Documents under review" },
  { key: "term_sheet",    label: "Term Sheet",      desc: "Deal terms being finalized" },
  { key: "closed",        label: "Closed",          desc: "Deal successfully completed! 🎉" },
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
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newItem, setNewItem]   = useState("");
  const [docName, setDocName]   = useState("");
  const [docType, setDocType]   = useState("financial");
  const [docDesc, setDocDesc]   = useState("");
  const [showNDA, setShowNDA]   = useState(false);
  const [updating, setUpdating] = useState(false);
  const [closedAmount, setClosedAmount] = useState("");

  const load = useCallback(() => {
    getDealRoom(id)
      .then((r) => setData(r.data))
      .catch(() => alert("Could not load deal room."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <Layout title="Deal Room" subtitle="Loading...">
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: 80,
        flexDirection: "column", gap: 14
      }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid #dbeafe",
          borderTopColor: "#2563eb",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite"
        }} />
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
  const currentStageIdx = STAGES.findIndex((s) => s.key === deal_room.stage);
  const completedItems  = checklist.filter((c) => c.completed).length;
  const myNDADone = isSeller
    ? deal_room.nda_acknowledged_seller
    : deal_room.nda_acknowledged_investor;

  const handleStageUpdate = async (stage) => {
    setUpdating(true);
    try {
      await updateDealStage(id, stage, stage === "closed" ? parseFloat(closedAmount) : null);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update stage.");
    } finally { setUpdating(false); }
  };

  const handleNDA = async () => {
    setUpdating(true);
    try {
      await acknowledgeNDA(id);
      setShowNDA(false);
      load();
    } catch { alert("Failed to acknowledge NDA."); }
    finally { setUpdating(false); }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docName.trim()) return;
    try {
      await uploadDocument(id, docName, docType, docDesc);
      setDocName(""); setDocType("financial"); setDocDesc("");
      load();
    } catch { alert("Failed to add document."); }
  };

  const handleToggle = async (itemId) => {
    try {
      await toggleChecklist(id, itemId);
      load();
    } catch { alert("Failed to update checklist."); }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      await addChecklistItem(id, newItem);
      setNewItem("");
      load();
    } catch { alert("Failed to add item."); }
  };

  const tabs = [
    { key: "overview",    label: "Overview" },
    { key: "nda",         label: "NDA" + (deal_room.nda_acknowledged_seller && deal_room.nda_acknowledged_investor ? " ✓" : "") },
    { key: "documents",   label: `Documents (${documents.length})` },
    { key: "checklist",   label: `Checklist (${completedItems}/${checklist.length})` },
  ];

  return (
    <Layout
      title={`Deal Room #${deal_room.id}`}
      subtitle={`Listing #${deal_room.listing_id} — ${isSeller ? "You are the Seller" : "You are the Investor"}`}
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
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            background: "#ffffff", borderRadius: 16,
            width: "100%", maxWidth: 600,
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
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%", color: "white",
                fontSize: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>✕</button>
            </div>

            <div style={{
              flex: 1, overflowY: "auto", padding: "24px",
              background: "#f8fafc"
            }}>
              <pre style={{
                fontFamily: "inherit", fontSize: 13,
                color: "#334155", lineHeight: 1.8,
                whiteSpace: "pre-wrap", margin: 0
              }}>{NDA_TEXT}</pre>
            </div>

            <div style={{
              padding: "16px 24px",
              borderTop: "1px solid #e2e8f0",
              display: "flex", gap: 10, alignItems: "center"
            }}>
              <div style={{
                flex: 1, fontSize: 13, color: "#64748b"
              }}>
                By clicking "I Acknowledge", you agree to the terms above.
              </div>
              <button onClick={handleNDA} disabled={updating} style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
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

      {/* ── STAGE TRACKER ─────────────────────────── */}
      <div style={{
        background: "#ffffff", borderRadius: 14,
        border: "1px solid #e2e8f0", padding: "24px 28px",
        marginBottom: 24,
        boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 20
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Deal Progress
          </h2>
          <span style={{
            fontSize: 12, padding: "4px 14px", borderRadius: 20,
            fontWeight: 700,
            background: deal_room.stage === "closed" ? "#d1fae5" : "#dbeafe",
            color: deal_room.stage === "closed" ? "#065f46" : "#1d4ed8"
          }}>
            {STAGES[currentStageIdx]?.label}
          </span>
        </div>

        {/* Stage steps */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {STAGES.map((stage, i) => {
            const done    = i < currentStageIdx;
            const current = i === currentStageIdx;
            const future  = i > currentStageIdx;
            return (
              <div key={stage.key} style={{
                display: "flex", alignItems: "center", flex: 1
              }}>
                <div style={{ textAlign: "center", flex: "none", width: 80 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", margin: "0 auto 8px",
                    background: done
                      ? "#059669"
                      : current
                        ? "linear-gradient(135deg, #1d4ed8, #2563eb)"
                        : "#f1f5f9",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: current ? "0 4px 14px rgba(37,99,235,0.4)" : "none",
                    border: future ? "2px solid #e2e8f0" : "none",
                    transition: "all 0.3s"
                  }}>
                    {done ? (
                      <CheckCircleIcon size={18} color="white" />
                    ) : (
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: current ? "white" : "#94a3b8"
                      }}>{i + 1}</span>
                    )}
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
                    background: done ? "#059669" : "#e2e8f0",
                    transition: "background 0.3s"
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Current stage info */}
        <div style={{
          marginTop: 20, padding: "12px 16px",
          background: "#eff6ff", borderRadius: 8,
          border: "1px solid #bfdbfe"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
                Current: {STAGES[currentStageIdx]?.label}
              </span>
              <span style={{ fontSize: 12, color: "#3b82f6", marginLeft: 8 }}>
                — {STAGES[currentStageIdx]?.desc}
              </span>
            </div>
            {isSeller && currentStageIdx < STAGES.length - 1 && (() => {
              const nextStage = STAGES[currentStageIdx + 1];
              const ndaRequired = ["due_diligence","term_sheet","closed"].includes(nextStage?.key);
              const ndaBlocked  = ndaRequired && (!deal_room.nda_acknowledged_seller || !deal_room.nda_acknowledged_investor);
              return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  {/* Closed amount input */}
                  {nextStage?.key === "closed" && (
                    <input
                      type="number"
                      placeholder="Final deal amount (₦)"
                      value={closedAmount}
                      onChange={(e) => setClosedAmount(e.target.value)}
                      style={{
                        padding: "7px 12px", borderRadius: 7, fontSize: 13,
                        border: "1.5px solid #bfdbfe", outline: "none",
                        width: 220, background: "#ffffff"
                      }}
                    />
                  )}
                  {ndaBlocked && (
                    <div style={{ fontSize: 11, color: "#e11d48", textAlign: "right" }}>
                      ⚠️ Both parties must sign NDA first
                    </div>
                  )}
                  <button
                    onClick={() => handleStageUpdate(nextStage.key)}
                    disabled={updating || ndaBlocked}
                    style={{
                      padding: "7px 16px",
                      background: ndaBlocked ? "#94a3b8" : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                      color: "white", border: "none", borderRadius: 7,
                      fontSize: 12, fontWeight: 700,
                      cursor: ndaBlocked ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: 6
                    }}>
                    Advance to {nextStage?.label}
                    <ArrowRightIcon size={12} color="white" />
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Closed deal record */}
        {deal_room.stage === "closed" && deal_room.closed_amount && (
          <div style={{
            marginTop: 12, padding: "12px 16px",
            background: "#f0fdf4", borderRadius: 8,
            border: "1px solid #bbf7d0",
            display: "flex", alignItems: "center", gap: 10
          }}>
            <CheckCircleIcon size={18} color="#059669" />
            <span style={{ fontSize: 14, color: "#065f46", fontWeight: 700 }}>
              Deal closed at ₦{(deal_room.closed_amount / 1e6).toFixed(2)}M
            </span>
          </div>
        )}
      </div>

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
              { label: "Deal Room ID",  value: `#${deal_room.id}` },
              { label: "Listing",       value: `#${deal_room.listing_id}` },
              { label: "Your Role",     value: isSeller ? "Seller" : "Investor" },
              { label: "Current Stage", value: STAGES[currentStageIdx]?.label },
              { label: "Created",       value: new Date(deal_room.created_at).toLocaleDateString() },
              { label: "Documents",     value: documents.length },
              { label: "Checklist",     value: `${completedItems}/${checklist.length} completed` },
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex", justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #f8fafc"
              }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* NDA status */}
          <div style={{
            background: "#ffffff", borderRadius: 14,
            border: "1px solid #e2e8f0", padding: 24,
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: "#0f172a" }}>
              NDA Status
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Seller",   done: deal_room.nda_acknowledged_seller },
                { label: "Investor", done: deal_room.nda_acknowledged_investor },
              ].map((party) => (
                <div key={party.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px",
                  background: party.done ? "#f0fdf4" : "#f8fafc",
                  borderRadius: 8,
                  border: `1px solid ${party.done ? "#bbf7d0" : "#e2e8f0"}`
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32,
                      background: party.done ? "#d1fae5" : "#f1f5f9",
                      borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center"
                    }}>
                      {party.done
                        ? <CheckCircleIcon size={16} color="#059669" />
                        : <ShieldIcon size={16} color="#94a3b8" />
                      }
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                      {party.label}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: "3px 10px",
                    borderRadius: 20,
                    background: party.done ? "#d1fae5" : "#f1f5f9",
                    color: party.done ? "#065f46" : "#94a3b8"
                  }}>
                    {party.done ? "Acknowledged ✓" : "Pending"}
                  </span>
                </div>
              ))}
            </div>

            {!myNDADone ? (
              <button onClick={() => setShowNDA(true)} style={{
                width: "100%", padding: "13px",
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8
              }}>
                <ShieldIcon size={16} color="white" />
                Review & Acknowledge NDA
              </button>
            ) : (
              <div style={{
                padding: "13px", background: "#f0fdf4",
                border: "1px solid #bbf7d0", borderRadius: 8,
                fontSize: 14, fontWeight: 600, color: "#059669",
                textAlign: "center", display: "flex",
                alignItems: "center", justifyContent: "center", gap: 8
              }}>
                <CheckCircleIcon size={16} color="#059669" />
                You have acknowledged the NDA
              </div>
            )}
          </div>

          {/* Quick message */}
          <div style={{
            gridColumn: "1 / -1",
            background: "linear-gradient(135deg, #0a1628, #1e3a5f)",
            borderRadius: 14, padding: "20px 24px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid rgba(96,165,250,0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44, height: 44,
                background: "rgba(37,99,235,0.3)",
                border: "1px solid rgba(96,165,250,0.3)",
                borderRadius: 10, display: "flex",
                alignItems: "center", justifyContent: "center"
              }}>
                <MessageIcon size={20} color="#60a5fa" />
              </div>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>
                  Communicate with {isSeller ? "the Investor" : "the Seller"}
                </div>
                <div style={{ color: "#93c5fd", fontSize: 13 }}>
                  Use the Messages page to discuss deal details securely
                </div>
              </div>
            </div>
            <Link to="/messages" style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              color: "white", borderRadius: 8, fontSize: 13,
              fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              display: "flex", alignItems: "center", gap: 6
            }}>
              <MessageIcon size={14} color="white" />
              Open Messages
            </Link>
          </div>

          {/* Advisor assignment */}
          <div style={{
            gridColumn: "1 / -1",
            background: "#ffffff", borderRadius: 14,
            border: "1px solid #e2e8f0", padding: 24,
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#0f172a" }}>
              Advisor Assignment
            </h3>
            {deal_room.advisor_id ? (
              <div style={{
                padding: "14px 16px", background: "#f0fdf4",
                border: "1px solid #bbf7d0", borderRadius: 8,
                display: "flex", alignItems: "center", gap: 10
              }}>
                <CheckCircleIcon size={18} color="#059669" />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#065f46" }}>
                  Advisor assigned to this deal
                </span>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                  Optionally assign a verified ValueBridge advisor to assist with due diligence.
                </p>
                <AdvisorSelector dealId={id} onAssigned={load} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── NDA TAB ───────────────────────────────── */}
      {activeTab === "nda" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* NDA text */}
          <div style={{
            background: "#ffffff", borderRadius: 14,
            border: "1px solid #e2e8f0", overflow: "hidden",
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}>
            <div style={{
              padding: "16px 22px", borderBottom: "1px solid #f1f5f9",
              background: "linear-gradient(135deg, #0a1628, #1e3a5f)",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <ShieldIcon size={18} color="#60a5fa" />
              <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
                Non-Disclosure Agreement
              </span>
            </div>
            <div style={{
              padding: 20, maxHeight: 400,
              overflowY: "auto", background: "#f8fafc"
            }}>
              <pre style={{
                fontFamily: "inherit", fontSize: 13,
                color: "#334155", lineHeight: 1.8,
                whiteSpace: "pre-wrap", margin: 0
              }}>{NDA_TEXT}</pre>
            </div>
          </div>

          {/* Acknowledgement status */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 16
          }}>
            <div style={{
              background: "#ffffff", borderRadius: 14,
              border: "1px solid #e2e8f0", padding: 24,
              boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
                Acknowledgement Status
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Seller",   done: deal_room.nda_acknowledged_seller },
                  { label: "Investor", done: deal_room.nda_acknowledged_investor },
                ].map((p) => (
                  <div key={p.label} style={{
                    padding: "14px 16px",
                    background: p.done ? "#f0fdf4" : "#fffbeb",
                    border: `1px solid ${p.done ? "#bbf7d0" : "#fde68a"}`,
                    borderRadius: 8,
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{p.label}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: p.done ? "#059669" : "#d97706"
                    }}>
                      {p.done ? "✓ Acknowledged" : "⏳ Pending"}
                    </span>
                  </div>
                ))}
              </div>

              {deal_room.nda_acknowledged_seller && deal_room.nda_acknowledged_investor ? (
                <div style={{
                  padding: "14px 16px", background: "#f0fdf4",
                  border: "1px solid #bbf7d0", borderRadius: 8,
                  fontSize: 14, fontWeight: 700, color: "#059669",
                  textAlign: "center"
                }}>
                  ✅ NDA Fully Executed — Both parties agreed
                </div>
              ) : !myNDADone ? (
                <button onClick={() => setShowNDA(true)} style={{
                  width: "100%", padding: "14px",
                  background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "white", border: "none", borderRadius: 8,
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8
                }}>
                  <ShieldIcon size={16} color="white" />
                  Review & Sign NDA
                </button>
              ) : (
                <div style={{
                  padding: "14px", background: "#fffbeb",
                  border: "1px solid #fde68a", borderRadius: 8,
                  fontSize: 14, color: "#d97706", textAlign: "center"
                }}>
                  ✓ You signed — waiting for other party
                </div>
              )}
            </div>

            {/* What happens next */}
            <div style={{
              background: "#eff6ff", borderRadius: 14,
              border: "1px solid #bfdbfe", padding: 20
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8", marginBottom: 10 }}>
                What happens after NDA?
              </div>
              {[
                "Both parties can now share confidential documents",
                "Financial statements and records can be reviewed",
                "Due diligence process begins",
                "Deal moves to Term Sheet stage",
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start",
                  gap: 8, marginBottom: 8
                }}>
                  <div style={{
                    width: 18, height: 18, background: "#dbeafe",
                    borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "#1d4ed8",
                    flexShrink: 0, marginTop: 1
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: "#1e40af" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DOCUMENTS TAB ─────────────────────────── */}
      {activeTab === "documents" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Upload form */}
          <div style={{
            background: "#ffffff", borderRadius: 14,
            border: "1px solid #e2e8f0", overflow: "hidden",
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}>
            <div style={{
              padding: "16px 22px",
              background: "linear-gradient(135deg, #0a1628, #1e3a5f)",
              borderBottom: "1px solid rgba(255,255,255,0.06)"
            }}>
              <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
                Add Document Record
              </div>
              <div style={{ color: "#93c5fd", fontSize: 12, marginTop: 3 }}>
                Track documents shared during due diligence
              </div>
            </div>
            <form onSubmit={handleUploadDoc} style={{ padding: 22 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 700,
                  color: "#475569", marginBottom: 7,
                  textTransform: "uppercase", letterSpacing: "0.06em"
                }}>Document Name *</label>
                <input
                  style={{
                    width: "100%", padding: "11px 14px",
                    border: "1.5px solid #e2e8f0", borderRadius: 8,
                    fontSize: 14, outline: "none", background: "#f8fafc",
                    boxSizing: "border-box"
                  }}
                  placeholder="e.g. Financial Statement 2024"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 700,
                  color: "#475569", marginBottom: 7,
                  textTransform: "uppercase", letterSpacing: "0.06em"
                }}>Document Type</label>
                <select
                  style={{
                    width: "100%", padding: "11px 14px",
                    border: "1.5px solid #e2e8f0", borderRadius: 8,
                    fontSize: 14, outline: "none", background: "#f8fafc",
                    boxSizing: "border-box"
                  }}
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  <option value="financial">Financial Statement</option>
                  <option value="legal">Legal Document</option>
                  <option value="registration">Business Registration (CAC)</option>
                  <option value="tax">Tax Records</option>
                  <option value="contract">Contract / Agreement</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 700,
                  color: "#475569", marginBottom: 7,
                  textTransform: "uppercase", letterSpacing: "0.06em"
                }}>Description (optional)</label>
                <textarea
                  style={{
                    width: "100%", padding: "11px 14px",
                    border: "1.5px solid #e2e8f0", borderRadius: 8,
                    fontSize: 14, outline: "none", background: "#f8fafc",
                    boxSizing: "border-box", height: 70, resize: "none"
                  }}
                  placeholder="Brief description of this document..."
                  value={docDesc}
                  onChange={(e) => setDocDesc(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <button type="submit" style={{
                width: "100%", padding: "13px",
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8
              }}>
                <PlusIcon size={14} color="white" />
                Add Document Record
              </button>
            </form>
          </div>

          {/* Document list */}
          <div style={{
            background: "#ffffff", borderRadius: 14,
            border: "1px solid #e2e8f0", overflow: "hidden",
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}>
            <div style={{
              padding: "16px 22px", borderBottom: "1px solid #f1f5f9",
              background: "#f8fafc", display: "flex",
              justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                Documents
              </span>
              <span style={{
                background: "#dbeafe", color: "#1d4ed8",
                padding: "2px 10px", borderRadius: 20,
                fontSize: 12, fontWeight: 700
              }}>{documents.length}</span>
            </div>

            <div style={{ padding: 16 }}>
              {documents.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center" }}>
                  <div style={{
                    width: 52, height: 52, background: "#f1f5f9",
                    borderRadius: 12, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    margin: "0 auto 12px"
                  }}>
                    <BarChartIcon size={24} color="#94a3b8" />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                    No documents yet
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    Add document records from the form on the left
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {documents.map((doc) => {
                    const typeColors = {
                      financial:    { bg: "#eff6ff",  color: "#1d4ed8" },
                      legal:        { bg: "#faf5ff",  color: "#7c3aed" },
                      registration: { bg: "#f0fdf4",  color: "#059669" },
                      tax:          { bg: "#fffbeb",  color: "#d97706" },
                      contract:     { bg: "#fff1f2",  color: "#e11d48" },
                      other:        { bg: "#f8fafc",  color: "#475569" },
                    };
                    const tc = typeColors[doc.file_type] || typeColors.other;
                    return (
                      <div key={doc.id} style={{
                        padding: "14px 16px", background: "#f8fafc",
                        borderRadius: 10, border: "1px solid #f1f5f9"
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <div style={{
                            width: 36, height: 36,
                            background: tc.bg, borderRadius: 8,
                            display: "flex", alignItems: "center",
                            justifyContent: "center", flexShrink: 0
                          }}>
                            <BarChartIcon size={16} color={tc.color} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 3 }}>
                              {doc.filename}
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={{
                                fontSize: 11, padding: "2px 8px",
                                borderRadius: 20, fontWeight: 700,
                                background: tc.bg, color: tc.color
                              }}>{doc.file_type}</span>
                              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                {new Date(doc.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {doc.description && (
                              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                                {doc.description}
                              </div>
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
          {/* Checklist items */}
          <div style={{
            background: "#ffffff", borderRadius: 14,
            border: "1px solid #e2e8f0", overflow: "hidden",
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}>
            <div style={{
              padding: "16px 22px", borderBottom: "1px solid #f1f5f9",
              background: "#f8fafc",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                  Due Diligence Checklist
                </span>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  {completedItems} of {checklist.length} items completed
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ width: 120 }}>
                <div style={{
                  height: 6, background: "#f1f5f9", borderRadius: 10, overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%",
                    width: checklist.length > 0
                      ? `${(completedItems / checklist.length) * 100}%` : "0%",
                    background: "linear-gradient(90deg, #1d4ed8, #3b82f6)",
                    borderRadius: 10, transition: "width 0.3s"
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, textAlign: "right" }}>
                  {checklist.length > 0
                    ? Math.round((completedItems / checklist.length) * 100) : 0}%
                </div>
              </div>
            </div>

            <div style={{ padding: "12px 16px" }}>
              {checklist.map((item) => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 8, marginBottom: 6,
                  background: item.completed ? "#f0fdf4" : "#f8fafc",
                  border: `1px solid ${item.completed ? "#bbf7d0" : "#f1f5f9"}`,
                  cursor: "pointer", transition: "all 0.15s"
                }}
                  onClick={() => handleToggle(item.id)}
                  onMouseEnter={(e) => {
                    if (!item.completed) e.currentTarget.style.background = "#f1f5f9";
                  }}
                  onMouseLeave={(e) => {
                    if (!item.completed) e.currentTarget.style.background = "#f8fafc";
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: item.completed
                      ? "linear-gradient(135deg, #059669, #10b981)"
                      : "#ffffff",
                    border: item.completed ? "none" : "2px solid #cbd5e1",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", transition: "all 0.2s"
                  }}>
                    {item.completed && <CheckCircleIcon size={14} color="white" />}
                  </div>
                  <span style={{
                    fontSize: 14, flex: 1,
                    color: item.completed ? "#065f46" : "#334155",
                    textDecoration: item.completed ? "line-through" : "none",
                    opacity: item.completed ? 0.8 : 1
                  }}>{item.item}</span>
                  {item.completed && (
                    <span style={{
                      fontSize: 11, color: "#059669", fontWeight: 600
                    }}>✓ Done</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add item + summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
              background: "#ffffff", borderRadius: 14,
              border: "1px solid #e2e8f0", padding: 20,
              boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#0f172a" }}>
                Add Custom Item
              </h3>
              <form onSubmit={handleAddItem}>
                <input
                  style={{
                    width: "100%", padding: "11px 14px",
                    border: "1.5px solid #e2e8f0", borderRadius: 8,
                    fontSize: 14, outline: "none", background: "#f8fafc",
                    boxSizing: "border-box", marginBottom: 10
                  }}
                  placeholder="e.g. Verify property ownership"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                  required
                />
                <button type="submit" style={{
                  width: "100%", padding: "11px",
                  background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "white", border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6
                }}>
                  <PlusIcon size={13} color="white" />
                  Add Item
                </button>
              </form>
            </div>

            {/* Summary */}
            <div style={{
              background: "linear-gradient(160deg, #0a1628, #020817)",
              borderRadius: 14, padding: 20,
              border: "1px solid rgba(255,255,255,0.06)"
            }}>
              <div style={{
                fontSize: 10, color: "#60a5fa", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14
              }}>Checklist Summary</div>
              {[
                { label: "Total items",    value: checklist.length },
                { label: "Completed",      value: completedItems },
                { label: "Remaining",      value: checklist.length - completedItems },
                { label: "Progress",       value: checklist.length > 0
                  ? `${Math.round((completedItems / checklist.length) * 100)}%` : "0%" },
              ].map((item, i) => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none"
                }}>
                  <span style={{ color: "#93c5fd", fontSize: 13 }}>{item.label}</span>
                  <span style={{
                    color: "white", fontWeight: 800, fontSize: 16,
                    fontFamily: "Georgia, serif"
                  }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function AdvisorSelector({ dealId, onAssigned }) {
  const [advisors, setAdvisors] = useState([]);
  const [selected, setSelected] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    import("../services/api").then(({ getAvailableAdvisors }) => {
      getAvailableAdvisors()
        .then((r) => setAdvisors(r.data))
        .catch(() => {});
    });
  }, []);

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    try {
      const { assignAdvisor } = await import("../services/api");
      await assignAdvisor(dealId, parseInt(selected));
      onAssigned();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to assign advisor.");
    } finally { setAssigning(false); }
  };

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{
          padding: "10px 14px", borderRadius: 8,
          border: "1.5px solid #e2e8f0", fontSize: 14,
          outline: "none", background: "#f8fafc", minWidth: 220
        }}
      >
        <option value="">Select a verified advisor</option>
        {advisors.map((a) => (
          <option key={a.id} value={a.id}>{a.full_name}</option>
        ))}
      </select>
      <button onClick={handleAssign} disabled={!selected || assigning} style={{
        padding: "10px 20px",
        background: !selected ? "#94a3b8" : "linear-gradient(135deg, #1d4ed8, #2563eb)",
        color: "white", border: "none", borderRadius: 8,
        fontSize: 13, fontWeight: 700,
        cursor: !selected ? "not-allowed" : "pointer"
      }}>
        {assigning ? "Assigning..." : "Assign Advisor"}
      </button>
    </div>
  );
}