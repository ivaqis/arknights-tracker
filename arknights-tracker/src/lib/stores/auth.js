import { writable } from 'svelte/store';

// Изначально null. Мы ждем, пока accounts.js скажет нам, кто мы.
export const currentUid = writable(null);