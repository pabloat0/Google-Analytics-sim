import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function BlogList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from("posts")
            .select("id, slug, title, content, cover_image_url, created_at")
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .then(({ data }) => {
                setPosts(data || []);
                setLoading(false);
            });
    }, []);

    return (
        <div
            dir="rtl"
            className="min-h-screen secondary-font"
            style={{ background: "linear-gradient(160deg, #FFF8F3 0%, #FFF3EA 100%)" }}
        >
            <div className="max-w-5xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-semibold text-[#7A6960] mb-3">وبلاگ</h1>
                    <p className="text-[#B5A79B]">تازه‌ترین مطالب و به‌روزرسانی‌ها</p>
                </div>

                {loading ? (
                    <p className="text-center text-[#B5A79B]">در حال بارگذاری...</p>
                ) : posts.length === 0 ? (
                    <p className="text-center text-[#B5A79B]">هنوز مقاله‌ای منتشر نشده.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                to={`/Marketing-Website/blog/${post.slug}`}
                                className="block bg-white rounded-3xl border border-[#F0DCC9] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                {post.cover_image_url && (
                                    <img
                                        src={post.cover_image_url}
                                        alt={post.title}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-[#7A6960] mb-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-[#B5A79B] text-sm mb-3">
                                        {new Date(post.created_at).toLocaleDateString("fa-IR")}
                                    </p>
                                    <p className="text-[#8C7C6E] text-sm line-clamp-3">
                                        {post.content}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}