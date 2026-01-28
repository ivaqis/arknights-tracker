// src/lib/utils/importUtils.js
import { characters } from "$lib/data/characters";
import { weapons } from "$lib/data/weapons";
import { banners } from "$lib/data/banners";

const normalize = (str) => {
    if (!str || typeof str !== 'string') return "";
    return str.toLowerCase().replace(/[^a-z0-9]/g, ""); // [Fix] Более надежная нормализация
};

// Сортировка: Время -> seqId
const sortPulls = (a, b) => {
    const timeDiff = a.time.getTime() - b.time.getTime();
    if (timeDiff !== 0) return timeDiff; 
    return (a.seqId || 0) - (b.seqId || 0);
};

export function getInternalBannerType(rawId) {
    // Если ID нет — по дефолту стандарт (персонажей)
    if (!rawId) return 'standard';
    
    const id = String(rawId).toLowerCase().trim();

    // ============================================================
    // 1. САМЫЙ ГЛАВНЫЙ ПРИОРИТЕТ: ОРУЖИЕ
    // ============================================================
    // Любой намек на оружие должен возвращать "сырой" ID, 
    // чтобы не смешивать гаранты.
    // Проверяем: 'weapon', 'wepon' (опечатка разрабов), 'constant' (стандарт оружка)
    if (
        id.includes('weapon') || 
        id.includes('wepon') || 
        id.includes('constant') || 
        id.includes('scathe') // На всякий случай, имя пушки в ID
    ) {
        return rawId; // Возвращаем: weaponbox_constant_2
    }

    // ============================================================
    // 2. ПЕРСОНАЖИ (Только если это НЕ оружие)
    // ============================================================
    
    // Новичок
    if (id === '2' || id.includes('beginner') || id.includes('new') || id.includes('novice')) {
        return 'new-player';
    }
    
    // Стандарт Персонажей
    // ВАЖНО: Сюда мы доходим, только если проверка на оружие выше НЕ сработала.
    // Поэтому слово 'standard' тут безопасно.
    if (id === '1' || id.includes('standard') || id.includes('permanent')) {
        return 'standard';
    }

    // Все остальное — Ивент Персонажей
    return 'special';
}

// Хелпер для интерфейса (RatingCard): 
// Помогает понять, в какую вкладку ("Standard Weapon" или "Event Weapon") засунуть этот ID
export function getWeaponCategory(bannerId) {
    if (!bannerId) return 'other';
    const id = String(bannerId).toLowerCase();

    // Если ID содержит 'constant' или ('standard' И 'weapon') -> Вкладка Standard Weapon
    if (id.includes('constant') || (id.includes('standard') && id.includes('weapon'))) {
        return 'weap-standard';
    }

    // Если ID содержит 'wepon' или ('special' И 'weapon') -> Вкладка Event Weapon
    if (id.includes('wepon') || (id.includes('special') && id.includes('weapon'))) {
        return 'weap-special';
    }

    return 'other';
}

/**
 * ПАРСИНГ ЛОГОВ
 */
export function parseGachaLog(list) {
    if (!Array.isArray(list)) throw new Error("Invalid data: expected an array");
    if (list.length === 0) throw new Error("No data found");

    const parsedList = list.map((item, i) => {
        // [ИЗМЕНЕНО] Добавлена поддержка weaponName
        const rawName = item.name || item.charName || item.weaponName || item.character || item.item_name;
        
        const rarity = Number(item.rarity || item.rank || item.rank_type);
        const seqId = Number(item.seqId || item.sequence || 0);
        
        // Читаем поле isNew
        const isNew = item.isNew === true || item.isNew === "true" || item.is_new === true;

        // Время
        let dateObj;
        if (item.gachaTs) dateObj = new Date(Number(item.gachaTs)); 
        else if (item.ts) dateObj = new Date(Number(item.ts) * 1000);
        else if (item.time) dateObj = new Date(item.time);
        else dateObj = new Date(0);
        
        const rawBannerId = item.bannerId || item.poolId || item.pool || item.gacha_type;

        if (!rawName) throw new Error(`Item #${i} has no name.`);
        if (!rarity || isNaN(rarity)) throw new Error(`Item #${i} has invalid rarity.`);

        const internalId = getInternalBannerType(rawBannerId);
        
        // Определяем тип предмета (Weapon или Character) для фильтрации в будущем
        const itemType = item.weaponName ? 'weapon' : 'character';
        let uniqueId = item.id;
        if (!uniqueId) {
            if (seqId !== 0) {
                uniqueId = `${dateObj.getTime()}_${rawName}_${seqId}`;
            } else {
                uniqueId = `${dateObj.getTime()}_${rawName}_idx${i}`;
            }
        }

        return {
            id: uniqueId,
            time: dateObj,
            name: rawName,
            rarity: rarity,
            bannerId: internalId,
            seqId: seqId,
            isNew: isNew,
            type: itemType,
            rawPoolId: rawBannerId
        };
    });

    return parsedList.sort(sortPulls);
}

export function mergePulls(oldList, newList) {
    const map = new Map();
    // Сеттим по ID. Если ID теперь стабильный, дубликаты перезапишутся
    oldList.forEach(p => map.set(p.id, p));
    newList.forEach(p => map.set(p.id, p));
    return Array.from(map.values()).sort(sortPulls);
}

export function calculatePity(pulls, bannerId) {
    const isSpecial = bannerId?.includes('special');
    let pityCounter = 0;
    
    return pulls.map((pull, index) => {
        const isFreePull = isSpecial && (index >= 30 && index < 40);

        if (!isFreePull) pityCounter++;
        
        if (pull.rarity === 6) {
            const resultPity = pityCounter;
            pityCounter = 0; 
            return { ...pull, pity: resultPity, isFree: isFreePull };
        }

        return { ...pull, pity: pityCounter, isFree: isFreePull };
    });
}

export function calculateBannerStats(pulls, bannerId) {
    // 1. Ищем конфиг баннера
    let bannerConfig = banners.find(b => b.id === bannerId);
    if (!bannerConfig) {
         if (bannerId.includes('new')) bannerConfig = banners.find(b => b.type === 'new-player');
         else if (bannerId.includes('special')) bannerConfig = banners.find(b => b.type === 'special');
         else bannerConfig = banners.find(b => b.type === 'standard');
    }

    const featured6 = bannerConfig?.featured6 || [];
    
    // Определяем типы баннеров
    // Ивентовое оружие: есть 'weapon'/'wepon', но НЕТ 'constant'
    const isEventWeapon = (bannerId.includes('weap') || bannerId.includes('wepon')) && !bannerId.includes('constant');
    
    // Ивентовый персонаж: есть 'special' (и это не оружие)
    const isEventChar = bannerId.includes('special') && !isEventWeapon;
    
    // Общий флаг "Есть ли механика гаранта?"
    const hasGuaranteeSystem = isEventChar || isEventWeapon;

    let total = pulls.length;
    let count6 = 0;
    let count5 = 0;
    let sumPity6 = 0;
    let sumPity5 = 0;
    let won5050 = 0;
    let total5050 = 0;
    let last6WasFeatured = true; 
    let hasReceivedRateUp = false;
    let currentPity6 = 0;
    let currentPity5 = 0;
    let guarantee120 = 0; 

    pulls.forEach((pull, index) => {
        const itemName = normalize(pull.name);
        // Бесплатные крутки новичка обычно не сбивают счетчики, но тут зависит от игры.
        // Оставим проверку isSpecial для флага freePull, чтобы на стандарте не ломалось.
        const isFreePull = hasGuaranteeSystem && (index >= 30 && index < 40);

        if (pull.rarity === 6) {
            count6++;
            sumPity6 += currentPity6 + (isFreePull ? 0 : 1); 

            // Проверяем на Rate-Up
            const isFeatured = featured6.some(fid => {
                const c = characters[fid];
                if (c && normalize(c.name) === itemName) return true;
                const w = weapons[fid];
                if (w && normalize(w.name) === itemName) return true;
                return false;
            });

            if (last6WasFeatured) {
                total5050++;
                if (isFeatured) won5050++;
            }
            last6WasFeatured = isFeatured;
            currentPity6 = 0;

            // --- ЛОГИКА ГАРАНТА (RATE-UP) ---
            if (hasGuaranteeSystem) {
                if (isFeatured) {
                    // Выиграли Rate-Up -> Сброс
                    guarantee120 = 0;
                    // Для оружия ставим галочку "Получено", чтобы остановить счетчик навсегда
                    // Для персонажей тоже ставим (для UI), но счетчик продолжит работать (см. ниже)
                    hasReceivedRateUp = true; 
                } else {
                    // Проиграли 50/50
                    if (!isFreePull) {
                        // [FIX] Логика счетчика:
                        // Если это Персонаж -> Всегда увеличиваем (циклично)
                        // Если это Оружие -> Увеличиваем ТОЛЬКО если еще не получали (1 раз)
                        if (isEventChar) {
                             guarantee120++;
                        } else if (isEventWeapon && !hasReceivedRateUp) {
                             guarantee120++;
                        }
                    }
                }
            }
        } else {
            // Если выпало 3/4/5*
            if (!isFreePull) {
                currentPity6++;
                
                // Инкремент гаранта за пустую крутку
                if (hasGuaranteeSystem) {
                    // [FIX] Та же логика: Персонаж всегда копит, Оружие только до первого получения
                    if (isEventChar) {
                         guarantee120++;
                    } else if (isEventWeapon && !hasReceivedRateUp) {
                         guarantee120++;
                    }
                }
            }
        }

        if (pull.rarity === 5) {
            count5++;
            sumPity5 += currentPity5 + (isFreePull ? 0 : 1);
            currentPity5 = 0;
        } else {
            if (!isFreePull) currentPity5++;
        }
    });

    return {
        total,
        pity6: currentPity6,
        pity5: currentPity5,
        // Возвращаем гарант только если система активна.
        // Для Стандартного оружия (weapon_constant) hasGuaranteeSystem = false, поэтому вернется 0.
        guarantee120: hasGuaranteeSystem ? guarantee120 : 0,
        hasReceivedRateUp,
        count6,
        count5,
        avg6: count6 ? (sumPity6 / count6).toFixed(1) : "0.0",
        avg5: count5 ? (sumPity5 / count5).toFixed(1) : "0.0",
        percent6: total ? ((count6 / total) * 100).toFixed(2) : "0.00",
        percent5: total ? ((count5 / total) * 100).toFixed(2) : "0.00",
        winRate: {
            won: won5050,
            total: total5050,
            percent: total5050 ? ((won5050 / total5050) * 100).toFixed(0) : 0
        }
    };
}

/**
 * ВАЛИДАЦИЯ ЦЕЛОСТНОСТИ АККАУНТА
 * Проверяет, не пытаемся ли мы загрузить данные от другого аккаунта.
 * Логика: Если новые крутки попадают во временной диапазон, где у нас УЖЕ есть данные,
 * но при этом эти новые крутки НЕ являются дубликатами существующих (ID не совпадают),
 * значит это другой аккаунт.
 */
export function validateAccountConsistency(existingPulls, newPulls) {
    if (!existingPulls.length || !newPulls.length) return;

    // 1. Определяем временные границы НОВЫХ данных
    // Сортируем новые, чтобы найти min и max время
    const sortedNew = [...newPulls].sort((a, b) => a.time - b.time);
    const minNewTime = sortedNew[0].time.getTime();
    const maxNewTime = sortedNew[sortedNew.length - 1].time.getTime();

    // 2. Ищем существующие крутки, которые попадают в этот диапазон
    // (плюс/минус небольшая погрешность, если нужно, но пока строго)
    const overlaps = existingPulls.filter(p => {
        const t = p.time.getTime();
        return t >= minNewTime && t <= maxNewTime;
    });

    // Если нет пересечений по времени, значит данные "до" или "после" текущих.
    // Это нормально (например, докрутил баннер).
    if (overlaps.length === 0) return;

    // 3. Если пересечение есть, проверяем "родство".
    // Хотя бы одна крутка из newPulls должна совпадать по ID с круткой из overlaps.
    // Если мы загружаем тот же файл или обновленный файл того же аккаунта,
    // там обязательно будут дубликаты.
    
    // Создаем Set из ID существующих круток в этом диапазоне
    const existingIdsInrange = new Set(overlaps.map(p => p.id));

    let hasMatch = false;
    for (const p of sortedNew) {
        if (existingIdsInrange.has(p.id)) {
            hasMatch = true;
            break;
        }
    }

    // 4. ВЕРДИКТ
    // У нас есть данные за этот период, но ни одна новая крутка не совпала с существующими.
    // Значит, это история другого игрока за то же время.
    if (!hasMatch) {
        const startDate = new Date(minNewTime).toLocaleDateString();
        const endDate = new Date(maxNewTime).toLocaleDateString();
        throw new Error(
            `Account Mismatch! You already have history between ${startDate} and ${endDate}, but the imported data differs completely. Please check if you selected the correct account.`
        );
    }
}