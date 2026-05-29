import { writable } from "svelte/store";

export const notifications = writable([]);

export function addNotification(type, message, durationOrSubtitle = 4000) {
    const id = Math.random().toString(36).substring(2, 9) + Date.now();

    let duration = 4000;
    let subtitle = null;

    if (typeof durationOrSubtitle === "number") {
        duration = durationOrSubtitle;
    } else if (typeof durationOrSubtitle === "string" && durationOrSubtitle) {
        if (/^\d+$/.test(durationOrSubtitle)) {
            const parsed = parseInt(durationOrSubtitle, 10);
            if (parsed > 1000) {
                duration = parsed;
            } else {
                subtitle = durationOrSubtitle;
                duration = 5000; // Default auto-close duration for subtitles like "500"
            }
        } else {
            subtitle = durationOrSubtitle;
        }
    }

    const newNotification = {
        id,
        type, // 'success' | 'error' | 'warning' | 'info'
        message,
        subtitle,
        duration,
    };

    notifications.update((all) => [...all, newNotification]);

    if (duration > 0) {
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    }

    return id;
}

export function removeNotification(id) {
    notifications.update((all) => all.filter((n) => n.id !== id));
}
