import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

function slugify(title) {
    return title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 80);
}

export default function BlogEditor() {
    const { id } = useParams();
    const isNew = !id || id === "new";
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [slugEditedManually, setSlugEditedManually] = useState(false);
    const [content, setContent] = useState("");
    const [coverImageUrl, setCoverImageUrl] = useState("");
    const [coverImageAlt, setCoverImageAlt] = useState("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [status, setStatus] = useState("draft");
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isNew) return;
        supabase
            .from("posts")
            .select("*")
            .eq("id", id)
            .single()
            .then(({ data }) => {
                if (data) {
                    setTitle(data.title);
                    setSlug(data.slug);
                    setSlugEditedManually(true); // مقاله‌ی موجود، دیگه خودکار عوض نشه
                    setContent(data.content);
                    setCoverImageUrl(data.cover_image_url || "");
                    setCoverImageAlt(data.cover_image_alt || "");
                    setMetaTitle(data.meta_title || "");
                    setMetaDescription(data.meta_description || "");
                    setStatus(data.status);
                }
                setLoading(false);
            });
    }, [id, isNew]);

    function handleTitleChange(value) {
        setTitle(value);
        // فقط اگه کاربر خودش دستی لینک رو عوض نکرده، خودکار از عنوان بسازیم
        if (!slugEditedManually) {
            setSlug(slugify(value));
        }
    }

    function handleSlugChange(value) {
        setSlugEditedManually(true);
        setSlug(slugify(value));
    }

    async function handleSave(e) {
        e.preventDefault();
        setError("");

        if (!slug) {
            setError("لینک مقاله نمی‌تواند خالی باشد.");
            return;
        }

        setSaving(true);

        const payload = {
            title,
            slug,
            content,
            cover_image_url: coverImageUrl || null,
            cover_image_alt: coverImageAlt || null,
            meta_title: metaTitle || null,
            meta_description: metaDescription || null,
            status,
            updated_at: new Date().toISOString(),
        };

        let result;
        if (isNew) {
            result = await supabase.from("posts").insert(payload);
        } else {
            result = await supabase.from("posts").update(payload).eq("id", id);
        }

        setSaving(false);
        if (result.error) {
            if (result.error.code === "23505") {
                setError("این لینک قبلاً برای یک مقاله‌ی دیگر استفاده شده. لینک دیگری انتخاب کنید.");
            } else {
                setError("ذخیره‌سازی با خطا مواجه شد: " + result.error.message);
            }
            return;
        }
        navigate("/Marketing-Website/admin/blog");
    }

    if (loading) return <p className="text-[#B5A79B] secondary-font">در حال بارگذاری...</p>;

    const inputClass =
        "w-full px-4 py-2.5 rounded-2xl bg-[#FFF8F3] text-[#7A6960] border border-[#F0DCC9] focus:outline-none focus:border-[#EE7540] focus:ring-2 focus:ring-[#EE7540]/20 transition";
    const labelClass = "block text-sm text-[#7A6960] mb-1 font-medium";

    return (
        <div dir="rtl" className="max-w-2xl secondary-font">
            <h1 className="text-2xl font-semibold text-[#7A6960] mb-6">
                {isNew ? "مقاله جدید" : "ویرایش مقاله"}
            </h1>

            <form
                onSubmit={handleSave}
                className="bg-white border border-[#F0DCC9] rounded-3xl p-6 shadow-sm space-y-4"
            >
                <div>
                    <label className={labelClass}>عنوان</label>
                    <input
                        required
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>لینک مقاله (URL)</label>
                    <div className="flex items-center gap-1 text-sm text-[#B5A79B] mb-1" dir="ltr">
                        <span>/blog/</span>
                        <span className="text-[#7A6960] font-medium">{slug || "..."}</span>
                    </div>
                    <input
                        required
                        dir="ltr"
                        value={slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className={inputClass}
                        placeholder="my-post-slug"
                    />
                    <p className="text-xs text-[#B5A79B] mt-1">
                        فقط حروف انگلیسی/فارسی، عدد و خط تیره؛ فاصله‌ها خودکار به خط تیره تبدیل می‌شوند.
                    </p>
                </div>

                <div>
                    <label className={labelClass}>آدرس تصویر کاور (اختیاری)</label>
                    <input
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        placeholder="https://..."
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>متن جایگزین تصویر (ALT)</label>
                    <input
                        value={coverImageAlt}
                        onChange={(e) => setCoverImageAlt(e.target.value)}
                        placeholder="مثلاً: تیم طراحی در حال جلسه"
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>متن مقاله</label>
                    <textarea
                        required
                        rows={12}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={inputClass}
                    />
                    <div className="text-xs text-[#B5A79B] mt-2 bg-[#FFF3EA] rounded-2xl p-3 leading-relaxed">
                        <p className="font-medium text-[#7A6960] mb-1">راهنمای نشانه‌گذاری:</p>
                        <p><code># عنوان</code> → تیتر بزرگ (H1)</p>
                        <p><code>## عنوان</code> → تیتر متوسط (H2)</p>
                        <p><code>### عنوان</code> → تیتر کوچک (H3)</p>
                        <p><code>[متن لینک](https://example.com)</code> → لینک‌سازی</p>
                        <p>برای پاراگراف جدید، یک خط خالی بین متن‌ها بگذارید.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-2 border-t border-[#F5EBDF]">
                    <p className="text-sm font-semibold text-[#7A6960] -mb-1">تنظیمات سئو (اختیاری)</p>

                    <div>
                        <label className={labelClass}>متا تایتل</label>
                        <input
                            value={metaTitle}
                            onChange={(e) => setMetaTitle(e.target.value)}
                            placeholder="اگر خالی بماند، از عنوان مقاله استفاده می‌شود"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>متا دیسکریپشن</label>
                        <textarea
                            rows={2}
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            placeholder="توضیح کوتاهی که زیر لینک در نتایج گوگل نمایش داده می‌شود"
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>وضعیت</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={inputClass + " w-auto"}
                    >
                        <option value="draft">پیش‌نویس</option>
                        <option value="published">منتشرشده</option>
                    </select>
                </div>

                {error && (
                    <p className="text-red-400 text-sm bg-red-50 rounded-xl py-2 px-3">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 hover:shadow hover:shadow-orange-500 text-white font-medium transition-all duration-300 disabled:opacity-50"
                    >
                        {saving ? "در حال ذخیره..." : "ذخیره"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/Marketing-Website/admin/blog")}
                        className="px-5 py-2.5 rounded-2xl bg-[#FFF3EA] hover:bg-[#FDE9DD] text-[#7A6960] font-medium transition"
                    >
                        انصراف
                    </button>
                </div>
            </form>
        </div>
    );
}