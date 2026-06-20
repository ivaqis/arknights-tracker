import { get } from "svelte/store";
import { t, isI18nReady } from "$lib/i18n.js";

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
    let hoverListeners = [];
    let activeTerm = null;
    let unsubscribeT = null;
    let observer = null;

    function cleanup() {
        cleanupTooltip();
        hoverListeners.forEach(cleanupListener => cleanupListener());
        hoverListeners = [];
    }

    function cleanupTooltip() {
        if (tooltipEl) {
            tooltipEl.remove();
            tooltipEl = null;
        }
        activeTerm = null;
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

    function init() {
        cleanup();

        const terms = node.querySelectorAll('.rich-term');
        const tFunc = get(t);

        terms.forEach(term => {
            const termId = term.getAttribute('data-term-id');
            if (!termId) return;

            const tooltipTitle = tFunc(`hyperlink.${termId}.name`);
            const tooltipDesc = tFunc(`hyperlink.${termId}.desc`);
            const hasTooltip = tooltipDesc && tooltipDesc !== `hyperlink.${termId}.desc`;

            if (hasTooltip) {
                term.style.cursor = 'default';

                const showTooltip = () => {
                    cleanupTooltip();
                    activeTerm = term;

                    tooltipEl = document.createElement('div');
                    tooltipEl.style.cssText = `
                        position: fixed;
                        padding: 10px 14px;
                        background: #0a0a0f;
                        color: #e5e5e5;
                        font-size: 12px;
                        border-radius: 10px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06);
                        pointer-events: none;
                        z-index: 999999;
                        max-width: 280px;
                        white-space: normal;
                        line-height: 1.5;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        opacity: 1 !important;
                        visibility: visible !important;
                        display: block !important;
                    `;

                    const titleImgName = `icon_term_${termId.replace(/\./g, '_')}.png`;
                    const titleImgSrc = `/images/textIcons/${titleImgName}`;
                    const titleHtml = `<div style="font-weight:700;border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:4px;margin-bottom:4px;font-size:13px;letter-spacing:0.025em;color:#facc15;display:flex;align-items:center;gap:2px;"><img src="${titleImgSrc}" style="width:20px;height:20px;display:none;flex-shrink:0;vertical-align:text-bottom;" onload="this.style.display='inline-block'" />${tooltipTitle}</div>`;
                    
                    const parsedDesc = parseRichText(tooltipDesc);
                    const descHtml = `<div style="font-size:11px;color:#e5e7eb;">${parsedDesc}</div>`;
                    tooltipEl.innerHTML = titleHtml + descHtml;

                    document.body.appendChild(tooltipEl);

                    window.addEventListener('scroll', cleanupTooltip, { passive: true });
                    window.addEventListener('resize', cleanupTooltip, { passive: true });
                    
                    setTimeout(() => {
                        document.addEventListener('click', handleDocumentClick);
                    }, 0);

                    const imgs = tooltipEl.querySelectorAll('img');
                    imgs.forEach(img => {
                        if (!img.complete) {
                            img.addEventListener('load', updatePosition);
                        }
                    });

                    updatePosition();
                };

                const hideTooltip = () => {
                    cleanupTooltip();
                };

                const updatePosition = () => {
                    if (!tooltipEl) return;
                    const termRect = term.getBoundingClientRect();
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
                };

                const handleMouseEnter = () => {
                    if (isTouchPreventingHover()) return;
                    showTooltip();
                };

                const handleMouseLeave = () => {
                    if (isTouchPreventingHover()) return;
                    hideTooltip();
                };

                const handleClick = (e) => {
                    e.stopPropagation();
                    if (tooltipEl && activeTerm === term) {
                        cleanupTooltip();
                    } else {
                        showTooltip();
                    }
                };

                term.addEventListener('mouseenter', handleMouseEnter);
                term.addEventListener('mouseleave', handleMouseLeave);
                term.addEventListener('click', handleClick);

                hoverListeners.push(() => {
                    term.removeEventListener('mouseenter', handleMouseEnter);
                    term.removeEventListener('mouseleave', handleMouseLeave);
                    term.removeEventListener('click', handleClick);
                });
            }
        });
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


