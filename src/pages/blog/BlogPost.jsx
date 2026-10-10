import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { trackEvent } from "../../lib/analytics";
import { renderContent } from "../../lib/renderContent";

export default function BlogPost() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    async function loadData() {
        const { data: p } = await supabase
            .from("posts")
            .select("*")
            .eq("slug", slug)
            .single();

        if (!p) {
            setPost(null);
            setLoading(false);
            return;
        }

        const { data: c } = await supabase
            .from("comments")
            .select("*")
            .eq("post_id", p.id)
            .eq("status", "approved")
            .order("created_at", { ascending: false });

        setPost(p);
        setComments(c || []);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    // متا تگ‌های سئو رو موقع باز شدن مقاله تنظیم می‌کنه، و موقع خروج برمی‌گردونه
    useEffect(() => {
        if (!post) return;

        const previousTitle = document.title;
        document.title = post.meta_title || post.title;

        function setMetaTag(name, content) {
            if (!content) return null;
            let tag = document.querySelector(`meta[name="${name}"]`);
            const existed = !!tag;
            if (!tag) {
                tag = document.createElement("meta");
                tag.setAttribute("name", name);
                document.head.appendChild(tag);
            }
            const previousContent = tag.getAttribute("content");
            tag.setAttribute("content", content);
            return { tag, existed, previousContent };
        }

        const descriptionInfo = setMetaTag("description", post.meta_description);

        return () => {
            document.title = previousTitle;
            if (descriptionInfo) {
                if (descriptionInfo.existed) {
                    descriptionInfo.tag.setAttribute(
                        "content",
                        descriptionInfo.previousContent || ""
                    );
                } else {
                    descriptionInfo.tag.remove();
                }
            }
        };
    }, [post]);

    async function handleSubmitComment(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        const { error } = await supabase.from("comments").insert({
            post_id: post.id,
            author_name: name,
            author_email: email,
            content,
            status: "pending",
        });

        setSubmitting(false);
        if (error) {
            setError("ارسال کامنت با خطا مواجه شد.");
            return;
        }
        trackEvent("submit_comment");
        setSubmitted(true);
        setName("");
        setEmail("");
        setContent("");
    }

    const pageBg = {
        background: "linear-gradient(160deg, #FFF8F3 0%, #FFF3EA 100%)",
    };

    if (loading) {
        return (
            <div dir="rtl" className="min-h-screen secondary-font" style={pageBg}>
                <p className="text-center text-[#B5A79B] py-16">در حال بارگذاری...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div dir="rtl" className="min-h-screen secondary-font" style={pageBg}>
                <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                    <p className="text-[#B5A79B] mb-4">مقاله پیدا نشد.</p>
                    <Link to="/Marketing-Website/blog" className="text-orange-600 hover:underline">
                        بازگشت به وبلاگ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen secondary-font" style={pageBg}>
            <div className="max-w-2xl mx-auto px-4 py-16">
                <Link
                    to="/Marketing-Website/blog"
                    className="text-orange-600 text-sm hover:underline"
                >
                    ← بازگشت به وبلاگ
                </Link>

                {post.cover_image_url && (
                    <img
                        src={post.cover_image_url}
                        alt={post.cover_image_alt || post.title}
                        className="w-full h-64 object-cover rounded-3xl mt-4 mb-6"
                    />
                )}

                <h1 className="text-3xl font-semibold text-[#7A6960] mb-2">{post.title}</h1>
                <p className="text-[#B5A79B] text-sm mb-6">
                    {new Date(post.created_at).toLocaleDateString("fa-IR")}
                </p>

                <div className="bg-white rounded-3xl border border-[#F0DCC9] p-6 shadow-sm mb-12">
                    {renderContent(post.content)}
                </div>

                <h2 className="text-xl font-semibold text-[#7A6960] mb-4">
                    نظرات ({comments.length})
                </h2>

                <div className="space-y-4 mb-10">
                    {comments.length === 0 ? (
                        <p className="text-[#B5A79B] text-sm">
                            اولین نفری باشید که نظر می‌دهد.
                        </p>
                    ) : (
                        comments.map((c) => (
                            <div
                                key={c.id}
                                className="bg-white rounded-2xl border border-[#F0DCC9] p-4"
                            >
                                <p className="font-medium text-[#7A6960] text-sm mb-1">
                                    {c.author_name}
                                </p>
                                <p className="text-[#8C7C6E] text-sm">{c.content}</p>
                            </div>
                        ))
                    )}
                </div>

                {submitted ? (
                    <p className="text-green-700 bg-green-50 rounded-2xl p-4 text-sm">
                        نظر شما ثبت شد و پس از تایید نمایش داده می‌شود. ممنون از مشارکتتون!
                    </p>
                ) : (
                    <form
                        onSubmit={handleSubmitComment}
                        className="bg-white rounded-3xl border border-[#F0DCC9] p-6 shadow-sm space-y-3"
                    >
                        <h3 className="font-semibold text-[#7A6960]">ثبت نظر</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                required
                                placeholder="نام شما"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="px-4 py-2.5 rounded-2xl bg-[#FFF8F3] border border-[#F0DCC9] focus:outline-none focus:border-[#EE7540] focus:ring-2 focus:ring-[#EE7540]/20 transition"
                            />
                            <input
                                required
                                type="email"
                                placeholder="ایمیل"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="px-4 py-2.5 rounded-2xl bg-[#FFF8F3] border border-[#F0DCC9] focus:outline-none focus:border-[#EE7540] focus:ring-2 focus:ring-[#EE7540]/20 transition"
                            />
                        </div>
                        <textarea
                            required
                            rows={4}
                            placeholder="نظر شما..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF8F3] border border-[#F0DCC9] focus:outline-none focus:border-[#EE7540] focus:ring-2 focus:ring-[#EE7540]/20 transition"
                        />
                        {error && (
                            <p className="text-red-400 text-sm bg-red-50 rounded-xl py-2 px-3">
                                {error}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 hover:shadow hover:shadow-orange-500 text-white font-medium transition-all duration-300 disabled:opacity-50"
                        >
                            {submitting ? "در حال ارسال..." : "ارسال نظر"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}