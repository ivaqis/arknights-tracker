import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Изначально берем из localStorage, если мы в браузере
const initialUid = browser ? localStorage.getItem("user_uid") : null;

export const currentUid = writable(initialUid);

// Подписываемся: при изменении стора - пишем в localStorage
if (browser) {
    currentUid.subscribe(val => {
        if (val) localStorage.setItem("user_uid", val);
        else localStorage.removeItem("user_uid");
    });
}