import { writable } from "svelte/store";

export const isSearchModalOpen = writable<boolean>(false);

export function openSearchModal(): void {
    isSearchModalOpen.set(true);
}

export function closeSearchModal(): void {
    isSearchModalOpen.set(false);
}

export function toggleSearchModal(): void {
    isSearchModalOpen.update(v => !v);
}

