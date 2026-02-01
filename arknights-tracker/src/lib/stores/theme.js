// src/lib/stores/theme.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// 1. ЖЕСТКО ставим false. Игнорируем localStorage и системные настройки.
const initialValue = false;

export const isDarkMode = writable(initialValue);

// 2. Эта часть кода принудительно удалит класс 'dark' с html тега при загрузке
if (browser) {
    isDarkMode.subscribe((value) => {
        if (value) {
            document.documentElement.classList.add('dark');
        } else {
            // Гарантированно удаляем класс, даже если он там застрял
            document.documentElement.classList.remove('dark');
            // Можно даже очистить сохранение, чтобы в будущем не мешало
            localStorage.removeItem('theme'); 
        }
    });
}