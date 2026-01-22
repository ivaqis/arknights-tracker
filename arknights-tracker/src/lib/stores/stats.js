import { derived } from 'svelte/store';
import { pullData } from './pulls';

// Константы для расчета удачи (примерные)
const AVERAGE_PITY_6 = 34.5; // Среднее кол-во круток на легу в гачах с шансом 2%
const AVERAGE_PITY_5 = 10;   // Среднее для 5*

export const pullStats = derived(pullData, ($pullData) => {
    let totalPulls = 0;
    let total6 = 0;
    let total5 = 0;
    
    // Для 50/50
    let win5050 = 0;
    let lose5050 = 0;
    
    // Для расчета удачи (сумма pity, на которых выпали)
    let sumPity6 = 0;
    let sumPity5 = 0;
    let count6_for_luck = 0;
    let count5_for_luck = 0;

    // Проходим по всем баннерам
    Object.values($pullData).forEach(banner => {
        totalPulls += banner.total || 0;
        
        // Анализируем список круток
        (banner.pulls || []).forEach(pull => {
            if (pull.rarity === 6) {
                total6++;
                if (pull.pity) {
                    sumPity6 += pull.pity;
                    count6_for_luck++;
                }

                // Логика 50/50 (Упрощенная: если isGuaranteed=false и выпал rateUp, то win)
                // Для этого в pull нужно хранить флаги isRateUp и isGuaranteed
                if (pull.isRateUp !== undefined) { 
                    if (pull.isRateUp) win5050++;
                    else lose5050++;
                }
            }
            if (pull.rarity === 5) {
                total5++;
                if (pull.pity) {
                    sumPity5 += pull.pity;
                    count5_for_luck++;
                }
            }
        });
    });

    // --- РАСЧЕТ УДАЧИ (ПРОЦЕНТИЛЬ) ---
    // Формула: (Среднее - Твое) / Разброс... 
    // Упрощенно: если твой avgPity < 34.5, ты удачлив (>50%).
    // Если твой avgPity = 20, это очень круто (Топ 90% удачи).
    
    const myAvg6 = count6_for_luck > 0 ? sumPity6 / count6_for_luck : 0;
    const myAvg5 = count5_for_luck > 0 ? sumPity5 / count5_for_luck : 0;

    // Функция-маппер: переводит AvgPity в "Топ %"
    // Чем меньше Pity, тем выше Luck Percent.
    // 35 pity -> 50% luck. 
    // 1 pity -> 100% luck.
    // 70 pity -> 0% luck.
    const calculateLuckPercent = (avg, standard) => {
        if (avg === 0) return 50; // Нет данных
        // Линейная интерполяция (очень грубая)
        let luck = 50 + (standard - avg) * 2; 
        return Math.min(Math.max(luck, 1), 99).toFixed(0);
    };

    const luck6 = calculateLuckPercent(myAvg6, AVERAGE_PITY_6);
    const luck5 = calculateLuckPercent(myAvg5, AVERAGE_PITY_5);

    return {
        totalPulls,
        total6,
        total5,
        win5050,
        lose5050,
        total5050: win5050 + lose5050,
        luck6, // Число от 1 до 99 (Топ %)
        luck5,
        avgPity6: myAvg6.toFixed(1)
    };
});
