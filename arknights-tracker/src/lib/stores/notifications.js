import { writable } from "svelte/store";

export const notifications = writable([]);

export function addNotification(type, message, durationOrSubtitle = 4000, action = null) {
    const id = Math.random().toString(36).substring(2, 9) + Date.now();

    let duration = 4000;
    let subtitle = null;
    let finalAction = action;

    if (typeof durationOrSubtitle === "number") {
        duration = durationOrSubtitle;
    } else if (typeof durationOrSubtitle === "string" && durationOrSubtitle) {
        if (/^\d+$/.test(durationOrSubtitle)) {
            const parsed = parseInt(durationOrSubtitle, 10);
            if (parsed > 1000) {
                duration = parsed;
            } else {
                subtitle = durationOrSubtitle;
                duration = 5000;
            }
        } else {
            subtitle = durationOrSubtitle;
        }
    } else if (typeof durationOrSubtitle === "object" && durationOrSubtitle !== null) {
        duration = durationOrSubtitle.duration ?? 4000;
        subtitle = durationOrSubtitle.subtitle ?? null;
        finalAction = durationOrSubtitle.action ?? action;
    }

    const newNotification = {
        id,
        type,
        message,
        subtitle,
        duration,
        action: finalAction,
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
