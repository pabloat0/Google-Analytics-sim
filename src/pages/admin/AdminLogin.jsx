import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";

export default function AdminLogin() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const redirectTo = location.state?.from?.pathname || "/Marketing-Website/admin";

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);
        if (error) {
            setError("ایمیل یا رمز عبور اشتباه است.");
            return;
        }
        navigate(redirectTo, { replace: true });
    }

    return (
        <div
            dir="rtl"
            className="min-h-screen flex items-center justify-center px-4 secondary-font"
            style={{ background: "linear-gradient(135deg, #FFF3EA 0%, #FDE9DD 100%)" }}
        >
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-lg border border-[#F5DFCF]"
            >
                <div className="text-center mb-6">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#FEEBDD] flex items-center justify-center">
                        <span className="text-2xl">🔐</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-[#7A6960]">ورود ادمین</h1>
                    <p className="text-sm text-[#B5A79B] mt-1">به پنل مدیریت خوش آمدید</p>
                </div>

                <label className="block text-sm text-[#7A6960] mb-1 font-medium">ایمیل</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-4 px-4 py-2.5 rounded-2xl bg-[#FFF8F3] text-[#7A6960] border border-[#F0DCC9] focus:outline-none focus:border-[#EE7540] focus:ring-2 focus:ring-[#EE7540]/20 transition"
                />

                <label className="block text-sm text-[#7A6960] mb-1 font-medium">رمز عبور</label>
                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-5 px-4 py-2.5 rounded-2xl bg-[#FFF8F3] text-[#7A6960] border border-[#F0DCC9] focus:outline-none focus:border-[#EE7540] focus:ring-2 focus:ring-[#EE7540]/20 transition"
                />

                {error && (
                    <p className="text-red-400 text-sm mb-4 text-center bg-red-50 rounded-xl py-2">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-3xl bg-orange-600 hover:bg-orange-500 hover:shadow hover:shadow-orange-500 text-white font-medium transition-all duration-300 disabled:opacity-50"
                >
                    {loading ? "در حال ورود..." : "ورود"}
                </button>
            </form>
        </div>
    );
}