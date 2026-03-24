import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getListings, getMyListings, getMyBusinesses,
  createListing, makeOffer, getReceivedOffers,
  updateOffer, getMyOffers, createDealRoom
} from "../services/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  BuildingIcon, StoreIcon, HandshakeIcon, BarChartIcon,
  PlusIcon, CheckCircleIcon, ArrowRightIcon, MessageIcon
} from "../components/Icons";

const dealColors = {
  full_acquisition:   { bg: "#fff1f2", color: "#e11d48",  border: "#fecdd3", label: "Full Acquisition" },
  partial_investment: { bg: "#f0fdf4", color: "#059669",  border: "#bbf7d0", label: "Partial Investment" },
  partnership:        { bg: "#eff6ff", color: "#1d4ed8",  border: "#bfdbfe", label: "Partnership" },
};

const offerStatusColors = {
  pending:   { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  accepted:  { bg: "#f0fdf4", color: "#059669", border: "#bbf7d0" },
  rejected:  { bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" },
  withdrawn: { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
};

export default function Marketplace() {
  const { user: _user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]                       = useState("browse");
  const [listings, setListings]             = useState([]);
  const [myListings, setMyListings]         = useState([]);
  const [businesses, setBusinesses]         = useState([]);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [myOffers, setMyOffers]             = useState([]);
  const [dealRoomsByOfferId, setDealRoomsByOfferId] = useState({});
  const [showForm, setShowForm]             = useState(false);
  const [offerModal, setOfferModal]         = useState(null);
  const [offerAmount, setOfferAmount]       = useState("");
  const [offerMessage, setOfferMessage]     = useState("");
  const [submittingOffer, setSubmittingOffer]     = useState(false);
  const [submittingListing, setSubmittingListing] = useState(false);
  const [form, setForm] = useState({
    business_id: "", asking_price: "",
    deal_type: "partial_investment",
    visibility: "public", description: ""
  });

  useEffect(() => {
    getListings().then((r) => setListings(r.data)).catch(() => {});
    getMyListings().then((r) => setMyListings(r.data)).catch(() => {});
    getMyBusinesses().then((r) => setBusinesses(r.data)).catch(() => {});
    getReceivedOffers().then((r) => setReceivedOffers(r.data)).catch(() => {});
    getMyOffers().then((r) => setMyOffers(r.data)).catch(() => {});
  }, []);

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setSubmittingListing(true);
    try {
      const res = await createListing({
        ...form,
        business_id:  parseInt(form.business_id),
        asking_price: parseFloat(form.asking_price)
      });
      setMyListings((prev) => [res.data, ...prev]);
      setShowForm(false);
      setForm({
        business_id: "", asking_price: "",
        deal_type: "partial_investment", visibility: "public", description: ""
      });
      setTab("mine");
    } catch { alert("Failed to create listing."); }
    finally { setSubmittingListing(false); }
  };

  const handleMakeOffer = async () => {
    if (!offerAmount) return alert("Please enter an offer amount.");
    setSubmittingOffer(true);
    try {
      await makeOffer({
        listing_id: offerModal.id,
        amount: parseFloat(offerAmount),
        message: offerMessage
      });
      const updated = await getMyOffers();
      setMyOffers(updated.data);
      setOfferModal(null);
      setOfferAmount("");
      setOfferMessage("");
      alert("Offer sent successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to send offer.");
    } finally { setSubmittingOffer(false); }
  };

  const handleOpenDealRoom = async (offerId) => {
    try {
      const existingId = dealRoomsByOfferId[offerId];
      if (existingId) return navigate(`/deal-room/${existingId}`);
      const dealRes = await createDealRoom(offerId);
      const dealId  = dealRes?.data?.id;
      if (!dealId) throw new Error("Deal room id missing from response.");
      setDealRoomsByOfferId((prev) => ({ ...prev, [offerId]: dealId }));
      navigate(`/deal-room/${dealId}`);
    } catch (err) {
      alert(err.response?.data?.detail || err.message || "Failed to open deal room.");
    }
  };

  const handleOfferAction = async (offerId, status) => {
    try {
      await updateOffer(offerId, { status });
      if (status === "accepted") {
        const dealRes = await createDealRoom(offerId);
        const dealId  = dealRes?.data?.id;
        if (!dealId) throw new Error("Deal room id missing from response.");
        setDealRoomsByOfferId((prev) => ({ ...prev, [offerId]: dealId }));
        const updated = await getReceivedOffers();
        setReceivedOffers(updated.data);
        navigate(`/deal-room/${dealId}`);
      } else {
        const updated = await getReceivedOffers();
        setReceivedOffers(updated.data);
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update offer.");
    }
  };

  const inp = {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, outline: "none", background: "#f8fafc",
    color: "#0f172a", boxSizing: "border-box",
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
  const lbl = {
    display: "block", fontSize: 12, fontWeight: 700,
    color: "#475569", marginBottom: 7,
    textTransform: "uppercase", letterSpacing: "0.06em"
  };

  const tabs = [
    { key: "browse", label: "Browse Listings",  count: listings.length },
    { key: "mine",   label: "My Listings",       count: myListings.length },
    { key: "offers", label: "Offers Received",   count: receivedOffers.length },
    { key: "sent",   label: "Offers Sent",       count: myOffers.length },
  ];

  return (
    <Layout
      title="Marketplace"
      subtitle="Buy, sell, and invest in Nigerian businesses"
      action={
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: "10px 20px",
          background: showForm
            ? "#f1f5f9"
            : "linear-gradient(135deg, #1d4ed8, #2563eb)",
          color: showForm ? "#475569" : "white",
          border: showForm ? "1.5px solid #e2e8f0" : "none",
          borderRadius: 8, fontSize: 13, fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          boxShadow: showForm ? "none" : "0 4px 14px rgba(37,99,235,0.3)"
        }}>
          {showForm
            ? "✕ Cancel"
            : <><PlusIcon size={14} color="white" /> List a Business</>
          }
        </button>
      }
    >

      {/* ── OFFER MODAL ───────────────────────────── */}
      {offerModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(2,8,23,0.7)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }} onClick={() => setOfferModal(null)}>
          <div style={{
            background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 440,
            boxShadow: "0 32px 80px rgba(0,0,0,0.3)", overflow: "hidden"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: "linear-gradient(135deg, #0a1628, #1e3a5f)",
              padding: "20px 24px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>
                  Make an Offer
                </div>
                <div style={{ color: "#93c5fd", fontSize: 13, marginTop: 3 }}>
                  {offerModal.business_name || `Listing #${offerModal.id}`} —
                  Asking ₦{(offerModal.asking_price / 1e6).toFixed(2)}M
                </div>
              </div>
              <button onClick={() => setOfferModal(null)} style={{
                width: 32, height: 32, border: "none",
                background: "rgba(255,255,255,0.1)", borderRadius: "50%",
                color: "white", fontSize: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Your Offer Amount (₦)</label>
                <input style={inp} type="number"
                  placeholder={`Asking: ₦${(offerModal.asking_price / 1e6).toFixed(2)}M`}
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  onFocus={focusInp} onBlur={blurInp}
                />
                {offerAmount && (
                  <div style={{
                    marginTop: 6, fontSize: 12,
                    color: parseFloat(offerAmount) >= offerModal.asking_price
                      ? "#059669" : "#d97706"
                  }}>
                    {parseFloat(offerAmount) >= offerModal.asking_price
                      ? "✓ At or above asking price"
                      : `₦${((offerModal.asking_price - parseFloat(offerAmount)) / 1e6).toFixed(2)}M below asking price`
                    }
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={lbl}>Message to Seller (optional)</label>
                <textarea style={{ ...inp, height: 90, resize: "none" }}
                  placeholder="Introduce yourself and describe your investment interest..."
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  onFocus={focusInp} onBlur={blurInp}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleMakeOffer} disabled={submittingOffer} style={{
                  flex: 1, padding: "13px",
                  background: submittingOffer
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "white", border: "none", borderRadius: 8,
                  fontWeight: 700, fontSize: 15, cursor: "pointer",
                  boxShadow: submittingOffer ? "none" : "0 4px 14px rgba(37,99,235,0.3)"
                }}>
                  {submittingOffer ? "Sending..." : "Send Offer →"}
                </button>
                <button onClick={() => setOfferModal(null)} style={{
                  padding: "13px 18px", background: "#f8fafc",
                  color: "#475569", border: "1.5px solid #e2e8f0",
                  borderRadius: 8, fontWeight: 600, cursor: "pointer"
                }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE LISTING FORM ───────────────────── */}
      {showForm && (
        <div style={{
          background: "#ffffff", borderRadius: 14,
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 32px rgba(15,23,42,0.10)",
          marginBottom: 24, overflow: "hidden"
        }}>
          <div style={{
            padding: "20px 28px",
            background: "linear-gradient(135deg, #0a1628, #1e3a5f)",
            display: "flex", alignItems: "center", gap: 14
          }}>
            <div style={{
              width: 44, height: 44, background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <StoreIcon size={22} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "white", margin: 0, marginBottom: 3 }}>
                List Your Business
              </h2>
              <p style={{ color: "#93c5fd", fontSize: 13, margin: 0 }}>
                Connect with 340+ verified investors and buyers
              </p>
            </div>
          </div>
          <form onSubmit={handleCreateListing} style={{ padding: 28 }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16, marginBottom: 16
            }}>
              <div>
                <label style={lbl}>Select Business *</label>
                <select style={{ ...inp, background: "#f8fafc" }}
                  value={form.business_id}
                  onChange={(e) => setForm({ ...form, business_id: e.target.value })}
                  required onFocus={focusInp} onBlur={blurInp}
                >
                  <option value="">Choose a business</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Asking Price (₦) *</label>
                <input style={inp} type="number" placeholder="e.g. 9000000"
                  value={form.asking_price} required
                  onChange={(e) => setForm({ ...form, asking_price: e.target.value })}
                  onFocus={focusInp} onBlur={blurInp}
                />
              </div>
              <div>
                <label style={lbl}>Deal Type *</label>
                <select style={{ ...inp, background: "#f8fafc" }}
                  value={form.deal_type}
                  onChange={(e) => setForm({ ...form, deal_type: e.target.value })}
                  onFocus={focusInp} onBlur={blurInp}
                >
                  <option value="partial_investment">Partial Investment</option>
                  <option value="full_acquisition">Full Acquisition</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Visibility</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { value: "public",      label: "Public",      desc: "Visible to all investors" },
                  { value: "private",     label: "Private",     desc: "Invite only" },
                  { value: "invite_only", label: "Invite Only", desc: "Share link required" },
                ].map((v) => (
                  <div key={v.value} onClick={() => setForm({ ...form, visibility: v.value })}
                    style={{
                      flex: 1, padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                      border: form.visibility === v.value ? "2px solid #1d4ed8" : "2px solid #e2e8f0",
                      background: form.visibility === v.value ? "#eff6ff" : "#f8fafc",
                      transition: "all 0.15s"
                    }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: form.visibility === v.value ? "#1d4ed8" : "#334155"
                    }}>{v.label}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{v.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Description</label>
              <textarea style={{ ...inp, height: 90, resize: "vertical" }}
                placeholder="Describe the opportunity, what you're looking for, and key highlights..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                onFocus={focusInp} onBlur={blurInp}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={submittingListing} style={{
                padding: "13px 32px",
                background: submittingListing
                  ? "#94a3b8" : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                boxShadow: submittingListing ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
                display: "flex", alignItems: "center", gap: 8
              }}>
                {submittingListing
                  ? "Publishing..."
                  : <><StoreIcon size={15} color="white" /> Publish Listing</>
                }
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                padding: "13px 20px", background: "transparent",
                color: "#64748b", border: "1.5px solid #e2e8f0",
                borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer"
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── TABS ──────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 24,
        background: "#f1f5f9", borderRadius: 10, padding: 4,
        width: "fit-content"
      }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "9px 18px", border: "none", borderRadius: 7,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: tab === t.key ? "#ffffff" : "transparent",
            color: tab === t.key ? "#0f172a" : "#64748b",
            boxShadow: tab === t.key ? "0 1px 4px rgba(15,23,42,0.08)" : "none",
            transition: "all 0.15s",
            display: "flex", alignItems: "center", gap: 7
          }}>
            {t.label}
            {t.count > 0 && (
              <span style={{
                background: tab === t.key ? "#dbeafe" : "#e2e8f0",
                color: tab === t.key ? "#1d4ed8" : "#64748b",
                borderRadius: 20, padding: "1px 8px",
                fontSize: 11, fontWeight: 700
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── BROWSE TAB ────────────────────────────── */}
      {tab === "browse" && (
        <>
          {!listings.length ? (
            <div style={{
              background: "#ffffff", borderRadius: 14,
              padding: "72px 24px", textAlign: "center",
              border: "2px dashed #e2e8f0"
            }}>
              <div style={{
                width: 64, height: 64, background: "#f1f5f9", borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <StoreIcon size={28} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                No listings available yet
              </h3>
              <p style={{ color: "#64748b", fontSize: 15, marginBottom: 24 }}>
                Be the first to list a business for investors to discover
              </p>
              <button onClick={() => setShowForm(true)} style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)"
              }}>List your business →</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
              {listings.map((l) => {
                const deal = dealColors[l.deal_type] || dealColors.partial_investment;
                return (
                  <div key={l.id} style={{
                    background: "#ffffff", borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
                    overflow: "hidden", transition: "all 0.2s"
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.10)";
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.borderColor = "#bfdbfe";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                  >
                    {/* Blue top accent bar */}
                    <div style={{ height: 4, background: "linear-gradient(90deg, #1d4ed8, #3b82f6)" }} />

                    <div style={{ padding: 24 }}>
                      {/* Header — business name + price */}
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "flex-start", marginBottom: 14
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 48, height: 48,
                            background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
                            border: "1px solid #bfdbfe", borderRadius: 12,
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}>
                            <BuildingIcon size={22} color="#1d4ed8" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
                              {l.business_name || `Listing #${l.id}`}
                            </h3>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{
                                fontSize: 11, padding: "3px 10px", borderRadius: 20,
                                fontWeight: 700, background: deal.bg, color: deal.color,
                                border: `1px solid ${deal.border}`
                              }}>{deal.label}</span>
                              {l.business_industry && (
                                <span style={{
                                  fontSize: 11, padding: "3px 10px", borderRadius: 20,
                                  fontWeight: 600, background: "#f1f5f9", color: "#475569"
                                }}>{l.business_industry}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{
                            fontSize: 22, fontWeight: 800, color: "#0f172a",
                            fontFamily: "Georgia, serif", letterSpacing: "-0.02em"
                          }}>
                            ₦{(l.asking_price / 1e6).toFixed(2)}M
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>Asking Price</div>
                        </div>
                      </div>

                      {/* Business detail stats */}
                      <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr",
                        gap: 8, marginBottom: 14
                      }}>
                        {[
                          { label: "Location",  value: l.business_location || "—" },
                          { label: "Revenue",   value: l.business_revenue
                            ? `₦${(l.business_revenue / 1e6).toFixed(1)}M` : "Undisclosed" },
                          { label: "Employees", value: l.business_employees || "—" },
                          { label: "Founded",   value: l.business_founded   || "—" },
                        ].map((item) => (
                          <div key={item.label} style={{
                            background: "#f8fafc", padding: "8px 12px",
                            borderRadius: 7, border: "1px solid #f1f5f9"
                          }}>
                            <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>
                              {item.label}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Seller badge — privacy-first */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", background: "#f8fafc",
                        borderRadius: 7, border: "1px solid #f1f5f9", marginBottom: 14
                      }}>
                        <div style={{
                          width: 26, height: 26,
                          background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                          borderRadius: "50%", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          color: "white", fontSize: 11, fontWeight: 800
                        }}>
                          {l.seller_initials || "?"}
                        </div>
                        <div>
                          <span style={{ fontSize: 12, color: "#475569" }}>
                            Listed by <strong>{l.seller_initials || "Anonymous"}</strong>
                          </span>
                          {l.seller_verified && (
                            <span style={{
                              marginLeft: 6, fontSize: 10, padding: "2px 7px",
                              borderRadius: 20, background: "#d1fae5",
                              color: "#059669", fontWeight: 700
                            }}>✓ Verified</span>
                          )}
                        </div>
                        <div style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>
                          Full identity revealed after NDA
                        </div>
                      </div>

                      {/* Description */}
                      {l.description && (
                        <p style={{
                          fontSize: 13, color: "#475569", lineHeight: 1.6,
                          marginBottom: 14, padding: "10px 12px",
                          background: "#f8fafc", borderRadius: 7,
                          border: "1px solid #f1f5f9"
                        }}>{l.description}</p>
                      )}

                      {/* Status badges */}
                      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: 11, padding: "4px 10px", borderRadius: 20,
                          background: l.status === "active" ? "#d1fae5" : "#f1f5f9",
                          color: l.status === "active" ? "#065f46" : "#64748b",
                          fontWeight: 700
                        }}>● {l.status}</span>
                        <span style={{
                          fontSize: 11, padding: "4px 10px", borderRadius: 20,
                          background: "#f8fafc", color: "#94a3b8"
                        }}>
                          Listed {new Date(l.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* CTA */}
                      <button onClick={() => setOfferModal(l)} style={{
                        width: "100%", padding: "12px",
                        background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                        color: "white", border: "none", borderRadius: 8,
                        fontSize: 14, fontWeight: 700, cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 8, transition: "all 0.2s"
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 8px 20px rgba(37,99,235,0.4)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.25)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <HandshakeIcon size={16} color="white" />
                        Make an Offer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── MY LISTINGS TAB ───────────────────────── */}
      {tab === "mine" && (
        <>
          {!myListings.length ? (
            <div style={{
              background: "#ffffff", borderRadius: 14,
              padding: "72px 24px", textAlign: "center",
              border: "2px dashed #e2e8f0"
            }}>
              <div style={{
                width: 64, height: 64, background: "#f1f5f9", borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <StoreIcon size={28} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                No listings yet
              </h3>
              <p style={{ color: "#64748b", fontSize: 15, marginBottom: 24 }}>
                Click "List a Business" to create your first listing
              </p>
              <button onClick={() => { setShowForm(true); window.scrollTo(0, 0); }} style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)"
              }}>Create your first listing →</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
              {myListings.map((l) => {
                const deal = dealColors[l.deal_type] || dealColors.partial_investment;
                return (
                  <div key={l.id} style={{
                    background: "#ffffff", borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(15,23,42,0.05)", overflow: "hidden"
                  }}>
                    <div style={{ height: 4, background: "linear-gradient(90deg, #1d4ed8, #3b82f6)" }} />
                    <div style={{ padding: 24 }}>
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginBottom: 16
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 42, height: 42, background: "#dbeafe",
                            borderRadius: 10, display: "flex", alignItems: "center",
                            justifyContent: "center", border: "1px solid #bfdbfe"
                          }}>
                            <StoreIcon size={20} color="#1d4ed8" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>
                              {l.business_name || `Listing #${l.id}`}
                            </div>
                            <span style={{
                              fontSize: 11, padding: "2px 8px", borderRadius: 20,
                              background: deal.bg, color: deal.color,
                              fontWeight: 700, border: `1px solid ${deal.border}`
                            }}>{deal.label}</span>
                          </div>
                        </div>
                        <span style={{
                          fontSize: 11, padding: "4px 12px", borderRadius: 20, fontWeight: 700,
                          background: l.status === "active" ? "#d1fae5" : "#f1f5f9",
                          color: l.status === "active" ? "#065f46" : "#64748b"
                        }}>{l.status}</span>
                      </div>
                      <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr",
                        gap: 10, marginBottom: 16
                      }}>
                        <div style={{
                          background: "#f8fafc", padding: "12px 14px",
                          borderRadius: 8, border: "1px solid #f1f5f9"
                        }}>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>Asking Price</div>
                          <div style={{
                            fontSize: 18, fontWeight: 800, color: "#0f172a",
                            fontFamily: "Georgia, serif"
                          }}>₦{(l.asking_price / 1e6).toFixed(2)}M</div>
                        </div>
                        <div style={{
                          background: "#f8fafc", padding: "12px 14px",
                          borderRadius: 8, border: "1px solid #f1f5f9"
                        }}>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>Listed On</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                            {new Date(l.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {l.description && (
                        <p style={{
                          fontSize: 13, color: "#475569", lineHeight: 1.6,
                          padding: "10px 12px", background: "#f8fafc",
                          borderRadius: 7, border: "1px solid #f1f5f9", margin: 0
                        }}>{l.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── OFFERS RECEIVED TAB ───────────────────── */}
      {tab === "offers" && (
        <>
          {!receivedOffers.length ? (
            <div style={{
              background: "#ffffff", borderRadius: 14,
              padding: "72px 24px", textAlign: "center",
              border: "2px dashed #e2e8f0"
            }}>
              <div style={{
                width: 64, height: 64, background: "#f1f5f9", borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <HandshakeIcon size={28} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                No offers received yet
              </h3>
              <p style={{ color: "#64748b", fontSize: 15 }}>
                Offers will appear here when investors are interested in your listings
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {receivedOffers.map((o) => {
                const statusStyle = offerStatusColors[o.status] || offerStatusColors.pending;
                return (
                  <div key={o.id} style={{
                    background: "#ffffff", borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(15,23,42,0.05)", overflow: "hidden"
                  }}>
                    <div style={{
                      padding: "16px 22px", borderBottom: "1px solid #f1f5f9",
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", background: "#f8fafc"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, background: "#dbeafe", borderRadius: 10,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: "1px solid #bfdbfe"
                        }}>
                          <HandshakeIcon size={18} color="#1d4ed8" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                            Offer on Listing #{o.listing_id}
                          </div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>
                            From Investor #{o.investor_id} · {new Date(o.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 12, padding: "5px 14px", borderRadius: 20,
                        fontWeight: 700, background: statusStyle.bg,
                        color: statusStyle.color, border: `1px solid ${statusStyle.border}`,
                        textTransform: "capitalize"
                      }}>{o.status}</span>
                    </div>
                    <div style={{ padding: "18px 22px" }}>
                      <div style={{
                        display: "grid", gridTemplateColumns: "auto 1fr",
                        gap: 20, alignItems: "start"
                      }}>
                        <div style={{
                          background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                          borderRadius: 10, padding: "14px 20px",
                          border: "1px solid #bfdbfe", textAlign: "center"
                        }}>
                          <div style={{
                            fontSize: 11, color: "#60a5fa", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4
                          }}>Offer Amount</div>
                          <div style={{
                            fontSize: 26, fontWeight: 800, color: "#1d4ed8",
                            fontFamily: "Georgia, serif"
                          }}>₦{(o.amount / 1e6).toFixed(2)}M</div>
                        </div>
                        <div>
                          {o.message && (
                            <div style={{
                              background: "#f8fafc", padding: "12px 14px",
                              borderRadius: 8, border: "1px solid #f1f5f9", marginBottom: 14
                            }}>
                              <div style={{
                                fontSize: 11, color: "#94a3b8", fontWeight: 700, marginBottom: 4
                              }}>MESSAGE</div>
                              <p style={{
                                fontSize: 14, color: "#334155", lineHeight: 1.6, margin: 0
                              }}>{o.message}</p>
                            </div>
                          )}
                          {o.status === "pending" && (
                            <div style={{ display: "flex", gap: 10 }}>
                              <button onClick={() => handleOfferAction(o.id, "accepted")} style={{
                                padding: "10px 22px",
                                background: "linear-gradient(135deg, #059669, #10b981)",
                                color: "white", border: "none", borderRadius: 8,
                                fontSize: 14, fontWeight: 700, cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(5,150,105,0.25)",
                                display: "flex", alignItems: "center", gap: 7
                              }}>
                                <CheckCircleIcon size={15} color="white" />
                                Accept Offer
                              </button>
                              <button onClick={() => handleOfferAction(o.id, "rejected")} style={{
                                padding: "10px 22px", background: "#fff1f2",
                                color: "#e11d48", border: "1.5px solid #fecdd3",
                                borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer"
                              }}>Decline</button>
                            </div>
                          )}
                          {o.status === "accepted" && (
                            <div>
                              <div style={{ fontSize: 13, color: "#059669", marginBottom: 10 }}>
                                ✓ Offer accepted — Deal room is ready!
                              </div>
                              <button onClick={() => handleOpenDealRoom(o.id)} style={{
                                padding: "11px 24px",
                                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                                color: "white", border: "none", borderRadius: 8,
                                fontSize: 14, fontWeight: 700, cursor: "pointer",
                                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                                display: "flex", alignItems: "center", gap: 8
                              }}>
                                <BarChartIcon size={15} color="white" />
                                Open Deal Room →
                              </button>
                            </div>
                          )}
                          {o.status === "rejected" && (
                            <div style={{ fontSize: 13, color: "#e11d48" }}>
                              This offer has been declined.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── OFFERS SENT TAB ───────────────────────── */}
      {tab === "sent" && (
        <>
          {!myOffers.length ? (
            <div style={{
              background: "#ffffff", borderRadius: 14,
              padding: "72px 24px", textAlign: "center",
              border: "2px dashed #e2e8f0"
            }}>
              <div style={{
                width: 64, height: 64, background: "#f1f5f9", borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <ArrowRightIcon size={28} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                No offers sent yet
              </h3>
              <p style={{ color: "#64748b", fontSize: 15, marginBottom: 24 }}>
                Browse listings and make offers on businesses you're interested in
              </p>
              <button onClick={() => setTab("browse")} style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)"
              }}>Browse listings →</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {myOffers.map((o) => {
                const statusStyle = offerStatusColors[o.status] || offerStatusColors.pending;
                return (
                  <div key={o.id} style={{
                    background: "#ffffff", borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(15,23,42,0.05)", overflow: "hidden"
                  }}>
                    <div style={{
                      padding: "16px 22px", borderBottom: "1px solid #f1f5f9",
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", background: "#f8fafc"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, background: "#fffbeb", borderRadius: 10,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: "1px solid #fde68a"
                        }}>
                          <ArrowRightIcon size={18} color="#d97706" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                            Offer on Listing #{o.listing_id}
                          </div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>
                            Sent {new Date(o.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 12, padding: "5px 14px", borderRadius: 20,
                        fontWeight: 700, background: statusStyle.bg,
                        color: statusStyle.color, border: `1px solid ${statusStyle.border}`,
                        textTransform: "capitalize"
                      }}>{o.status}</span>
                    </div>
                    <div style={{
                      padding: "18px 22px", display: "flex", alignItems: "center", gap: 16
                    }}>
                      <div style={{
                        background: "#fffbeb", borderRadius: 10,
                        padding: "12px 18px", border: "1px solid #fde68a",
                        textAlign: "center", flexShrink: 0
                      }}>
                        <div style={{
                          fontSize: 11, color: "#d97706", fontWeight: 700,
                          textTransform: "uppercase", marginBottom: 3
                        }}>My Offer</div>
                        <div style={{
                          fontSize: 22, fontWeight: 800, color: "#92400e",
                          fontFamily: "Georgia, serif"
                        }}>₦{(o.amount / 1e6).toFixed(2)}M</div>
                      </div>
                      {o.message && (
                        <div style={{
                          flex: 1, background: "#f8fafc", padding: "12px 14px",
                          borderRadius: 8, border: "1px solid #f1f5f9"
                        }}>
                          <div style={{
                            fontSize: 11, color: "#94a3b8", fontWeight: 700, marginBottom: 4
                          }}>MY MESSAGE</div>
                          <p style={{
                            fontSize: 14, color: "#334155", lineHeight: 1.6, margin: 0
                          }}>{o.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
