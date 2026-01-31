// src/lib/stores/auth.js
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { accountStore } from './accounts'; // Импортируем стор аккаунтов

// Изначально пробуем взять из текущего выбранного аккаунта, если нет - из localStorage (для совместимости)
const getInitialUid = () => {
    if (!browser) return null;
    
    // 1. Пробуем получить из метаданных аккаунта
    const accUid = accountStore.getCurrentServerUid();
    if (accUid) return accUid;

    // 2. Фолбэк на старый метод (если миграция еще не прошла)
    return localStorage.getItem("user_uid");
};

export const currentUid = writable(getInitialUid());

if (browser) {
    // 1. Слушаем изменения самого currentUid (как и раньше)
    currentUid.subscribe(val => {
        if (val) localStorage.setItem("user_uid", val);
        else localStorage.removeItem("user_uid");
    });

    // 2. [ВАЖНО] Слушаем переключение аккаунтов
    // Когда меняется выбранный аккаунт, мы должны обновить currentUid
    accountStore.selectedId.subscribe(() => {
        const serverUid = accountStore.getCurrentServerUid();
        
        // Если у этого аккаунта есть сохраненный серверный UID - ставим его
        if (serverUid) {
            currentUid.set(serverUid);
        } else {
            // Если нет (новый аккаунт или еще не импортирован), генерируем или сбрасываем
            // Лучше сгенерировать новый локальный UUID, чтобы не смешивать данные
            // Но пока можно просто очистить, и компоненты сами сгенерируют временный
            currentUid.set(null); 
            // Или можно оставить старый user_uid из localStorage, но это рискованно. 
            // Лучше null, чтобы RatingCard показал "Импортируйте данные".
        }
    });
}