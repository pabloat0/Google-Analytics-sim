import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function BlogAdmin() {
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("posts");

    async function loadAll() {
        setLoading(true);
        const [{ data: p }, { data: c }] = await Promise.all([
            supabase.from("posts").select("*").order("created_at", { ascending: false }),
            supabase
                .from("comments")
                .select("*, posts(title)")
                .order("created_at", { ascending: false }),
        ]);
        setPosts(p || []);
        setComments(c || []);
        setLoading(false);
    }

    useEffect(() => {
        loadAll();
    }, []);

    async function handleDeletePost(id) {
        if (!confirm("این مقاله حذف شود؟")) return;
        await supabase.from("posts").delete().eq("id", id);
        loadAll();
    }

    async function handleCommentStatus(id, status) {
        await supabase.from("comments").update({ status }).eq("id", id);
        loadAll();
    }

    async function handleDeleteComment(id) {
        if (!confirm("این کامنت حذف شود؟")) return;
        await supabase.from("comments").delete().eq("id", id);
        loadAll();
    }

    const statusLabel = { draft: "پیش‌نویس", published: "منتشرشده" };
    const commentStatusLabel = {
        pending: "در انتظار تایید",
        approved: "تاییدشده",
        rejected: "ردشده",
    };
    const statusColor = {
        published: "bg-green-100 text-green-700",
        draft: "bg-amber-100 text-amber-700",
        pending: "bg-amber-100 text-amber-700",
        approved: "bg-green-100 text-green-700",
        rejected: "bg-red-100 text-red-600",
    };

    const pendingCount = comments.filter((c) => c.status === "pending").length;

    return (
        <div dir="rtl" className="secondary-font">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-[#7A6960]">مدیریت بلاگ</h1>
                {tab === "posts" && (
                    <Link
                        to="/Marketing-Website/admin/blog/new"
                        className="px-4 py-2 rounded-2xl bg-orange-600 hover:bg-orange-500 hover:shadow hover:shadow-orange-500 text-white text-sm font-medium transition-all duration-300"
                    >
                        + مقاله جدید
                    </Link>
                )}
            </div>

            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setTab("posts")}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${
                        tab === "posts"
                            ? "bg-orange-600 text-white shadow shadow-orange-500/40"
                            : "bg-white text-[#7A6960] border border-[#F0DCC9]"
                    }`}
                >
                    مقالات
                </button>
                <button
                    onClick={() => setTab("comments")}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium transition flex items-center gap-2 ${
                        tab === "comments"
                            ? "bg-orange-600 text-white shadow shadow-orange-500/40"
                            : "bg-white text-[#7A6960] border border-[#F0DCC9]"
                    }`}
                >
                    کامنت‌ها
                    {pendingCount > 0 && (
                        <span className="bg-red-400 text-white text-xs rounded-full px-1.5 py-0.5">
              {pendingCount}
            </span>
                    )}
                </button>
            </div>

            {loading ? (
                <p className="text-[#B5A79B]">در حال بارگذاری...</p>
            ) : tab === "posts" ? (
                <div className="bg-white border border-[#F0DCC9] rounded-3xl overflow-hidden shadow-sm">
                    {posts.length === 0 ? (
                        <p className="p-6 text-[#B5A79B]">هنوز مقاله‌ای ثبت نشده.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-[#FFF3EA] text-[#7A6960]">
                            <tr>
                                <th className="text-right p-3 font-medium">عنوان</th>
                                <th className="text-right p-3 font-medium">وضعیت</th>
                                <th className="text-right p-3 font-medium">تاریخ</th>
                                <th className="text-right p-3 font-medium">عملیات</th>
                            </tr>
                            </thead>
                            <tbody>
                            {posts.map((post) => (
                                <tr key={post.id} className="border-t border-[#F5EBDF]">
                                    <td className="p-3 text-[#7A6960]">{post.title}</td>
                                    <td className="p-3">
                      <span
                          className={`px-2.5 py-1 rounded-full text-xs ${statusColor[post.status]}`}
                      >
                        {statusLabel[post.status]}
                      </span>
                                    </td>
                                    <td className="p-3 text-[#B5A79B]">
                                        {new Date(post.created_at).toLocaleDateString("fa-IR")}
                                    </td>
                                    <td className="p-3 space-x-2 space-x-reverse">
                                        <Link
                                            to={`/Marketing-Website/admin/blog/${post.id}`}
                                            className="text-orange-600 hover:underline ml-3"
                                        >
                                            ویرایش
                                        </Link>
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="text-red-400 hover:underline"
                                        >
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {comments.length === 0 ? (
                        <p className="text-[#B5A79B]">کامنتی ثبت نشده.</p>
                    ) : (
                        comments.map((c) => (
                            <div
                                key={c.id}
                                className="bg-white border border-[#F0DCC9] rounded-3xl p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <span className="text-[#7A6960] font-medium">{c.author_name}</span>
                                        <span className="text-[#B5A79B] text-xs mr-2">
                      ({c.author_email})
                    </span>
                                    </div>
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-xs ${statusColor[c.status]}`}
                                    >
                    {commentStatusLabel[c.status]}
                  </span>
                                </div>
                                <p className="text-[#7A6960] text-sm mb-1">{c.content}</p>
                                <p className="text-[#B5A79B] text-xs mb-3">
                                    روی مقاله: {c.posts?.title || "—"}
                                </p>
                                <div className="flex gap-3 text-sm">
                                    {c.status !== "approved" && (
                                        <button
                                            onClick={() => handleCommentStatus(c.id, "approved")}
                                            className="text-green-600 hover:underline"
                                        >
                                            تایید
                                        </button>
                                    )}
                                    {c.status !== "rejected" && (
                                        <button
                                            onClick={() => handleCommentStatus(c.id, "rejected")}
                                            className="text-amber-600 hover:underline"
                                        >
                                            رد
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteComment(c.id)}
                                        className="text-red-400 hover:underline"
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}