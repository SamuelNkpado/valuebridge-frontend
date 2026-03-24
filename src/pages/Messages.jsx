import { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage } from "../services/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { MessageIcon, ArrowRightIcon, UsersIcon } from "../components/Icons";

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages]       = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [content, setContent]         = useState("");
  const [sending, setSending]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [showNewMsg, setShowNewMsg]   = useState(false);
  const [newRecipientId, setNewRecipientId] = useState("");
  const [newContent, setNewContent]   = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getMessages()
      .then((r) => setMessages(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedContact]);

  // Build unique contacts from message history
  const contacts = (() => {
    const map = {};
    messages.forEach((m) => {
      const otherId = m.sender_id === user?.id ? m.receiver_id : m.sender_id;
      const isMe = m.sender_id === user?.id;
      if (!map[otherId]) {
        map[otherId] = {
          id: otherId,
          lastMessage: m.content,
          lastDate: m.created_at,
          unread: 0
        };
      } else {
        if (new Date(m.created_at) > new Date(map[otherId].lastDate)) {
          map[otherId].lastMessage = m.content;
          map[otherId].lastDate    = m.created_at;
        }
      }
      if (!isMe && !m.is_read) map[otherId].unread++;
    });
    return Object.values(map).sort(
      (a, b) => new Date(b.lastDate) - new Date(a.lastDate)
    );
  })();

  // Messages in current conversation
  const conversation = messages.filter((m) =>
    selectedContact &&
    ((m.sender_id === user?.id && m.receiver_id === selectedContact.id) ||
     (m.sender_id === selectedContact.id && m.receiver_id === user?.id))
  ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedContact) return;
    setSending(true);
    try {
      await sendMessage({
        receiver_id: selectedContact.id,
        content: content.trim()
      });
      const updated = await getMessages();
      setMessages(updated.data);
      setContent("");
    } catch { alert("Failed to send message."); }
    finally { setSending(false); }
  };

  const handleNewMessage = async (e) => {
    e.preventDefault();
    if (!newRecipientId || !newContent.trim()) return;
    setSending(true);
    try {
      await sendMessage({
        receiver_id: parseInt(newRecipientId),
        content: newContent.trim()
      });
      const updated = await getMessages();
      setMessages(updated.data);
      setShowNewMsg(false);
      setNewRecipientId("");
      setNewContent("");
      // Auto-select the new contact
      setSelectedContact({ id: parseInt(newRecipientId) });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to send. Check the user ID.");
    } finally { setSending(false); }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now   = new Date();
    const diff  = now - date;
    if (diff < 60000)    return "Just now";
    if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString();
  };

  return (
    <Layout
      title="Messages"
      subtitle="Communicate with investors and business owners"
      action={
        <button onClick={() => setShowNewMsg(true)} style={{
          padding: "10px 20px",
          background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
          color: "white", border: "none", borderRadius: 8,
          fontSize: 13, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          boxShadow: "0 4px 14px rgba(37,99,235,0.3)"
        }}>
          <MessageIcon size={14} color="white" />
          New Message
        </button>
      }
    >

      {/* ── NEW MESSAGE MODAL ─────────────────────── */}
      {showNewMsg && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(2,8,23,0.7)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }} onClick={() => setShowNewMsg(false)}>
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
                  New Message
                </div>
                <div style={{ color: "#93c5fd", fontSize: 13, marginTop: 3 }}>
                  Send a message to any user on ValueBridge
                </div>
              </div>
              <button onClick={() => setShowNewMsg(false)} style={{
                width: 32, height: 32, border: "none",
                background: "rgba(255,255,255,0.1)", borderRadius: "50%",
                color: "white", fontSize: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>✕</button>
            </div>

            <div style={{ padding: 24 }}>
              {/* How to find user ID tip */}
              <div style={{
                background: "#eff6ff", borderRadius: 8, padding: "12px 14px",
                marginBottom: 18, border: "1px solid #bfdbfe"
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", marginBottom: 4 }}>
                  💡 How to find a User ID
                </div>
                <div style={{ fontSize: 12, color: "#3b82f6", lineHeight: 1.6 }}>
                  When an investor makes an offer on your listing, their User ID appears
                  in your "Offers Received" tab in the Marketplace. Use that ID to message them directly.
                </div>
              </div>

              <form onSubmit={handleNewMessage}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{
                    display: "block", fontSize: 12, fontWeight: 700,
                    color: "#475569", marginBottom: 7,
                    textTransform: "uppercase", letterSpacing: "0.06em"
                  }}>Recipient User ID</label>
                  <input
                    style={{
                      width: "100%", padding: "11px 14px",
                      border: "1.5px solid #e2e8f0", borderRadius: 8,
                      fontSize: 14, outline: "none", background: "#f8fafc",
                      color: "#0f172a", boxSizing: "border-box"
                    }}
                    type="number" placeholder="e.g. 2"
                    value={newRecipientId}
                    onChange={(e) => setNewRecipientId(e.target.value)}
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
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: "block", fontSize: 12, fontWeight: 700,
                    color: "#475569", marginBottom: 7,
                    textTransform: "uppercase", letterSpacing: "0.06em"
                  }}>Message</label>
                  <textarea
                    style={{
                      width: "100%", padding: "11px 14px",
                      border: "1.5px solid #e2e8f0", borderRadius: 8,
                      fontSize: 14, outline: "none", background: "#f8fafc",
                      color: "#0f172a", boxSizing: "border-box",
                      height: 100, resize: "none"
                    }}
                    placeholder="Write your message..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
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
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" disabled={sending} style={{
                    flex: 1, padding: "13px",
                    background: sending
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                    color: "white", border: "none", borderRadius: 8,
                    fontWeight: 700, fontSize: 15, cursor: "pointer",
                    boxShadow: sending ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8
                  }}>
                    {sending ? "Sending..." : <><MessageIcon size={15} color="white" /> Send Message</>}
                  </button>
                  <button type="button" onClick={() => setShowNewMsg(false)} style={{
                    padding: "13px 18px", background: "#f8fafc",
                    color: "#475569", border: "1.5px solid #e2e8f0",
                    borderRadius: 8, fontWeight: 600, cursor: "pointer"
                  }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CHAT LAYOUT ──────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "300px 1fr",
        gap: 0, height: "calc(100vh - 180px)", minHeight: 500,
        background: "#ffffff", borderRadius: 14,
        border: "1px solid #e2e8f0", overflow: "hidden",
        boxShadow: "0 1px 4px rgba(15,23,42,0.06)"
      }}>

        {/* ── LEFT: CONTACTS LIST ───────────────── */}
        <div style={{
          borderRight: "1px solid #f1f5f9",
          display: "flex", flexDirection: "column",
          background: "#fafafa"
        }}>
          {/* Contacts header */}
          <div style={{
            padding: "16px 18px",
            borderBottom: "1px solid #f1f5f9",
            background: "#ffffff"
          }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 2
            }}>Conversations</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Contact list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "center", padding: 40,
                flexDirection: "column", gap: 10
              }}>
                <div style={{
                  width: 24, height: 24,
                  border: "2px solid #dbeafe",
                  borderTopColor: "#2563eb", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite"
                }} />
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Loading...</span>
              </div>
            ) : contacts.length === 0 ? (
              <div style={{
                padding: "40px 16px", textAlign: "center"
              }}>
                <div style={{
                  width: 48, height: 48, background: "#f1f5f9",
                  borderRadius: 12, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px"
                }}>
                  <UsersIcon size={22} color="#94a3b8" />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  No conversations yet
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                  Start a new message to connect with investors or sellers
                </div>
                <button onClick={() => setShowNewMsg(true)} style={{
                  marginTop: 14, padding: "8px 16px",
                  background: "#eff6ff", color: "#1d4ed8",
                  border: "1px solid #bfdbfe", borderRadius: 7,
                  fontSize: 12, fontWeight: 700, cursor: "pointer"
                }}>+ New Message</button>
              </div>
            ) : (
              contacts.map((contact) => {
                const active = selectedContact?.id === contact.id;
                return (
                  <div key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    style={{
                      padding: "14px 18px", cursor: "pointer",
                      background: active ? "#eff6ff" : "transparent",
                      borderLeft: active ? "3px solid #1d4ed8" : "3px solid transparent",
                      borderBottom: "1px solid #f1f5f9",
                      transition: "all 0.15s"
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 40, height: 40, flexShrink: 0,
                        background: active
                          ? "linear-gradient(135deg, #1d4ed8, #3b82f6)"
                          : "linear-gradient(135deg, #334155, #475569)",
                        borderRadius: "50%", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: 800, fontSize: 15
                      }}>
                        {contact.id}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          alignItems: "center", marginBottom: 3
                        }}>
                          <span style={{
                            fontSize: 13, fontWeight: 700,
                            color: active ? "#1d4ed8" : "#0f172a"
                          }}>User #{contact.id}</span>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            {formatTime(contact.lastDate)}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 12, color: "#64748b",
                          whiteSpace: "nowrap", overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {contact.lastMessage}
                        </div>
                      </div>
                      {contact.unread > 0 && (
                        <div style={{
                          width: 18, height: 18, background: "#1d4ed8",
                          borderRadius: "50%", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700, color: "white",
                          flexShrink: 0
                        }}>{contact.unread}</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* New message button */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9" }}>
            <button onClick={() => setShowNewMsg(true)} style={{
              width: "100%", padding: "10px",
              background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
              color: "white", border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6
            }}>
              <MessageIcon size={14} color="white" />
              New Message
            </button>
          </div>
        </div>

        {/* ── RIGHT: CHAT WINDOW ────────────────── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {!selectedContact ? (
            /* Empty state */
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: 40, textAlign: "center"
            }}>
              <div style={{
                width: 80, height: 80,
                background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                border: "1px solid #bfdbfe",
                borderRadius: 20, display: "flex",
                alignItems: "center", justifyContent: "center",
                marginBottom: 20
              }}>
                <MessageIcon size={36} color="#1d4ed8" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                Select a conversation
              </h3>
              <p style={{ color: "#64748b", fontSize: 15, maxWidth: 300, lineHeight: 1.6 }}>
                Choose a contact from the left to view your messages,
                or start a new conversation.
              </p>
              <button onClick={() => setShowNewMsg(true)} style={{
                marginTop: 20, padding: "12px 28px",
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                display: "flex", alignItems: "center", gap: 8
              }}>
                <MessageIcon size={15} color="white" />
                Start new conversation
              </button>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{
                padding: "14px 20px",
                borderBottom: "1px solid #f1f5f9",
                background: "#ffffff",
                display: "flex", alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40,
                    background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                    borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 800, fontSize: 15
                  }}>
                    {selectedContact.id}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                      User #{selectedContact.id}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      {conversation.length} message{conversation.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedContact(null)} style={{
                  padding: "7px 14px", background: "#f8fafc",
                  color: "#475569", border: "1px solid #e2e8f0",
                  borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer"
                }}>← Back</button>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "20px",
                display: "flex", flexDirection: "column", gap: 12,
                background: "#f8fafc"
              }}>
                {conversation.length === 0 ? (
                  <div style={{
                    flex: 1, display: "flex", alignItems: "center",
                    justifyContent: "center", textAlign: "center"
                  }}>
                    <div>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
                      <div style={{ fontSize: 14, color: "#64748b" }}>
                        No messages yet. Say hello!
                      </div>
                    </div>
                  </div>
                ) : (
                  conversation.map((m) => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <div key={m.id} style={{
                        display: "flex",
                        justifyContent: isMe ? "flex-end" : "flex-start"
                      }}>
                        {!isMe && (
                          <div style={{
                            width: 32, height: 32, flexShrink: 0,
                            background: "linear-gradient(135deg, #475569, #334155)",
                            borderRadius: "50%", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            color: "white", fontSize: 12, fontWeight: 700,
                            marginRight: 8, alignSelf: "flex-end"
                          }}>{m.sender_id}</div>
                        )}
                        <div style={{ maxWidth: "65%" }}>
                          <div style={{
                            padding: "10px 14px",
                            background: isMe
                              ? "linear-gradient(135deg, #1d4ed8, #2563eb)"
                              : "#ffffff",
                            color: isMe ? "white" : "#0f172a",
                            borderRadius: isMe
                              ? "14px 14px 4px 14px"
                              : "14px 14px 14px 4px",
                            fontSize: 14, lineHeight: 1.5,
                            boxShadow: isMe
                              ? "0 4px 12px rgba(37,99,235,0.2)"
                              : "0 1px 4px rgba(15,23,42,0.08)",
                            border: isMe ? "none" : "1px solid #f1f5f9"
                          }}>
                            {m.content}
                          </div>
                          <div style={{
                            fontSize: 11, color: "#94a3b8",
                            marginTop: 4, textAlign: isMe ? "right" : "left",
                            paddingLeft: isMe ? 0 : 4,
                            paddingRight: isMe ? 4 : 0
                          }}>
                            {formatTime(m.created_at)}
                          </div>
                        </div>
                        {isMe && (
                          <div style={{
                            width: 32, height: 32, flexShrink: 0,
                            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                            borderRadius: "50%", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            color: "white", fontSize: 12, fontWeight: 700,
                            marginLeft: 8, alignSelf: "flex-end"
                          }}>{user?.full_name?.charAt(0)}</div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <form onSubmit={handleSend} style={{
                padding: "14px 20px",
                borderTop: "1px solid #f1f5f9",
                background: "#ffffff",
                display: "flex", gap: 10, alignItems: "flex-end"
              }}>
                <textarea
                  style={{
                    flex: 1, padding: "12px 16px",
                    border: "1.5px solid #e2e8f0", borderRadius: 10,
                    fontSize: 14, outline: "none", background: "#f8fafc",
                    color: "#0f172a", resize: "none", minHeight: 44, maxHeight: 120,
                    lineHeight: 1.5, transition: "border-color 0.2s, box-shadow 0.2s"
                  }}
                  placeholder={`Message User #${selectedContact.id}...`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                    e.target.style.background = "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                    e.target.style.background = "#f8fafc";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <button type="submit" disabled={sending || !content.trim()} style={{
                  width: 46, height: 46, flexShrink: 0,
                  background: sending || !content.trim()
                    ? "#e2e8f0"
                    : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: sending || !content.trim() ? "#94a3b8" : "white",
                  border: "none", borderRadius: 10,
                  cursor: sending || !content.trim() ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: sending || !content.trim()
                    ? "none" : "0 4px 12px rgba(37,99,235,0.3)",
                  transition: "all 0.2s"
                }}>
                  {sending ? (
                    <div style={{
                      width: 16, height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white", borderRadius: "50%",
                      animation: "spin 0.7s linear infinite"
                    }} />
                  ) : (
                    <ArrowRightIcon size={18} color="inherit" />
                  )}
                </button>
              </form>

              {/* Keyboard hint */}
              <div style={{
                padding: "6px 20px 10px",
                fontSize: 11, color: "#94a3b8", background: "#ffffff"
              }}>
                Press <strong>Enter</strong> to send · <strong>Shift+Enter</strong> for new line
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}