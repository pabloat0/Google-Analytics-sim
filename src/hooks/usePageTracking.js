import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../lib/analytics";

export default function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        // صفحات پنل ادمین ردیابی نمی‌شن، چون فقط رفتار بازدیدکننده‌های عادی سایت مهمه
        if (location.pathname.includes("/admin")) return;

        const finish = trackPageView(location.pathname);

        const handleUnload = () => finish();
        window.addEventListener("beforeunload", handleUnload);

        return () => {
            finish();
            window.removeEventListener("beforeunload", handleUnload);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);
}