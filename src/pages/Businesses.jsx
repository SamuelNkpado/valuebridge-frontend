import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyBusinesses, createBusiness } from "../services/api";
import Layout from "../components/Layout";
import {
  BuildingIcon, BarChartIcon, StoreIcon,
  MapPinIcon, UsersIcon, TrendingUpIcon, PlusIcon
} from "../components/Icons";

const industries = [
  "Technology","Food & Beverage","Retail","Manufacturing",
  "Healthcare","Education","Agriculture","Real Estate","Finance","Other"
];

export default function Businesses() {
  const [businesses, setBusinesses]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(false);
  const [form, setForm] = useState({
    name: "", industry: "Technology", location: "",
    legal_structure: "", founding_year: "", employee_count: "",
    description: "", annual_revenue: "", profit: "",
    total_assets: "", total_liabilities: ""
  });

  useEffect(() => {
    getMyBusinesses()
      .then((r) => setBusinesses(r.data))
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => setForm({
    name: "", industry: "Technology", location: "",
    legal_structure: "", founding_year: "", employee_count: "",
    description: "", annual_revenue: "", profit: "",
    total_assets: "", total_liabilities: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name:              form.name,
        industry:          form.industry,
        location:          form.location,
        legal_structure:   form.legal_structure   || null,
        description:       form.description       || null,
        founding_year:     form.founding_year     ? parseInt(form.founding_year)     : null,
        employee_count:    form.employee_count    ? parseInt(form.employee_count)    : null,
        annual_revenue:    form.annual_revenue    ? parseFloat(form.annual_revenue)  : null,
        profit:            form.profit            ? parseFloat(form.profit)          : null,
        total_assets:      form.total_assets      ? parseFloat(form.total_assets)    : null,
        total_liabilities: form.total_liabilities ? parseFloat(form.total_liabilities) : null,
      };
      const res = await createBusiness(payload);
      setBusinesses((prev) => [...prev, res.data]);
      setShowForm(false);
      resetForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      alert("Failed to create business. Please check your details.");
    } finally { setSubmitting(false); }
  };

  const inp = {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, outline: "none",
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

  const lbl = {
    display: "block", fontSize: 12, fontWeight: 700,
    color: "#475569", marginBottom: 6,
    textTransform: "uppercase", letterSpacing: "0.06em"
  };

  return (
    <Layout
      title="My Businesses"
      subtitle="Manage and track all your business profiles"
      action={
        <button
          onClick={() => { setShowForm(!showForm); }}
          style={{
            padding: "10px 20px",
            background: showForm
              ? "#f1f5f9"
              : "linear-gradient(135deg, #1d4ed8, #2563eb)",
            color: showForm ? "#475569" : "white",
            border: showForm ? "1.5px solid #e2e8f0" : "none",
            borderRadius: 8, fontSize: 13, fontWeight: 700,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: showForm ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
            transition: "all 0.2s"
          }}
        >
          {showForm ? (
            <>✕ Cancel</>
          ) : (
            <><PlusIcon size={14} color="white" /> Add Business</>
          )}
        </button>
      }
    >

      {/* ── SUCCESS TOAST ─────────────────────────── */}
      {success && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 999,
          background: "#0f172a", color: "white",
          padding: "14px 22px", borderRadius: 10,
          fontSize: 14, fontWeight: 600,
          boxShadow: "0 20px 48px rgba(15,23,42,0.2)",
          display: "flex", alignItems: "center", gap: 10,
          animation: "fadeUp 0.3s ease"
        }}>
          <span style={{
            width: 22, height: 22, background: "#d1fae5",
            borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#065f46", fontWeight: 800
          }}>✓</span>
          Business added successfully!
        </div>
      )}

      {/* ── ADD BUSINESS FORM ─────────────────────── */}
      {showForm && (
        <div style={{
          background: "#ffffff", borderRadius: 14,
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 32px rgba(15,23,42,0.10)",
          marginBottom: 28, overflow: "hidden"
        }}>
          {/* Form header */}
          <div style={{
            padding: "20px 28px",
            borderBottom: "1px solid #f1f5f9",
            background: "linear-gradient(135deg, #0a1628, #1e3a5f)",
            display: "flex", alignItems: "center", gap: 14
          }}>
            <div style={{
              width: 44, height: 44,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              <BuildingIcon size={22} color="white" />
            </div>
            <div>
              <h2 style={{
                fontSize: 18, fontWeight: 700,
                color: "white", margin: 0, marginBottom: 3
              }}>Add New Business</h2>
              <p style={{ color: "#93c5fd", fontSize: 13, margin: 0 }}>
                Fill in your business details for accurate valuations
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 28 }}>

            {/* Basic Info */}
            <div style={{
              background: "#f8fafc", borderRadius: 10,
              padding: 20, marginBottom: 20,
              border: "1px solid #e2e8f0"
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 18
              }}>
                <div style={{
                  width: 28, height: 28, background: "#dbeafe",
                  borderRadius: 7, display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}>
                  <BuildingIcon size={14} color="#1d4ed8" />
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: "#1d4ed8",
                  textTransform: "uppercase", letterSpacing: "0.08em"
                }}>Basic Information</span>
              </div>

              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: 14, marginBottom: 14
              }}>
                <div style={{ gridColumn: "1 / 3" }}>
                  <label style={lbl}>Business Name *</label>
                  <input style={inp} placeholder="e.g. Lagos Fresh Foods"
                    value={form.name} required
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onFocus={focusInp} onBlur={blurInp}
                  />
                </div>
                <div>
                  <label style={lbl}>Industry *</label>
                  <select style={{ ...inp, background: "#f8fafc" }}
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}>
                    {industries.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: 14, marginBottom: 14
              }}>
                <div>
                  <label style={lbl}>Location *</label>
                  <input style={inp} placeholder="e.g. Lagos, Nigeria"
                    value={form.location} required
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    onFocus={focusInp} onBlur={blurInp}
                  />
                </div>
                <div>
                  <label style={lbl}>Legal Structure</label>
                  <input style={inp} placeholder="LLC, Sole Proprietor..."
                    value={form.legal_structure}
                    onChange={(e) => setForm({ ...form, legal_structure: e.target.value })}
                    onFocus={focusInp} onBlur={blurInp}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={lbl}>Founded</label>
                    <input style={inp} type="number" placeholder="2020"
                      value={form.founding_year}
                      onChange={(e) => setForm({ ...form, founding_year: e.target.value })}
                      onFocus={focusInp} onBlur={blurInp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Employees</label>
                    <input style={inp} type="number" placeholder="10"
                      value={form.employee_count}
                      onChange={(e) => setForm({ ...form, employee_count: e.target.value })}
                      onFocus={focusInp} onBlur={blurInp}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={lbl}>Description</label>
                <textarea
                  style={{ ...inp, height: 80, resize: "vertical" }}
                  placeholder="Briefly describe what your business does..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  onFocus={focusInp} onBlur={blurInp}
                />
              </div>
            </div>

            {/* Financial Info */}
            <div style={{
              background: "#eff6ff", borderRadius: 10,
              padding: 20, marginBottom: 24,
              border: "1px solid #bfdbfe"
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 8
              }}>
                <div style={{
                  width: 28, height: 28, background: "#dbeafe",
                  borderRadius: 7, display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}>
                  <BarChartIcon size={14} color="#1d4ed8" />
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: "#1d4ed8",
                  textTransform: "uppercase", letterSpacing: "0.08em"
                }}>Financial Data — Required for Valuation</span>
              </div>
              <p style={{
                fontSize: 13, color: "#3b82f6", marginBottom: 16
              }}>
                This data powers your 3-method business valuation.
              </p>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 14
              }}>
                {[
                  { label: "Annual Revenue (₦)", key: "annual_revenue", placeholder: "5,000,000" },
                  { label: "Net Profit (₦)",     key: "profit",         placeholder: "1,200,000" },
                  { label: "Total Assets (₦)",   key: "total_assets",   placeholder: "3,000,000" },
                  { label: "Total Liabilities (₦)", key: "total_liabilities", placeholder: "500,000" },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ ...lbl, color: "#1d4ed8" }}>{f.label}</label>
                    <input
                      style={{ ...inp, background: "#ffffff" }}
                      type="number" placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      onFocus={focusInp} onBlur={blurInp}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button type="submit" disabled={submitting} style={{
                padding: "13px 32px",
                background: submitting
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                boxShadow: submitting ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.2s"
              }}>
                {submitting ? (
                  <>
                    <div style={{
                      width: 16, height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite"
                    }} />
                    Saving...
                  </>
                ) : (
                  <><PlusIcon size={14} color="white" /> Save Business</>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                style={{
                  padding: "13px 20px", background: "transparent",
                  color: "#64748b", border: "1.5px solid #e2e8f0",
                  borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: "pointer"
                }}
              >Cancel</button>
              <span style={{ color: "#94a3b8", fontSize: 13, marginLeft: 4 }}>
                * Required fields
              </span>
            </div>
          </form>
        </div>
      )}

      {/* ── LOADING ───────────────────────────────── */}
      {loading && (
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", padding: 80,
          flexDirection: "column", gap: 14
        }}>
          <div style={{
            width: 32, height: 32,
            border: "3px solid #dbeafe",
            borderTopColor: "#2563eb",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite"
          }} />
          <span style={{ color: "#64748b", fontSize: 14 }}>Loading businesses...</span>
        </div>
      )}

      {/* ── EMPTY STATE ───────────────────────────── */}
      {!loading && !businesses.length && !showForm && (
        <div style={{
          background: "#ffffff", borderRadius: 16,
          padding: "80px 24px", textAlign: "center",
          border: "2px dashed #e2e8f0"
        }}>
          <div style={{
            width: 72, height: 72,
            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            borderRadius: 16, display: "flex",
            alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 8px 24px rgba(37,99,235,0.25)"
          }}>
            <BuildingIcon size={34} color="white" />
          </div>
          <h3 style={{
            fontSize: 22, fontWeight: 700,
            color: "#0f172a", marginBottom: 8
          }}>No businesses yet</h3>
          <p style={{
            color: "#64748b", fontSize: 15,
            marginBottom: 28, maxWidth: 380, margin: "0 auto 28px"
          }}>
            Add your first business to start getting professional
            valuations and connect with investors.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "13px 32px",
              background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
              color: "white", border: "none", borderRadius: 8,
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              display: "inline-flex", alignItems: "center", gap: 8
            }}
          >
            <PlusIcon size={16} color="white" />
            Add your first business
          </button>
        </div>
      )}

      {/* ── BUSINESS CARDS ────────────────────────── */}
      {!loading && businesses.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 18
        }}>
          {businesses.map((b) => (
            <div key={b.id} style={{
              background: "#ffffff", borderRadius: 14,
              padding: 24, border: "1px solid #e2e8f0",
              boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
              transition: "all 0.2s"
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.10)";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = "#bfdbfe";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              {/* Card header */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: 18
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 50, height: 50,
                    background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
                    border: "1px solid #bfdbfe",
                    borderRadius: 12, display: "flex",
                    alignItems: "center", justifyContent: "center"
                  }}>
                    <BuildingIcon size={24} color="#1d4ed8" />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: 16, fontWeight: 800,
                      color: "#0f172a", marginBottom: 5
                    }}>{b.name}</h3>
                    <span style={{
                      fontSize: 11, padding: "3px 10px",
                      borderRadius: 20, fontWeight: 700,
                      background: "#dbeafe", color: "#1d4ed8"
                    }}>{b.industry}</span>
                  </div>
                </div>
                <span style={{
                  fontSize: 11, padding: "4px 12px",
                  borderRadius: 20, fontWeight: 700,
                  background: b.status === "active" ? "#d1fae5" : "#f1f5f9",
                  color: b.status === "active" ? "#065f46" : "#64748b"
                }}>{b.status}</span>
              </div>

              {/* Stats */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 10, marginBottom: 18
              }}>
                {[
                  {
                    icon: <MapPinIcon size={12} color="#94a3b8" />,
                    label: "Location",
                    value: b.location || "—"
                  },
                  {
                    icon: <UsersIcon size={12} color="#94a3b8" />,
                    label: "Employees",
                    value: b.employee_count ?? "—"
                  },
                  {
                    icon: <BarChartIcon size={12} color="#94a3b8" />,
                    label: "Revenue",
                    value: `₦${((b.annual_revenue ?? 0) / 1e6).toFixed(2)}M`
                  },
                  {
                    icon: <TrendingUpIcon size={12} color="#94a3b8" />,
                    label: "Net Profit",
                    value: `₦${((b.profit ?? 0) / 1e6).toFixed(2)}M`
                  },
                ].map((item) => (
                  <div key={item.label} style={{
                    background: "#f8fafc",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #f1f5f9"
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 5,
                      marginBottom: 4
                    }}>
                      {item.icon}
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {item.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <Link to="/valuations" style={{
                  flex: 1, padding: "10px",
                  background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "white", borderRadius: 8,
                  fontSize: 13, fontWeight: 700, textAlign: "center",
                  boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                  textDecoration: "none",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6,
                  transition: "all 0.2s"
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.4)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.25)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <BarChartIcon size={14} color="white" />
                  Get Valuation
                </Link>
                <Link to="/marketplace" style={{
                  padding: "10px 16px",
                  background: "#f8fafc",
                  color: "#334155", borderRadius: 8,
                  fontSize: 13, fontWeight: 700,
                  border: "1.5px solid #e2e8f0",
                  textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.15s"
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f1f5f9";
                    e.currentTarget.style.borderColor = "#cbd5e1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  <StoreIcon size={14} color="#334155" />
                  List
                </Link>
              </div>
            </div>
          ))}

          {/* Add another card */}
          <div
            onClick={() => setShowForm(true)}
            style={{
              background: "#f8fafc", borderRadius: 14,
              padding: 24, border: "2px dashed #e2e8f0",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              cursor: "pointer", minHeight: 200,
              transition: "all 0.2s", gap: 10
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
              width: 48, height: 48,
              background: "#dbeafe", borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <PlusIcon size={22} color="#1d4ed8" />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, color: "#1d4ed8", fontSize: 14, marginBottom: 4 }}>
                Add another business
              </div>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>
                Click to add a new business profile
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}