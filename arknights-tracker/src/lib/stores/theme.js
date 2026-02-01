// src/lib/stores/theme.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// По умолчанию false (светлая)
const defaultValue = true;

// Пытаемся получить начальное значение
const initialValue = browser
    ? localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    : defaultValue;

export const isDarkMode = writable(initialValue);