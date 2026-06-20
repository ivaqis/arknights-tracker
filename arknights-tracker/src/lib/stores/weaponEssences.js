// src/lib/stores/weaponEssences.js

import { writable } from 'svelte/store';

const isBrowser = typeof window !== 'undefined';
const storedEssences = isBrowser ? localStorage.getItem('weaponEssencesByAccount') : null;
const initialEssences = storedEssences ? JSON.parse(storedEssences) : {};

export const weaponEssences = writable(initialEssences);

if (isBrowser) {
    weaponEssences.subscribe(value => {
        localStorage.setItem('weaponEssencesByAccount', JSON.stringify(value));
    });
}
