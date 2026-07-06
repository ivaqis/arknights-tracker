import { get } from "svelte/store";
import { t, isI18nReady } from "$lib/i18n.js";
import { tags } from "$lib/data/contractTags.js";

const tagIdToKey = {};
const tagIdToBlackboard = {};
const localIdToBlackboard = {};

for (const key in tags) {
    const tag = tags[key];
    const bb = {};
    if (tag && tag.blackboard) {
        for (const item of tag.blackboard) {
            bb[item.key] = item.value;
        }
    }
    localIdToBlackboard[key] = bb;
    if (tag && tag.tagId) {
        tagIdToBlackboard[String(tag.tagId)] = bb;
        tagIdToKey[String(tag.tagId)] = key;
    }
}

export function normalizeContractTagId(id) {
    if (!id) return id;
    const strId = String(id);
    if (tagIdToKey[strId]) {
        return tagIdToKey[strId];
    }
    return id;
}

const VALID_TEXT_ICONS = new Set([
    "ba_airborne",
    "ba_burning",
    "ba_burningonchar",
    "ba_combo",
    "ba_conduct",
    "ba_conductonchar",
    "ba_corrupt",
    "ba_corruptonchar",
    "ba_cross",
    "ba_crush",
    "ba_crystbreak",
    "ba_crystburst",
    "ba_crystenhance",
    "ba_crystinflict",
    "ba_crystvul",
    "ba_enhance",
    "ba_fireburst",
    "ba_fireenhance",
    "ba_fireinflict",
    "ba_firevul",
    "ba_fracture",
    "ba_frozen",
    "ba_frozenonchar",
    "ba_guard",
    "ba_knockdown",
    "ba_naturalburst",
    "ba_naturalenhance",
    "ba_naturalinflict",
    "ba_naturalvul",
    "ba_noguard",
    "ba_physicalenhance",
    "ba_physicalvul",
    "ba_pulseburst",
    "ba_pulseenhance",
    "ba_pulseinflict",
    "ba_pulsevul",
    "ba_slow",
    "ba_speedup",
    "ba_spellenhance",
    "ba_spellvul",
    "ba_vulnerable",
    "ba_weak"
]);

export function parseRichText(text) {
    if (!text) return "";
    const styles = {
        "ba.natur": "text-[#ade131] font-bold", // Природный
        "ba.fire": "text-[#f45511] font-bold", // Огненный
        "ba.cryst": "text-[#08edfb] font-bold", // Кристаллический
        "ba.pulse": "text-[#ffcc00] font-bold", // Электрический
        "ba.phy": "text-[#7d582d] font-bold", // Физический
        "ba.poise": "text-[#ffd399] font-bold", // Ошеломление
        "ba.vup": "text-[#22BBFF] font-bold", // Повышение
        "ba.key": "text-[#00a8ff] font-bold", // Ключевые термины
        "ba.conduct": "text-[#ffcc00] font-bold", // Электризация
        "ba.spelldmg": "text-[#E3BC55] font-bold", // Урон от искусств
        "ba.info": "text-gray-500 dark:text-[#A0A0A0] italic font-normal text-[13px]",
        "ba.heal": "text-[#ade131] font-bold",
        "ba.consume": "text-[#E3BC55] font-bold",
        "ba.noguard": "text-[#e8ceb0] font-bold",
        "ba.crush": "text-[#e8ceb0] font-bold",
        "ba.fracture": "text-[#e8ceb0] font-bold",
        "ba.pd": "text-[#7d582d] font-bold",
        "ba.physicalvul": "text-[#F87171] font-bold",
        "ba.originium": "text-[#ff7100] font-bold",
        "ba.return": "text-[#38BDF8] font-bold",
        "ba.airborne": "text-[#e8ceb0] font-bold",
        "ba.burning": "text-[#f45511] font-bold",
        "ba.naturalinflict": "text-[#ade131] font-bold",
        "ba.corrupt": "text-[#ade131] font-bold",
        "ba.crystbreak": "text-[#f45511] font-bold",
        "ba.crystinflict": "text-[#21C6D0] font-bold",
        "ba.frozen": "text-[#08edfb] font-bold",
        "ba.fireinflict": "text-[#ff8e59] font-bold",
        "ba.knockdown": "text-[#e8ceb0] font-bold",
        "ba.pulseinflict": "text-[#ffcc00] font-bold",
    };

    let html = text.replace(/<([@#])([^>]+)>/g, (match, type, tag) => {
        if (tag === "profile.key") return "<span>";
        let styleClass = styles[tag] || "text-[#E3BC55] font-bold";
        if (type === "#") {
            styleClass +=
                " underline decoration-dashed decoration-current underline-offset-4";
        }
        
        const tagKey = tag.replace(/\./g, '_');
        const showIconPlaceholder = tag !== "ba.info" && tag !== "profile.key" && VALID_TEXT_ICONS.has(tagKey);
        let iconPlaceholder = '';
        if (showIconPlaceholder) {
            const imgName = `icon_term_${tagKey}.png`;
            const imgSrc = `/images/textIcons/${imgName}`;
            iconPlaceholder = `<img src="${imgSrc}" class="w-5 h-5 inline-block align-text-bottom shrink-0 transition-transform duration-200 hover:scale-110" style="display: none;" onload="this.style.display='inline-block'" />`;
        }
        
        return `<span class="rich-term ${styleClass}" data-term-id="${tag}">${iconPlaceholder}`;
    });
    
    html = html.replace(/<\/>/g, "</span>");
    html = html.replace(/\n/g, "<br>");
    return html;
}
let lastTouchTime = 0;
if (typeof window !== 'undefined') {
    window.addEventListener('touchstart', () => {
        lastTouchTime = Date.now();
    }, { passive: true });
}

function isTouchPreventingHover() {
    return Date.now() - lastTouchTime < 1000;
}

export function hyperlinkAction(node) {
    let tooltipEl = null;
    let parentListeners = [];
    let tooltipListeners = [];
    let activeTerm = null;
    let unsubscribeT = null;
    let observer = null;
    let isPinned = false;
    let tooltipStack = [];
    let hideTimeout = null;

    function cleanup() {
        cleanupTooltip();
        parentListeners.forEach(cleanupListener => cleanupListener());
        parentListeners = [];
    }

    function cleanupTooltip() {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
        tooltipListeners.forEach(cleanupListener => cleanupListener());
        tooltipListeners = [];
        if (tooltipEl) {
            tooltipEl.remove();
            tooltipEl = null;
        }
        activeTerm = null;
        isPinned = false;
        tooltipStack = [];
        window.removeEventListener('scroll', cleanupTooltip);
        window.removeEventListener('resize', cleanupTooltip);
        document.removeEventListener('click', handleDocumentClick);
    }

    function handleDocumentClick(e) {
        if (tooltipEl && !tooltipEl.contains(e.target) && e.target !== activeTerm) {
            cleanupTooltip();
        }
    }

    let initTimeout = null;

    function queueInit() {
        if (initTimeout) clearTimeout(initTimeout);
        initTimeout = setTimeout(init, 0);
    }

    function renderStack() {
        if (!tooltipEl || tooltipStack.length === 0) {
            cleanupTooltip();
            return;
        }

        let html = `
            <style>
                .tooltip-history-title:hover {
                    color: #facc15 !important;
                }
                .tooltip-history-title:hover span {
                    opacity: 1 !important;
                }
            </style>
        `;

        tooltipStack.forEach((card, index) => {
            const isLast = index === tooltipStack.length - 1;
            
            html += `<div class="tooltip-card" style="${index > 0 ? 'border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px; margin-top: 8px;' : ''}">`;

            const titleImgName = `icon_term_${card.termId.replace(/\./g, '_')}.png`;
            const titleImgSrc = `/images/textIcons/${titleImgName}`;
            
            let backButtonHtml = '';
            if (isLast && index > 0) {
                backButtonHtml = `
                    <button class="tooltip-back-btn" style="margin-left: auto; background: rgba(255,255,255,0.08); border: none; color: #a1a1aa; font-size: 10px; font-weight: 700; cursor: pointer; padding: 2px 6px; border-radius: 4px; display: flex; align-items: center; gap: 3px; outline: none; -webkit-tap-highlight-color: transparent;">
                        <svg viewBox="0 0 16 16" fill="currentColor" style="width:10px;height:10px;"><path d="M9.707 13.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 8l4.293 4.293a1 1 0 010 1.414z"/></svg>Back
                    </button>
                `;
            }

            let historyClass = '';
            let historyStyle = '';
            if (!isLast) {
                historyClass = 'tooltip-history-title';
                historyStyle = 'cursor: pointer; transition: color 0.2s;';
            }

            const titleHtml = `
                <div class="${historyClass}" data-index="${index}" style="font-weight:700; ${isLast ? 'border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:4px; margin-bottom:4px;' : ''} font-size:13px; letter-spacing:0.025em; color:${isLast ? '#facc15' : '#a1a1aa'}; display:flex; align-items:center; gap:4px; ${historyStyle}">
                    <img src="${titleImgSrc}" style="width:20px;height:20px;display:none;flex-shrink:0;vertical-align:text-bottom; filter: ${isLast ? 'none' : 'grayscale(100%) opacity(50%)'};" onload="this.style.display='inline-block'" />
                    <span style="${isLast ? '' : 'opacity: 0.7;'}">${card.title}</span>
                    ${backButtonHtml}
                </div>
            `;
            
            html += titleHtml;

            if (isLast) {
                const parsedDesc = parseRichText(card.desc);
                const descHtml = `<div style="font-size:11px;color:#e5e7eb;">${parsedDesc}</div>`;
                html += descHtml;
            }

            html += `</div>`;
        });

        tooltipEl.innerHTML = html;

        tooltipListeners.forEach(cleanupListener => cleanupListener());
        tooltipListeners = [];

        bindTerms(tooltipEl, true);

        const backBtn = tooltipEl.querySelector('.tooltip-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tooltipStack.pop();
                if (tooltipStack.length > 0) {
                    activeTerm = tooltipStack[tooltipStack.length - 1].termElement;
                }
                renderStack();
            });
        }

        const historyTitles = tooltipEl.querySelectorAll('.tooltip-history-title');
        historyTitles.forEach(titleEl => {
            titleEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetIndex = parseInt(titleEl.getAttribute('data-index'));
                if (!isNaN(targetIndex) && targetIndex < tooltipStack.length - 1) {
                    tooltipStack = tooltipStack.slice(0, targetIndex + 1);
                    activeTerm = tooltipStack[tooltipStack.length - 1].termElement;
                    renderStack();
                }
            });
        });

        const imgs = tooltipEl.querySelectorAll('img');
        imgs.forEach(img => {
            if (!img.complete) {
                img.addEventListener('load', updatePosition);
            }
        });

        updatePosition();
    }

    function updatePosition() {
        if (!tooltipEl || tooltipStack.length === 0) return;
        const anchorCard = tooltipStack[0];
        if (!anchorCard || !anchorCard.termElement) return;
        const termRect = anchorCard.termElement.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();

        let left = termRect.left + (termRect.width - tooltipRect.width) / 2;
        if (left < 10) {
            left = 10;
        } else if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        tooltipEl.style.left = `${left}px`;

        let top = termRect.top - tooltipRect.height - 8;
        if (top < 10) {
            tooltipEl.style.top = `${termRect.bottom + 8}px`;
            tooltipEl.style.bottom = 'auto';
        } else {
            tooltipEl.style.bottom = `${window.innerHeight - termRect.top + 8}px`;
            tooltipEl.style.top = 'auto';
        }
    }

    function bindTerms(container, isTooltip = false) {
        const terms = container.querySelectorAll('.rich-term');
        const tFunc = get(t);
        const targetListeners = isTooltip ? tooltipListeners : parentListeners;

        terms.forEach(term => {
            const termId = term.getAttribute('data-term-id');
            if (!termId) return;

            const tooltipTitle = tFunc(`hyperlink.${termId}.name`);
            const tooltipDesc = tFunc(`hyperlink.${termId}.desc`);
            const hasTooltip = tooltipDesc && tooltipDesc !== `hyperlink.${termId}.desc`;

            if (hasTooltip) {
                term.style.cursor = 'default';

                const showTooltip = (pin = false, isNested = false) => {
                    if (hideTimeout) {
                        clearTimeout(hideTimeout);
                        hideTimeout = null;
                    }
                    if (isPinned && !pin) return;
                    if (pin) {
                        isPinned = true;
                    }

                    if (isPinned && tooltipEl && isNested) {
                        tooltipStack.push({
                            termId,
                            title: tooltipTitle,
                            desc: tooltipDesc,
                            termElement: term
                        });
                        activeTerm = term;
                        renderStack();
                        return;
                    }

                    cleanupTooltip();
                    if (pin) {
                        isPinned = true;
                    }
                    activeTerm = term;

                    tooltipStack = [{
                        termId,
                        title: tooltipTitle,
                        desc: tooltipDesc,
                        termElement: term
                    }];

                    tooltipEl = document.createElement('div');
                    tooltipEl.style.cssText = `
                        position: fixed;
                        left: -9999px;
                        top: -9999px;
                        padding: 10px 14px;
                        background: #0a0a0f;
                        color: #e5e5e5;
                        font-size: 12px;
                        border-radius: 10px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06);
                        pointer-events: auto;
                        z-index: 999999;
                        max-width: 280px;
                        white-space: normal;
                        line-height: 1.5;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        opacity: 1 !important;
                        visibility: visible !important;
                        display: block !important;
                    `;

                    document.body.appendChild(tooltipEl);

                    // Hover grace period listeners on the tooltip itself
                    const onTooltipMouseEnter = () => {
                        if (hideTimeout) {
                            clearTimeout(hideTimeout);
                            hideTimeout = null;
                        }
                    };
                    const onTooltipMouseLeave = () => {
                        hideTooltip();
                    };

                    tooltipEl.addEventListener('mouseenter', onTooltipMouseEnter);
                    tooltipEl.addEventListener('mouseleave', onTooltipMouseLeave);

                    tooltipListeners.push(() => {
                        if (tooltipEl) {
                            tooltipEl.removeEventListener('mouseenter', onTooltipMouseEnter);
                            tooltipEl.removeEventListener('mouseleave', onTooltipMouseLeave);
                        }
                    });

                    window.addEventListener('scroll', cleanupTooltip, { passive: true });
                    window.addEventListener('resize', cleanupTooltip, { passive: true });
                    
                    setTimeout(() => {
                        document.addEventListener('click', handleDocumentClick);
                    }, 0);

                    renderStack();
                };

                const hideTooltip = () => {
                    if (isPinned) return;
                    if (hideTimeout) clearTimeout(hideTimeout);
                    hideTimeout = setTimeout(() => {
                        cleanupTooltip();
                    }, 150);
                };

                const handleMouseEnter = () => {
                    if (isTouchPreventingHover()) return;
                    showTooltip(false, isTooltip);
                };

                const handleMouseLeave = () => {
                    if (isTouchPreventingHover()) return;
                    hideTooltip();
                };

                const handleClick = (e) => {
                    e.stopPropagation();
                    if (tooltipEl && activeTerm === term) {
                        if (isPinned) {
                            cleanupTooltip();
                        } else {
                            isPinned = true;
                        }
                    } else {
                        showTooltip(true, isTooltip);
                    }
                };

                if (!isTooltip) {
                    term.addEventListener('mouseenter', handleMouseEnter);
                    term.addEventListener('mouseleave', handleMouseLeave);
                }
                term.addEventListener('click', handleClick);

                targetListeners.push(() => {
                    if (!isTooltip) {
                        term.removeEventListener('mouseenter', handleMouseEnter);
                        term.removeEventListener('mouseleave', handleMouseLeave);
                    }
                    term.removeEventListener('click', handleClick);
                });
            }
        });
    }

    function init() {
        cleanup();
        bindTerms(node, false);
    }

    let unsubscribeReady = null;

    unsubscribeReady = isI18nReady.subscribe((ready) => {
        if (ready) {
            queueInit();
        }
    });

    unsubscribeT = t.subscribe(() => {
        if (get(isI18nReady)) {
            queueInit();
        }
    });

    if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(() => {
            queueInit();
        });
        observer.observe(node, { childList: true, subtree: true });
    }

    return {
        update() {
            queueInit();
        },
        destroy() {
            cleanup();
            if (initTimeout) {
                clearTimeout(initTimeout);
            }
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }
            if (unsubscribeReady) {
                unsubscribeReady();
            }
            if (unsubscribeT) {
                unsubscribeT();
            }
            if (observer) {
                observer.disconnect();
            }
        }
    };
}

function evaluateMath(expr, bb) {
    let resolved = expr;
    const keys = Object.keys(bb).sort((a, b) => b.length - a.length);
    for (const key of keys) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        resolved = resolved.replace(regex, bb[key]);
    }
    resolved = resolved.replace(/[a-zA-Z_]+/g, '0');
    let sanitized = resolved.replace(/[^0-9.+\-*/() ]/g, '');
    sanitized = sanitized.replace(/--/g, ' - -').replace(/\+\+/g, ' + +');
    try {
        return Function(`"use strict"; return (${sanitized})`)();
    } catch (e) {
        return 0;
    }
}

function formatValue(value, format) {
    if (typeof value !== 'number' || isNaN(value)) return value;
    if (format === '0%') {
        return Math.round(value * 100) + '%';
    }
    if (format === '0') {
        return Math.round(value);
    }
    return value;
}

export function formatContractDescription(id, text) {
    if (!text) return "";
    id = normalizeContractTagId(id);
    let result = text.replace(/\{([^{}]+)\}/g, (match, content) => {
        let tagId = null;
        let expr = "";
        let format = "";
        const crossRefMatch = content.match(/^@(\d+)@([^:]+)(?::([^}]+))?$/);
        if (crossRefMatch) {
            tagId = crossRefMatch[1];
            expr = crossRefMatch[2];
            format = crossRefMatch[3] || "";
        } else {
            const localMatch = content.match(/^([^:]+)(?::([^}]+))?$/);
            if (localMatch) {
                expr = localMatch[1];
                format = localMatch[2] || "";
            }
        }
        let bb = {};
        if (tagId) {
            bb = tagIdToBlackboard[tagId] || {};
        } else {
            bb = localIdToBlackboard[id] || {};
        }
        const val = evaluateMath(expr, bb);
        return formatValue(val, format);
    });
    return parseRichText(result);
}


