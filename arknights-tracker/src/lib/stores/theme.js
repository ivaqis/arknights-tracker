// src/lib/stores/theme.js
/*import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const initialValue = false;

export const isDarkMode = writable(initialValue);

if (browser) {
    isDarkMode.subscribe((value) => {
        if (value) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.removeItem('theme'); 
        }
    });
}*/

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const defaultValue = true;
const initialValue = browser
    ? localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    : defaultValue;

export const isDarkMode = writable(initialValue);