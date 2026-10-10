import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";

export default function AdminLayout() {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    async function handleSignOut() {
        await signOut();
        navigate("/Marketing-Website/admin/login", { replace: true });
    }

    const linkClass = ({ isActive }) =>
        `block px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
            isActive
                ? "bg-orange-600 text-white shadow shadow-orange-500/40"
                : "text-[#7A6960] hover:bg-[#FEEBDD]"
        }`;

    return (
        <div
            dir="rtl"
            className="min-h-screen flex secondary-font"
            style={{
                background:
                    "linear-gradient(160deg, #FFF8F3 0%, #FFF3EA 100%)"
            }}
        >
            <aside className="w-64 border-l border-[#F0DCC9] p-5 flex flex-col bg-white/60">
                <div className="mb-8 px-2">
                    <h2 className="text-[#7A6960] text-lg font-semibold">
                        پنل مدیریت
                    </h2>

                    <p className="text-xs text-[#B5A79B] mt-0.5">
                        خوش آمدید
                    </p>
                </div>

                <nav className="space-y-1.5 flex-1">
                    <NavLink
                        to="/Marketing-Website/admin/analytics"
                        className={linkClass}
                    >
                        تحلیل رفتار کاربران
                    </NavLink>

                    <NavLink
                        to="/Marketing-Website/admin/blog"
                        className={linkClass}
                    >
                        مدیریت بلاگ
                    </NavLink>

                    <NavLink
                        to="/Marketing-Website/admin/messages"
                        className={linkClass}
                    >
                        پیام‌های تماس
                    </NavLink>
                </nav>

                <button
                    onClick={handleSignOut}
                    className="mt-6 px-4 py-2.5 rounded-2xl text-sm font-medium text-red-400 hover:bg-red-50 text-right transition"
                >
                    خروج
                </button>
            </aside>

            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}