import { supabase } from "./supabaseClient";

const SESSION_KEY = "mw_session_id";

export function getSessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem(SESSION_KEY, id);
        supabase
            .from("sessions")
            .insert({
                session_id: id,
                user_agent: navigator.userAgent,
                referrer: document.referrer || null,
            })
            .then(({ error }) => {
                if (error) console.error("[analytics] session insert failed:", error);
            });
    }
    return id;
}

export function trackPageView(path) {
    const sessionId = getSessionId();
    const startedAt = Date.now();
    const rowId = crypto.randomUUID();
    let finished = false;

    const insertPromise = supabase
        .from("page_views")
        .insert({ id: rowId, session_id: sessionId, path })
        .then(({ error }) => {
            if (error) console.error("[analytics] page_view insert failed:", error);
        });

    return function finish() {
        if (finished) return;
        finished = true;
        const durationSeconds = Math.round((Date.now() - startedAt) / 1000);

        insertPromise.then(() => {
            supabase
                .from("page_views")
                .update({ duration_seconds: durationSeconds })
                .eq("id", rowId)
                .then(({ error }) => {
                    if (error)
                        console.error("[analytics] duration update failed:", error);
                });
        });
    };
}

export function trackEvent(eventName, path = window.location.pathname) {
    const sessionId = getSessionId();
    supabase
        .from("events")
        .insert({ session_id: sessionId, event_name: eventName, path })
        .then(({ error }) => {
            if (error) console.error("[analytics] event insert failed:", error);
        });
}