import React, { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { supabase } from "../../lib/supabaseClient";

const RANGE_OPTIONS = [
    { value: 1, label: "امروز" },
    { value: 7, label: "۷ روز اخیر" },
    { value: 30, label: "۳۰ روز اخیر" },
];

function StatCard({ label, value }) {
    return (
        <div className="bg-white rounded-3xl border border-[#F0DCC9] p-5 shadow-sm">
            <p className="text-[#B5A79B] text-sm mb-1">{label}</p>
            <p className="text-[#7A6960] text-2xl font-semibold">{value}</p>
        </div>
    );
}

function ChartCard({ title, children }) {
    return (
        <div className="bg-white rounded-3xl border border-[#F0DCC9] p-5 shadow-sm">
            <h2 className="text-[#7A6960] font-semibold mb-4">{title}</h2>
            {children}
        </div>
    );
}

export default function AnalyticsDashboard() {
    const [rangeDays, setRangeDays] = useState(7);
    const [pageViews, setPageViews] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            const since = new Date();
            since.setDate(since.getDate() - rangeDays);

            const [{ data: pv }, { data: ev }] = await Promise.all([
                supabase
                    .from("page_views")
                    .select("path, duration_seconds, created_at, session_id")
                    .gte("created_at", since.toISOString()),
                supabase
                    .from("events")
                    .select("event_name, created_at")
                    .gte("created_at", since.toISOString()),
            ]);

            if (!cancelled) {
                setPageViews(pv || []);
                setEvents(ev || []);
                setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [rangeDays]);

    const stats = useMemo(() => {
        const totalViews = pageViews.length;
        const uniqueSessions = new Set(pageViews.map((v) => v.session_id)).size;
        const durations = pageViews
            .map((v) => v.duration_seconds)
            .filter((d) => typeof d === "number" && d > 0);
        const avgDuration = durations.length
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : 0;
        return { totalViews, uniqueSessions, avgDuration };
    }, [pageViews]);

    const viewsByDay = useMemo(() => {
        const map = {};
        pageViews.forEach((v) => {
            const day = v.created_at.slice(0, 10);
            map[day] = (map[day] || 0) + 1;
        });
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, count]) => ({ day, count }));
    }, [pageViews]);

    const topPages = useMemo(() => {
        const map = {};
        pageViews.forEach((v) => {
            map[v.path] = (map[v.path] || 0) + 1;
        });
        return Object.entries(map)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([path, count]) => ({ path, count }));
    }, [pageViews]);

    const topEvents = useMemo(() => {
        const map = {};
        events.forEach((e) => {
            map[e.event_name] = (map[e.event_name] || 0) + 1;
        });
        return Object.entries(map)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([event_name, count]) => ({ event_name, count }));
    }, [events]);

    return (
        <div dir="rtl" className="secondary-font">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-[#7A6960]">
                    تحلیل رفتار کاربران
                </h1>
                <select
                    value={rangeDays}
                    onChange={(e) => setRangeDays(Number(e.target.value))}
                    className="bg-white border border-[#F0DCC9] text-[#7A6960] rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-[#EE7540]"
                >
                    {RANGE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p className="text-[#B5A79B]">در حال بارگذاری آمار...</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <StatCard label="کل بازدیدها" value={stats.totalViews} />
                        <StatCard label="بازدیدکننده یکتا" value={stats.uniqueSessions} />
                        <StatCard
                            label="میانگین مدت حضور"
                            value={`${stats.avgDuration} ثانیه`}
                        />
                    </div>

                    <div className="mb-6">
                        <ChartCard title="روند بازدید صفحات">
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={viewsByDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0DCC9" />
                                    <XAxis dataKey="day" stroke="#B5A79B" fontSize={12} />
                                    <YAxis stroke="#B5A79B" fontSize={12} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#FFF8F3",
                                            border: "1px solid #F0DCC9",
                                            borderRadius: "12px",
                                        }}
                                        labelStyle={{ color: "#7A6960" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#EE7540"
                                        strokeWidth={2.5}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="پرطرفدارترین صفحات">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={topPages} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0DCC9" />
                                    <XAxis type="number" stroke="#B5A79B" fontSize={12} allowDecimals={false} />
                                    <YAxis
                                        type="category"
                                        dataKey="path"
                                        stroke="#B5A79B"
                                        fontSize={11}
                                        width={110}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#FFF8F3",
                                            border: "1px solid #F0DCC9",
                                            borderRadius: "12px",
                                        }}
                                        labelStyle={{ color: "#7A6960" }}
                                    />
                                    <Bar dataKey="count" fill="#F4A96B" radius={[0, 10, 10, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="پرکلیک‌ترین دکمه‌ها">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={topEvents} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0DCC9" />
                                    <XAxis type="number" stroke="#B5A79B" fontSize={12} allowDecimals={false} />
                                    <YAxis
                                        type="category"
                                        dataKey="event_name"
                                        stroke="#B5A79B"
                                        fontSize={11}
                                        width={110}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#FFF8F3",
                                            border: "1px solid #F0DCC9",
                                            borderRadius: "12px",
                                        }}
                                        labelStyle={{ color: "#7A6960" }}
                                    />
                                    <Bar dataKey="count" fill="#EE9B6B" radius={[0, 10, 10, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                </>
            )}
        </div>
    );
}