import { writable } from "svelte/store";

export const selectedItemId = writable<string | null>(null);

export function openItemModal(id: string): void {
    if (id) {
        selectedItemId.set(id);
    }
}

export function closeItemModal(): void {
    selectedItemId.set(null);
}
