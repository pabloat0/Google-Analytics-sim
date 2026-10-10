import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function MessagesAdmin() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);

    async function loadMessages() {
        setLoading(true);
        const { data } = await supabase
            .from("messages")
            .select("*")
            .order("created_at", { ascending: false });
        setMessages(data || []);
        setLoading(false);
    }

    useEffect(() => {
        loadMessages();
    }, []);

    async function openMessage(msg) {
        setOpenId(msg.id);
        setReplyText(msg.admin_reply || "");
        if (msg.status === "unread") {
            await supabase.from("messages").update({ status: "read" }).eq("id", msg.id);
            loadMessages();
        }
    }

    async function handleSendReply(id) {
        if (!replyText.trim()) return;
        setSending(true);
        await supabase
            .from("messages")
            .update({
                admin_reply: replyText,
                status: "replied",
                replied_at: new Date().toISOString(),
            })
            .eq("id", id);
        setSending(false);
        loadMessages();
    }

    async function handleDelete(id) {
        if (!confirm("این پیام حذف شود؟")) return;
        await supabase.from("messages").delete().eq("id", id);
        if (openId === id) setOpenId(null);
        loadMessages();
    }

    const statusLabel = { unread: "خوانده‌نشده", read: "خوانده‌شده", replied: "پاسخ‌داده‌شده" };
    const statusColor = {
        unread: "bg-red-100 text-red-600",
        read: "bg-amber-100 text-amber-700",
        replied: "bg-green-100 text-green-700",
    };

    const unreadCount = messages.filter((m) => m.status === "unread").length;

    return (
        <div dir="rtl" className="secondary-font">
            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-2xl font-semibold text-[#7A6960]">پیام‌های تماس</h1>
                {unreadCount > 0 && (
                    <span className="bg-red-400 text-white text-xs rounded-full px-2 py-1">
            {unreadCount} پیام جدید
          </span>
                )}
            </div>

            {loading ? (
                <p className="text-[#B5A79B]">در حال بارگذاری...</p>
            ) : messages.length === 0 ? (
                <p className="text-[#B5A79B]">هنوز پیامی دریافت نشده.</p>
            ) : (
                <div className="space-y-3">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className="bg-white border border-[#F0DCC9] rounded-3xl shadow-sm overflow-hidden"
                        >
                            <button
                                onClick={() => openMessage(msg)}
                                className="w-full text-right p-4 flex items-center justify-between gap-3"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[#7A6960] font-medium">{msg.name}</span>
                                        <span className="text-[#B5A79B] text-xs">({msg.email})</span>
                                    </div>
                                    <p className="text-sm text-[#8C7C6E] truncate">{msg.subject}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs ${statusColor[msg.status]}`}>
                    {statusLabel[msg.status]}
                  </span>
                                    <span className="text-xs text-[#B5A79B]">
                    {new Date(msg.created_at).toLocaleDateString("fa-IR")}
                  </span>
                                </div>
                            </button>

                            {openId === msg.id && (
                                <div className="px-4 pb-4 border-t border-[#F5EBDF] pt-4">
                                    <p className="text-[#7A6960] text-sm whitespace-pre-wrap mb-4 bg-[#FFF8F3] rounded-2xl p-3">
                                        {msg.message}
                                    </p>

                                    {msg.admin_reply && (
                                        <div className="mb-4">
                                            <p className="text-xs text-[#B5A79B] mb-1">پاسخ ارسال‌شده:</p>
                                            <p className="text-[#7A6960] text-sm whitespace-pre-wrap bg-green-50 rounded-2xl p-3">
                                                {msg.admin_reply}
                                            </p>
                                        </div>
                                    )}

                                    <label className="block text-sm text-[#7A6960] mb-1 font-medium">
                                        {msg.admin_reply ? "ویرایش پاسخ" : "نوشتن پاسخ"}
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="پاسخ خود را بنویسید..."
                                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF8F3] text-[#7A6960] border border-[#F0DCC9] focus:outline-none focus:border-[#EE7540] focus:ring-2 focus:ring-[#EE7540]/20 transition mb-3"
                                    />

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleSendReply(msg.id)}
                                            disabled={sending}
                                            className="px-4 py-2 rounded-2xl bg-orange-600 hover:bg-orange-500 hover:shadow hover:shadow-orange-500 text-white text-sm font-medium transition-all duration-300 disabled:opacity-50"
                                        >
                                            {sending ? "در حال ارسال..." : "ذخیره پاسخ"}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(msg.id)}
                                            className="px-4 py-2 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium transition"
                                        >
                                            حذف پیام
                                        </button>
                                    </div>

                                    <p className="text-xs text-[#B5A79B] mt-3">
                                        این پاسخ فقط در پنل ذخیره می‌شود؛ برای اطلاع کاربر باید خودتان به ایمیل «{msg.email}» پیام بدهید.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}