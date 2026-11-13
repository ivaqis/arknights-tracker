import { writable } from "svelte/store";

export const activeBannerModalData = writable<any | null>(null);

export function openBannerModal(data: any): void {
    if (data) {
        activeBannerModalData.set(data);
    }
}

export function closeBannerModal(): void {
    activeBannerModalData.set(null);
}

