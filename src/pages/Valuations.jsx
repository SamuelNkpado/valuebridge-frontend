import { useState, useEffect } from "react";
import {
  getMyBusinesses, createValuation, getValuationsForBusiness
} from "../services/api";
import Layout from "../components/Layout";
import {
  BarChartIcon, BuildingIcon, TrendingUpIcon,
  ZapIcon, ArrowRightIcon, CheckCircleIcon
} from "../components/Icons";

const methodLabels = {
  asset_based:      "Asset Based",
  income_based:     "Income Based (DCF)",
  market_multiples: "Market Multiples",
  combined:         "Combined (Recommended)",
};

const methodInfo = {
  asset_based: {
    formula: "Assets − Liabilities",
    desc: "Values the business based on what it owns minus what it owes. Best for asset-heavy businesses.",
    color: "#1d4ed8", bg: "#eff6ff", border: "#dbeafe"
  },
  income_based: {
    formula: "Profit ÷ (Discount Rate − Growth Rate)",
    desc: "Values the business based on future earning potential. Affected by your growth rate setting.",
    color: "#059669", bg: "#f0fdf4", border: "#bbf7d0"
  },
  market_multiples: {
    formula: "Revenue × Industry Multiple",
    desc: "Compares your business to similar ones sold in the market. Uses industry-specific multipliers.",
    color: "#d97706", bg: "#fffbeb", border: "#fde68a"
  },
  combined: {
    formula: "(Asset + Income + Market) ÷ 3",
    desc: "Averages all three methods for a balanced, professional estimate. Recommended for most businesses.",
    color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff"
  },
};

export default function Valuations() {
  const [businesses, setBusinesses]   = useState([]);
  const [selected, setSelected]       = useState("");
  const [method, setMethod]           = useState("combined");
  const [growthRate, setGrowthRate]   = useState(0.10);
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [showInfo, setShowInfo]       = useState(false);

  useEffect(() => {
    getMyBusinesses().then((r) => setBusinesses(r.data));
  }, []);

  useEffect(() => {
    if (selected) {
      getValuationsForBusiness(selected).then((r) => setReports(r.data));
    }
  }, [selected]);

  const handleValuation = async () => {
    if (!selected) return alert("Please select a business first.");
    setLoading(true);
    try {
      const res = await createValuation({
        business_id: parseInt(selected),
        method,
        growth_rate: growthRate
      });
      setResult(res.data);
      setReports((prev) => [res.data, ...prev]);
    } catch {
      alert("Valuation failed. Please make sure your business has financial data.");
    } finally { setLoading(false); }
  };

  const selectedBusiness = businesses.find((b) => b.id === parseInt(selected));
  const info = methodInfo[method];

  return (
    <Layout
      title="Valuations"
      subtitle="Calculate your business value using professional methods"
    >

      {/* ── HOW IT WORKS BANNER ───────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0a1628, #1e3a5f)",
        borderRadius: 12, padding: "18px 24px",
        marginBottom: 24,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid rgba(96,165,250,0.2)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42, height: 42, background: "rgba(37,99,235,0.3)",
            border: "1px solid rgba(96,165,250,0.3)",
            borderRadius: 10, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <BarChartIcon size={20} color="#60a5fa" />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>
              How does valuation work?
            </div>
            <div style={{ color: "#93c5fd", fontSize: 13 }}>
              We use 3 professional methods used by real business brokers and investors.
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          style={{
            padding: "8px 16px", background: "rgba(96,165,250,0.15)",
            color: "#93c5fd", border: "1px solid rgba(96,165,250,0.3)",
            borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer",
            flexShrink: 0
          }}
        >{showInfo ? "Hide explanation" : "Learn more"}</button>
      </div>

      {/* ── EXPLANATION PANEL ─────────────────────── */}
      {showInfo && (
        <div style={{
          background: "#ffffff", borderRadius: 12,
          border: "1px solid #e2e8f0", marginBottom: 24,
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(15,23,42,0.08)"
        }}>
          <div style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f1f5f9",
            background: "#f8fafc"
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Understanding Your Valuation
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16, marginBottom: 24
            }}>
              {[
                {
                  name: "Asset Based",
                  formula: "Assets − Liabilities",
                  example: "₦3M − ₦0.5M = ₦2.5M",
                  desc: "Minimum value of the business. What you'd get if you sold everything and paid all debts.",
                  color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe"
                },
                {
                  name: "Income Based (DCF)",
                  formula: "Profit ÷ (20% − Growth%)",
                  example: "₦1.2M ÷ (20%−10%) = ₦12M",
                  desc: "Value based on future earnings. Higher growth rate = higher valuation. Uses 20% discount for Nigerian SME risk.",
                  color: "#059669", bg: "#f0fdf4", border: "#a7f3d0"
                },
                {
                  name: "Market Multiples",
                  formula: "Revenue × Industry Multiple",
                  example: "₦5M × 2.5x = ₦12.5M",
                  desc: "What similar businesses sell for in the market. Each industry has a different multiplier (e.g. Food & Beverage = 2.5x).",
                  color: "#d97706", bg: "#fffbeb", border: "#fde68a"
                },
              ].map((m) => (
                <div key={m.name} style={{
                  background: m.bg, borderRadius: 10,
                  padding: 18, border: `1px solid ${m.border}`
                }}>
                  <div style={{ fontWeight: 700, color: m.color, fontSize: 14, marginBottom: 6 }}>
                    {m.name}
                  </div>
                  <div style={{
                    fontFamily: "monospace", fontSize: 12,
                    background: "rgba(255,255,255,0.7)",
                    padding: "6px 10px", borderRadius: 6,
                    marginBottom: 8, color: "#334155"
                  }}>{m.formula}</div>
                  <div style={{
                    fontSize: 12, fontWeight: 700,
                    color: m.color, marginBottom: 8
                  }}>Example: {m.example}</div>
                  <p style={{ fontSize: 12, color: "#475569",
                    lineHeight: 1.6, margin: 0 }}>{m.desc}</p>
                </div>
              ))}
            </div>

            {/* Growth rate explainer */}
            <div style={{
              background: "#f8fafc", borderRadius: 10,
              padding: 18, border: "1px solid #e2e8f0"
            }}>
              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, marginBottom: 10 }}>
                📈 About the Growth Rate
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12
              }}>
                {[
                  { range: "1–5%", label: "Conservative", desc: "Stable / slow growth", color: "#64748b", bg: "#f1f5f9" },
                  { range: "6–10%", label: "Moderate", desc: "Healthy growth", color: "#059669", bg: "#f0fdf4" },
                  { range: "11–20%", label: "Strong", desc: "Fast-growing business", color: "#1d4ed8", bg: "#eff6ff" },
                  { range: "21–30%", label: "Aggressive", desc: "Startup / high growth", color: "#7c3aed", bg: "#faf5ff" },
                ].map((g) => (
                  <div key={g.range} style={{
                    background: g.bg, padding: "12px 14px",
                    borderRadius: 8, textAlign: "center"
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: g.color }}>{g.range}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: g.color, marginBottom: 3 }}>
                      {g.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{g.desc}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 12, marginBottom: 0 }}>
                ⚠️ <strong>Important:</strong> Higher growth rate increases your valuation but investors will
                verify your actual growth history. Use a realistic rate for credible valuations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN GRID ─────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 24, marginBottom: 28
      }}>

        {/* LEFT — Controls */}
        <div style={{
          background: "#ffffff", borderRadius: 14,
          padding: 28, border: "1px solid #e2e8f0",
          boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
        }}>
          <h2 style={{
            fontSize: 18, fontWeight: 700, color: "#0f172a",
            marginBottom: 22, display: "flex", alignItems: "center", gap: 10
          }}>
            <div style={{
              width: 32, height: 32, background: "#dbeafe",
              borderRadius: 8, display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              <BarChartIcon size={16} color="#1d4ed8" />
            </div>
            Run New Valuation
          </h2>

          {/* Select Business */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block", fontSize: 12, fontWeight: 700,
              color: "#475569", marginBottom: 8,
              textTransform: "uppercase", letterSpacing: "0.07em"
            }}>Select Business</label>
            <select style={{
              width: "100%", padding: "12px 14px",
              border: "1.5px solid #e2e8f0", borderRadius: 8,
              fontSize: 14, outline: "none", background: "#f8fafc",
              color: selected ? "#0f172a" : "#94a3b8",
              cursor: "pointer", transition: "border-color 0.2s"
            }}
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = "#2563eb";
                e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="">-- Choose a business --</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            {/* Selected business preview */}
            {selectedBusiness && (
              <div style={{
                marginTop: 10, padding: "10px 14px",
                background: "#eff6ff", borderRadius: 8,
                border: "1px solid #bfdbfe",
                display: "flex", gap: 14
              }}>
                <div>
                  <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    Business Preview
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "Revenue", value: `₦${((selectedBusiness.annual_revenue ?? 0)/1e6).toFixed(1)}M` },
                      { label: "Profit",  value: `₦${((selectedBusiness.profit ?? 0)/1e6).toFixed(1)}M` },
                      { label: "Assets",  value: `₦${((selectedBusiness.total_assets ?? 0)/1e6).toFixed(1)}M` },
                      { label: "Liabilities", value: `₦${((selectedBusiness.total_liabilities ?? 0)/1e6).toFixed(1)}M` },
                    ].map((item) => (
                      <div key={item.label}>
                        <span style={{ fontSize: 11, color: "#3b82f6" }}>{item.label}: </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Valuation Method */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block", fontSize: 12, fontWeight: 700,
              color: "#475569", marginBottom: 8,
              textTransform: "uppercase", letterSpacing: "0.07em"
            }}>Valuation Method</label>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8
            }}>
              {Object.entries(methodLabels).map(([val, label]) => (
                <div key={val} onClick={() => setMethod(val)} style={{
                  padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                  border: method === val
                    ? `2px solid ${methodInfo[val].color}`
                    : "2px solid #e2e8f0",
                  background: method === val ? methodInfo[val].bg : "#f8fafc",
                  transition: "all 0.15s"
                }}>
                  <div style={{
                    fontSize: 13, fontWeight: method === val ? 700 : 500,
                    color: method === val ? methodInfo[val].color : "#334155",
                    marginBottom: 3
                  }}>{label}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {methodInfo[val].formula}
                  </div>
                </div>
              ))}
            </div>

            {/* Method description */}
            <div style={{
              marginTop: 10, padding: "10px 14px",
              background: info.bg, borderRadius: 8,
              border: `1px solid ${info.border}`,
              fontSize: 13, color: info.color, lineHeight: 1.6
            }}>
              {info.desc}
            </div>
          </div>

          {/* Growth Rate Slider */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 8
            }}>
              <label style={{
                fontSize: 12, fontWeight: 700, color: "#475569",
                textTransform: "uppercase", letterSpacing: "0.07em"
              }}>Growth Rate</label>
              <span style={{
                fontSize: 16, fontWeight: 800, color: "#1d4ed8",
                fontFamily: "Georgia, serif"
              }}>{(growthRate * 100).toFixed(0)}%</span>
            </div>

            <input
              type="range" min="0.01" max="0.30" step="0.01"
              value={growthRate}
              onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "#2563eb", cursor: "pointer" }}
            />

            <div style={{
              display: "flex", justifyContent: "space-between", marginTop: 6
            }}>
              {[
                { pct: "1%", label: "Conservative", pos: 0 },
                { pct: "10%", label: "Moderate", pos: 33 },
                { pct: "20%", label: "Strong", pos: 66 },
                { pct: "30%", label: "Aggressive", pos: 100 },
              ].map((t) => (
                <div key={t.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#334155" }}>
                    {t.pct}
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{t.label}</div>
                </div>
              ))}
            </div>

            {/* Growth rate impact preview */}
            {selectedBusiness?.profit && (
              <div style={{
                marginTop: 12, padding: "10px 14px",
                background: "#f0fdf4", borderRadius: 8,
                border: "1px solid #bbf7d0", fontSize: 13
              }}>
                <span style={{ color: "#065f46" }}>
                  At <strong>{(growthRate * 100).toFixed(0)}% growth</strong>, Income-Based estimate ≈{" "}
                  <strong>₦{(selectedBusiness.profit / (0.20 - growthRate) / 1e6).toFixed(2)}M</strong>
                </span>
                <br />
                <span style={{ fontSize: 11, color: "#059669" }}>
                  Formula: ₦{(selectedBusiness.profit / 1e6).toFixed(1)}M ÷ (20% − {(growthRate * 100).toFixed(0)}%)
                </span>
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleValuation}
            disabled={loading || !selected}
            style={{
              width: "100%", padding: "15px",
              background: loading || !selected
                ? "#94a3b8"
                : "linear-gradient(135deg, #1d4ed8, #2563eb)",
              color: "white", border: "none", borderRadius: 8,
              fontSize: 16, fontWeight: 700, cursor: loading || !selected
                ? "not-allowed" : "pointer",
              boxShadow: loading || !selected
                ? "none" : "0 4px 16px rgba(37,99,235,0.3)",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 10,
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              if (!loading && selected) {
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.4)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = loading || !selected
                ? "none" : "0 4px 16px rgba(37,99,235,0.3)";
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
                Calculating...
              </>
            ) : (
              <>
                <BarChartIcon size={18} color="white" />
                Calculate Valuation
                <ArrowRightIcon size={16} color="white" />
              </>
            )}
          </button>
          {!selected && (
            <p style={{
              textAlign: "center", fontSize: 12, color: "#94a3b8",
              marginTop: 8
            }}>Select a business above to enable this button</p>
          )}
        </div>

        {/* RIGHT — Result */}
        <div style={{
          background: result ? "linear-gradient(160deg, #0a1628, #1e3a5f)" : "#ffffff",
          borderRadius: 14,
          border: result ? "1px solid rgba(96,165,250,0.2)" : "2px dashed #e2e8f0",
          boxShadow: result ? "0 8px 32px rgba(15,23,42,0.2)" : "none",
          overflow: "hidden", transition: "all 0.3s"
        }}>
          {!result ? (
            <div style={{
              height: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              textAlign: "center", padding: 40, gap: 16
            }}>
              <div style={{
                width: 80, height: 80, background: "#f1f5f9",
                borderRadius: 20, display: "flex",
                alignItems: "center", justifyContent: "center"
              }}>
                <BarChartIcon size={36} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#334155", margin: 0 }}>
                Your valuation result will appear here
              </h3>
              <p style={{ color: "#94a3b8", fontSize: 14, margin: 0, maxWidth: 260 }}>
                Select a business, choose your method, set your growth rate, then click Calculate
              </p>

              {/* Quick steps */}
              <div style={{
                marginTop: 8, display: "flex",
                flexDirection: "column", gap: 8, width: "100%", maxWidth: 280
              }}>
                {[
                  "1. Select your business",
                  "2. Choose valuation method",
                  "3. Set realistic growth rate",
                  "4. Click Calculate Valuation",
                ].map((step, i) => (
                  <div key={step} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 12px",
                    background: "#f8fafc", borderRadius: 7,
                    border: "1px solid #f1f5f9"
                  }}>
                    <div style={{
                      width: 22, height: 22,
                      background: "#dbeafe", borderRadius: "50%",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 11,
                      fontWeight: 700, color: "#1d4ed8", flexShrink: 0
                    }}>{i + 1}</div>
                    <span style={{ fontSize: 13, color: "#475569" }}>
                      {step.slice(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: 28 }}>
              {/* Result header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 11, color: "#60a5fa", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8
                }}>
                  Valuation Complete — {methodLabels[result.method]}
                </div>
                <div style={{
                  fontSize: 54, fontWeight: 800, color: "white",
                  fontFamily: "Georgia, serif", letterSpacing: "-0.03em",
                  lineHeight: 1, marginBottom: 8
                }}>
                  ₦{(result.estimated_value / 1e6).toFixed(2)}M
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "rgba(74,222,128,0.15)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  borderRadius: 20, padding: "5px 14px"
                }}>
                  <CheckCircleIcon size={14} color="#4ade80" />
                  <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 700 }}>
                    Estimated Business Value
                  </span>
                </div>
              </div>

              {/* Three method breakdown */}
              <div style={{
                display: "flex", flexDirection: "column", gap: 12, marginBottom: 24
              }}>
                {[
                  { label: "Asset Based",       value: result.asset_based_value,       key: "asset" },
                  { label: "Income Based (DCF)", value: result.income_based_value,      key: "income" },
                  { label: "Market Multiples",  value: result.market_multiples_value,  key: "market" },
                ].map((item) => {
                  const maxVal = Math.max(
                    result.asset_based_value || 0,
                    result.income_based_value || 0,
                    result.market_multiples_value || 0
                  );
                  const pct = maxVal > 0 ? ((item.value || 0) / maxVal) * 100 : 0;
                  return (
                    <div key={item.key} style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10, padding: "14px 16px"
                    }}>
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginBottom: 8
                      }}>
                        <span style={{ color: "#bfdbfe", fontSize: 13 }}>{item.label}</span>
                        <span style={{ color: "white", fontWeight: 800, fontSize: 16 }}>
                          ₦{((item.value ?? 0) / 1e6).toFixed(2)}M
                        </span>
                      </div>
                      <div style={{
                        height: 6, background: "rgba(255,255,255,0.1)",
                        borderRadius: 10, overflow: "hidden"
                      }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: "linear-gradient(90deg, #2563eb, #60a5fa)",
                          borderRadius: 10, transition: "width 1s ease"
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Assumptions */}
              <div style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "14px 16px", marginBottom: 20
              }}>
                <div style={{
                  fontSize: 11, color: "#60a5fa", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10
                }}>Assumptions Used</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Growth Rate", value: `${((result.assumptions?.growth_rate ?? 0) * 100).toFixed(0)}%` },
                    { label: "Discount Rate", value: `${((result.assumptions?.discount_rate ?? 0) * 100).toFixed(0)}%` },
                    { label: "Method", value: methodLabels[result.method] },
                    { label: "Date", value: new Date(result.created_at).toLocaleDateString() },
                  ].map((item) => (
                    <div key={item.label}>
                      <span style={{ color: "#64748b", fontSize: 12 }}>{item.label}: </span>
                      <span style={{ color: "#93c5fd", fontWeight: 700, fontSize: 12 }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Run another */}
              <button
                onClick={() => setResult(null)}
                style={{
                  width: "100%", padding: "11px",
                  background: "rgba(255,255,255,0.1)",
                  color: "white", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", transition: "background 0.15s"
                }}
                onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.18)"}
                onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
              >↩ Run another valuation</button>
            </div>
          )}
        </div>
      </div>

      {/* ── VALUATION HISTORY ─────────────────────── */}
      {reports.length > 0 && (
        <div style={{
          background: "#ffffff", borderRadius: 14,
          border: "1px solid #e2e8f0", overflow: "hidden",
          boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
        }}>
          <div style={{
            padding: "18px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#f8fafc"
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Valuation History
            </h2>
            <span style={{
              background: "#dbeafe", color: "#1d4ed8",
              padding: "3px 12px", borderRadius: 20,
              fontSize: 12, fontWeight: 700
            }}>{reports.length} report{reports.length > 1 ? "s" : ""}</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Method", "Asset Based", "Income Based", "Market Multiples", "Final Value", "Growth", "Date"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      fontSize: 11, fontWeight: 700, color: "#94a3b8",
                      textTransform: "uppercase", letterSpacing: "0.07em",
                      whiteSpace: "nowrap"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={r.id} style={{
                    borderTop: "1px solid #f1f5f9",
                    transition: "background 0.15s"
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        fontSize: 12, padding: "4px 10px", borderRadius: 20,
                        fontWeight: 700,
                        background: methodInfo[r.method]?.bg || "#f1f5f9",
                        color: methodInfo[r.method]?.color || "#64748b"
                      }}>
                        {methodLabels[r.method]}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                      ₦{((r.asset_based_value ?? 0)/1e6).toFixed(2)}M
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                      ₦{((r.income_based_value ?? 0)/1e6).toFixed(2)}M
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                      ₦{((r.market_multiples_value ?? 0)/1e6).toFixed(2)}M
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        fontSize: 15, fontWeight: 800, color: "#059669",
                        fontFamily: "Georgia, serif"
                      }}>
                        ₦{((r.estimated_value ?? 0)/1e6).toFixed(2)}M
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                      {((r.assumptions?.growth_rate ?? 0) * 100).toFixed(0)}%
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#94a3b8" }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}