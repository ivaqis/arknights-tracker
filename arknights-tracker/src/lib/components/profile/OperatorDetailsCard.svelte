<script>
    import { t } from "$lib/i18n.js";
    import { fade } from "svelte/transition";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import PotentialIcon from "$lib/components/operators/PotentialIcon.svelte";
    import AscensionIcon from "$lib/components/operators/AscensionIcon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { equipment } from "$lib/data/items/equipment.js";
    import { getImagePath } from "$lib/utils/imageUtils.js";
    import { getRarityColor, getHexColorByElement } from "$lib/utils/colorUtils.js";
    import { parseRichText, hyperlinkAction } from "$lib/utils/richText.js";

    export let selectedChar;
    export let detailedChar;
    export let opData;
    export let targetCharData;
    export let elementColor;
    export let svelteId;
    export let talentsList;
    export let getWeaponData;
    export let getWeaponIcon;
    export let getWeaponTerms;
    export let getStaticEquipId;
    export let getEquipRarity;
    export let getEquipTier;
    export let getStatIcon;
    export let charDetails = null;
    export let charLocale = null;

    function getSkillDescription(skillKey, skillLvl) {
        const skillData = charLocale?.skills?.[skillKey] || {};
        let text = skillData.description;
        if (!text) {
            const skillMeta = Array.isArray(targetCharData?.skills) 
                ? targetCharData.skills.find(s => s.key === skillKey || s.id?.includes(skillKey)) 
                : targetCharData?.skills?.[skillKey];
            text = skillMeta?.desc || skillMeta?.description || "";
        }
        if (!text) return "";

        const skillValues = charDetails?.skills?.[skillKey] || {};
        const blackboard = charDetails?.blackboard || {};

        text = text.replace(
            /\{(-?[a-zA-Z0-9_\.]+)(?::([^}]+))?\}/g,
            (match, rawKey, format) => {
                const isNegative = rawKey.startsWith("-");
                const cleanKey = isNegative ? rawKey.substring(1) : rawKey;
                const lowerKey = cleanKey.toLowerCase();

                let foundRaw = null;
                if (skillValues) {
                    const fk = Object.keys(skillValues).find(
                        (k) => k.toLowerCase() === lowerKey,
                    );
                    if (fk) foundRaw = skillValues[fk];
                }
                if (foundRaw === null || foundRaw === undefined) {
                    if (blackboard) {
                        for (const subSkill of Object.values(blackboard)) {
                            if (subSkill && typeof subSkill === "object") {
                                const fk = Object.keys(subSkill).find(
                                    (k) => k.toLowerCase() === lowerKey,
                                );
                                if (fk) {
                                    foundRaw = subSkill[fk];
                                    break;
                                }
                            }
                        }
                    }
                }
                if (foundRaw === null || foundRaw === undefined) return match;
                let num = 0;
                let isPercentData = false;
                if (
                    typeof foundRaw === "object" &&
                    !Array.isArray(foundRaw) &&
                    Array.isArray(foundRaw.data)
                ) {
                    const idx = Math.min(skillLvl - 1, foundRaw.data.length - 1);
                    num = parseFloat(foundRaw.data[idx]);
                    if (foundRaw.dataType === "percent") isPercentData = true;
                } else if (Array.isArray(foundRaw)) {
                    const idx = Math.min(skillLvl - 1, foundRaw.length - 1);
                    num = parseFloat(foundRaw[idx]);
                } else {
                    num = parseFloat(foundRaw);
                }
                if (isNaN(num)) return match;
                if (isNegative) num = -num;
                let result = num;
                if (format) {
                    if (format.includes("%"))
                        result = Math.round(num * 100) + "%";
                    else if (format === "0") result = Math.round(num);
                    else if (format === "0.0") result = num.toFixed(1);
                    else result = parseFloat(num.toFixed(2));
                } else {
                    if (isPercentData)
                        result = parseFloat((num * 100).toFixed(2)) + "%";
                    else result = parseFloat(num.toFixed(2));
                }

                return `<span class="text-[#38BDF8] font-bold drop-shadow-sm">${result}</span>`;
            }
        );

        return text;
    }

    function getGemIcon(gemData) {
        if (!gemData) return "";
        if (gemData.iconId) return gemData.iconId;
        const id = gemData.id || "";
        const match = id.match(/_(\d+)_/);
        if (match) {
            const num = parseInt(match[1], 10);
            return `icon_wpngem_${String(num).padStart(2, '0')}`;
        }
        const fallbackMatch = id.match(/(\d+)/);
        if (fallbackMatch) {
            const num = parseInt(fallbackMatch[1], 10);
            return `icon_wpngem_${String(num).padStart(2, '0')}`;
        }
        return "";
    }
</script>

<div class="w-full overflow-x-auto custom-scrollbar pb-1">
    <div in:fade={{ duration: 200 }} class="w-[950px] h-[447px] mx-auto relative bg-black/30 dark:bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl transition-all duration-300 text-left mt-3 overflow-hidden">
        
        <div class="absolute inset-0 bg-gradient-to-br {elementColor} pointer-events-none z-0 rounded-2xl"></div>
        <div class="absolute left-[-25px] top-2 pointer-events-none z-0 select-none opacity-90" style="width: 50%; height: 100%; transform: scale(1.5); transform-origin: left center;">
            <Image id={opData.id} variant="operator-splash" className="w-full h-full object-contain object-center" />
        </div>

        <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div class="lg:col-span-7 relative flex flex-col rounded-xl justify-between">
                <div class="z-10">
                    <div class="flex flex-col gap-2 mb-2">
                        <div class="flex items-start justify-between w-full gap-2">
                            <div class="flex flex-col gap-2 w-full">
                                <div class="flex items-center justify-between w-full">
                                    <div class="flex items-center gap-2">
                                        {#if opData.class}
                                            <Tooltip text={$t(`classes.${opData.class}`)}>
                                                <div class="w-10 h-10 rounded flex items-center justify-center shadow-sm">
                                                    <Icon name={opData.class} class="w-10 h-10 text-white rounded-md" />
                                                </div>
                                            </Tooltip>
                                        {/if}
                                        {#if opData.element}
                                            <Tooltip text={$t(`elements.${opData.element}`)}>
                                                <div class="w-10 h-10 rounded flex items-center justify-center shadow-sm">
                                                    <Icon name={opData.element} class="w-10 h-10 text-white rounded-md" />
                                                </div>
                                            </Tooltip>
                                        {/if}
                                        <h3 class="pl-1 text-3xl font-sdk font-black text-white tracking-tight drop-shadow-xl leading-none" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.85);">
                                            {$t(`characters.${opData.id}`) || opData.name}
                                        </h3>
                                    </div>

                                    <Tooltip text="P{Math.max(1, (selectedChar.potential || 1)) - 1}">
                                        <PotentialIcon pot={Math.max(0, (selectedChar.potential || 1) - 1)} size={50} className="ml-1 pt-2" />
                                    </Tooltip>
                                </div>

                                <div class="flex items-center gap-0 -space-x-2 ml-[-3px]">
                                    {#each Array(opData.rarity || 1) as _}
                                        <Icon name="strokeStar" class="w-10 h-10 text-gray-600 dark:text-white" style="stroke-opacity: 20%" />
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between items-end mt-auto z-10">
                    <div class="flex flex-row items-end gap-3">
                        <div class="flex flex-col gap-1.5">
                            {#each ["basicAttack", "battleSkill", "comboSkill", "ultimate"] as skillKey, idx}
                                {@const skillMeta = Array.isArray(targetCharData?.skills) ? targetCharData.skills[idx] : targetCharData?.skills?.[skillKey]}
                                {#if skillMeta}
                                    {@const skillLvl = detailedChar?.userSkills?.[skillMeta.id]?.level || 1}
                                    {@const skillImageId = skillKey === "basicAttack" ? (opData?.weapon || "sword") : `${svelteId}_${skillKey}`}
                                    {@const currentElement = skillMeta?.property?.key?.replace("skill_property_", "") || targetCharData?.property?.key?.replace("char_property_", "") || opData?.element || "physical"}
                                    {@const currentColor = getHexColorByElement(currentElement) || "#5E5D5D"}
                                    {@const isUltimate = skillKey === "ultimate"}
                                    
                                    <Tooltip>
                                        <div class="flex flex-col items-center group relative cursor-pointer">
                                            <div class="w-14 h-14 shrink-0 flex items-center justify-center relative">
                                                <div
                                                    class="absolute inset-0 rounded-full border-[2.5px] border-transparent"
                                                    style="background: conic-gradient(from 225deg, #d1d5db 270deg, transparent 0deg) border-box;
                                                    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                                                    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                                                    -webkit-mask-composite: destination-out;
                                                    mask-composite: exclude;"
                                                ></div>
                                                
                                                <div class="w-[82%] h-[82%] rounded-full bg-black/35 relative overflow-hidden flex items-center justify-center border border-white/5 shadow-md">
                                                    {#if isUltimate}
                                                        <div class="absolute inset-0" style="background-color: {currentColor}"></div>
                                                    {:else}
                                                        <div class="absolute inset-0" style="background-color: {currentColor}; clip-path: polygon(50% 50%, -100% 100%, 200% 100%);"></div>
                                                    {/if}
                                                    <div class="relative z-10 w-[85%] h-[85%] flex items-center justify-center">
                                                        <Image id={skillImageId} variant="skill-icon" className="w-full h-full object-contain filter drop-shadow" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="flex items-center justify-center select-none mt-[-10px]">
                                                {#if skillLvl >= 10}
                                                    <div class="w-6 h-6 rounded-full bg-black/60 border border-white/10 flex flex-col items-center justify-center scale-95 shadow-md z-10 relative">
                                                        <div class="flex flex-col items-center mt-[-1px]">
                                                            <svg width="7" height="7" viewBox="0 0 24 24"><path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill={(skillLvl - 9) > 0 ? "#FFFFFF" : "rgba(255,255,255,0.1)"} stroke={(skillLvl - 9) > 0 ? "#FFFFFF" : "rgba(255,255,255,0.25)"} stroke-width="2.5" /></svg>
                                                            <div class="flex">
                                                                <svg width="7" height="7" viewBox="0 0 24 24"><path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill={(skillLvl - 9) > 1 ? "#FFFFFF" : "rgba(255,255,255,0.1)"} stroke={(skillLvl - 9) > 1 ? "#FFFFFF" : "rgba(255,255,255,0.25)"} stroke-width="2.5" /></svg>
                                                                <svg width="7" height="7" viewBox="0 0 24 24"><path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill={(skillLvl - 9) > 2 ? "#FFFFFF" : "rgba(255,255,255,0.1)"} stroke={(skillLvl - 9) > 2 ? "#FFFFFF" : "rgba(255,255,255,0.25)"} stroke-width="2.5" /></svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                {:else}
                                                    <div class="w-6 h-6 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shadow-md z-10 relative">
                                                        <span class="text-xs font-black text-white/90 font-nums mt-[1px]">{skillLvl}</span>
                                                    </div>
                                                {/if}
                                            </div>
                                        </div>
                                        <div slot="content" class="flex flex-col gap-1 text-left max-w-[280px]" use:hyperlinkAction>
                                            <div class="flex items-center gap-1.5 border-b border-white/10 pb-1 mb-1 font-sans">
                                                <span class="px-1.5 py-0.5 bg-white/10 text-white rounded text-[10px] font-bold">
                                                    {$t(`menu.${skillKey}`) || skillKey}
                                                </span>
                                                <span class="font-bold text-[#FFE145]">{charLocale?.skills?.[skillKey]?.name || skillMeta.name || "Skill"}</span>
                                                <span class="text-xs text-gray-400 font-nums">(Lv. {skillLvl})</span>
                                            </div>
                                            <span class="text-xs leading-relaxed text-gray-200">
                                                {@html parseRichText(getSkillDescription(skillKey, skillLvl))}
                                            </span>
                                        </div>
                                    </Tooltip>
                                {/if}
                            {/each}
                        </div>

                        <div class="flex flex-row items-end gap-3 shrink-0">
                            <div class="flex flex-col items-start select-none justify-end pb-1">
                                <div class="flex items-baseline gap-1.5">
                                    <span class="text-[11px] font-bold text-white/50 uppercase tracking-wider" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Lv.</span>
                                    <span class="text-[42px] font-light text-white leading-none tracking-tighter font-nums" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">{selectedChar.level}<span class="text-[22px] text-white/40 font-normal">/90</span></span>
                                </div>
                            </div>
                            <AscensionIcon ascension={selectedChar.evolvePhase || 0} size={42} className="pb-1" />
                        </div>
                    </div>

                    <div class="flex flex-col gap-3 items-end justify-center">
                        {#if talentsList && talentsList.length > 0}
                            {#each talentsList as talent}
                                <Tooltip>
                                    <div class="group relative cursor-pointer transition-transform duration-200 hover:scale-105 select-none">
                                        {#if talent.type === "cultivation"}
                                            <div class="w-[35px] h-[35px] flex items-center justify-center {talent.currentLevel === 0 ? 'opacity-40 grayscale' : ''}">
                                                <Image id={talent.localImageId || talent.iconUrl} interactive={true} variant="fac-skill" className="max-w-full max-h-full object-contain" />
                                            </div>
                                            {#if talent.name}
                                                {@const match = talent.name.match(/[αβγ]\s*$/)}
                                                {@const label = match ? match[0] : ""}
                                                {#if label && talent.currentLevel > 0}
                                                    <div class="absolute -bottom-1 -right-1.5 z-10 text-white font-black font-serif text-[15px] select-none" style="text-shadow: 1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000;">
                                                        {label}
                                                    </div>
                                                {/if}
                                            {/if}
                                        {:else if talent.type === "ability"}
                                            <div class="w-[35px] h-[35px] rounded-full bg-[#F3CE00] border-[3px] border-[#D5B500] overflow-hidden flex items-center justify-center shadow-sm p-[2px] {talent.activeCount === 0 ? 'opacity-40 grayscale' : ''}">
                                                <Image id={talent.localImageId || talent.iconUrl} interactive={true} variant="attribute-icon" className="w-full h-full object-cover rounded-full" />
                                            </div>
                                            {#if talent.activeCount > 0}
                                                <div class="absolute -bottom-1 -right-2.5 z-10 bg-black/90 border border-white/20 px-1 py-0.5 rounded text-[9px] font-black text-[#FFE145] font-nums leading-none shadow-md">
                                                    +{talent.totalValue}
                                                </div>
                                            {/if}
                                        {:else}
                                            <div class="w-[35px] h-[35px] rounded-full bg-[#F3CE00] border-[3px] border-[#D5B500] overflow-hidden flex items-center justify-center shadow-sm p-[2px] {talent.currentLevel === 0 ? 'opacity-40 grayscale' : ''}">
                                                <Image id={talent.localImageId || talent.iconUrl} interactive={true} variant="skill-icon" className="w-full h-full object-cover rounded-full" />
                                            </div>
                                            {#if talent.currentLevel > 0}
                                                <div class="absolute -bottom-1.5 -right-1.5 z-10 flex gap-[2px] pb-1 items-center pointer-events-none select-none">
                                                    {#each Array(talent.currentLevel) as _, i}
                                                        <div class="w-[4px] h-[10px] rounded-full transform rotate-[30deg] border-[1px] shrink-0 border-[#FFE145] bg-[#FFE145] shadow-sm"></div>
                                                    {/each}
                                                </div>
                                            {/if}
                                        {/if}
                                    </div>
                                    <div slot="content" class="flex flex-col gap-1 text-left max-w-[280px]" use:hyperlinkAction>
                                        <span class="font-bold text-[#FFE145]">{talent.name}</span>
                                        <span class="text-xs leading-relaxed text-gray-200">{@html parseRichText(talent.desc)}</span>
                                    </div>
                                </Tooltip>
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>

            <div class="lg:col-span-5 flex flex-col gap-2 justify-between">
                {#if detailedChar?.weapon}
                    {@const wpn = detailedChar.weapon}
                    {@const wpnStatic = getWeaponData(wpn)}
                    {@const wpnName = $t(`weaponsList.${wpnStatic?.id}`) !== `weaponsList.${wpnStatic?.id}` ? $t(`weaponsList.${wpnStatic?.id}`) : (wpnStatic?.name || wpn.id)}
                    {@const wpnTerms = getWeaponTerms(wpn)}
                    
                    <div class="relative pl-8 pr-3 py-3 flex flex-row items-stretch justify-between gap-3 rounded-xl max-h-[140px]"
                         style="background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(20,20,20,0.85) 100%) padding-box, linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.15)) border-box;">
                        
                        <div class="flex flex-col justify-end items-start shrink-0">
                            <div class="flex flex-col items-start leading-none select-none">
                                <span class="text-[9px] font-black text-white/50 uppercase tracking-wider" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Lv.</span>
                                <span class="text-[36px] font-black text-white leading-none tracking-tighter" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">{wpn.level}</span>
                                <div class="w-12 h-[4px] mt-1 rounded" style="background-color: {getRarityColor(wpnStatic?.rarity || wpn.rarity || 5)};"></div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2 flex-1 min-w-0 ml-1">
                            <div class="flex flex-col items-end w-full min-w-0">
                                <a href="/weapons/{wpnStatic?.id}?level={wpn.level}&refine={wpn.refineLevel}" class="flex flex-row-reverse overflow-visible w-full">
                                    <h4 class="text-md font-black text-white leading-tight text-nowrap shrink-0 mr-[-32px]" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.85);">
                                        {wpnName}
                                    </h4>
                                </a>
                                <div class="flex items-center mt-2 select-none -space-x-1.5 mr-[-35px]">
                                    {#each Array(wpnStatic?.rarity || wpn.rarity || 5) as _}
                                        <Icon name="strokeStar" class="shrink-0 w-7 h-7 text-gray-600 dark:text-white" />
                                    {/each}
                                </div>
                            </div>

                            <div class="flex items-center gap-1.5 mt-8 select-none ml-[-6px] justify-start z-30">
                                {#each ['atk', 'def', 'maxhp'] as statKey}
                                    {@const calculatedStat = statKey === 'atk' ? Math.round(80 + wpn.level * 2.5) : (statKey === 'def' ? Math.round(20 + wpn.level * 0.8) : Math.round(150 + wpn.level * 4))}
                                    <div class="flex items-center gap-1.5 text-[13px] font-black text-white font-nums bg-black/30 px-2 py-1 rounded leading-none border border-white/5 w-fit">
                                        <Icon name={statKey} class="w-3.5 h-3.5 text-white/90" />
                                        <span>+{calculatedStat}</span>
                                    </div>
                                {/each}
                            </div>
                        </div>

                        <div class="flex items-center shrink-0 ml-2">
                            <div class="relative w-[120px] h-[120px] flex items-center justify-center shrink-0">
                                <div class="absolute top-0 right-0 z-10">
                                    <Tooltip text="R{wpn.refineLevel !== undefined ? wpn.refineLevel : 0}">
                                        <PotentialIcon pot={wpn.refineLevel !== undefined ? wpn.refineLevel : 0} size={30} />
                                    </Tooltip>
                                </div>
                                <img 
                                    src={getWeaponIcon(wpn) || wpn.weaponData?.iconUrl || ''} 
                                    alt="Weapon" 
                                    class="w-full h-full object-contain pointer-events-none"
                                    on:error={(e) => { if (wpn.weaponData?.iconUrl && e.target.src !== wpn.weaponData.iconUrl) e.target.src = wpn.weaponData.iconUrl; }} 
                                />
                            </div>

                            {#if wpnTerms && wpnTerms.length > 0}
                                <div class="flex flex-col gap-1 shrink-0 items-center justify-center ml-2 select-none">
                                    <div class="flex flex-col gap-1 w-full">
                                        {#each wpnTerms as term}
                                            <div class="flex items-center gap-1.5 px-2 py-1 rounded shadow-sm w-full justify-center" style="background: linear-gradient(to right, #1C1C1C, #2D2D2B);">
                                                <div class="w-[5px] h-[12px] rounded-full transform rotate-[40deg] bg-[#FFE145] border-[#FFE145] shrink-0"></div>
                                                <span class="text-[12px] font-black text-[#FFE145] font-nums leading-none">{term}</span>
                                            </div>
                                        {/each}
                                    </div>

                                    <div class="mt-1 flex items-center justify-center">
                                        {#if wpn.gem && wpn.gem.gemData}
                                            {@const gemRarity = parseInt(wpn.gem.gemData.templateId?.replace("item_gem_rarity_", "")) || wpn.gem.gemData.rarity || 4}
                                            {@const gemColor = getRarityColor(gemRarity)}
                                            {@const localIcon = getGemIcon(wpn.gem.gemData)}
                                                <div class="relative w-8 h-8 rounded-md border-b-2 flex items-center justify-center bg-black/40 shadow-inner overflow-hidden transition-transform" style="border-color: {gemColor}; box-shadow: 0 0 4px {gemColor}33;">
                                                    <img 
                                                        src={getImagePath('item_gem_rarity_' + gemRarity, 'essence-type-icon')} 
                                                        alt="" 
                                                        class="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none" 
                                                    />
                                                    {#if wpn.gem.gemData.icon}
                                                        <img 
                                                            src={getImagePath(localIcon, 'essence-icon') || wpn.gem.gemData.icon} 
                                                            alt={wpn.gem.gemData.name} 
                                                            referrerpolicy="no-referrer" 
                                                            class="relative z-10 w-7 h-7 object-contain left-0.5 bottom-0.5" 
                                                            on:error={(e) => {
                                                                if (e.target.src !== wpn.gem.gemData.icon) {
                                                                    e.target.src = wpn.gem.gemData.icon;
                                                                }
                                                            }}
                                                        />
                                                    {:else}
                                                        <div class="relative z-10 w-1.5 h-1.5 rounded-full" style="background-color: {gemColor}"></div>
                                                    {/if}
                                                </div>
                                        {:else}
                                            <Tooltip text={$t("profile.no_essence") || "No essence"}>
                                                <div class="relative w-8 h-8 rounded-md border border-dashed border-white/20 bg-black/20 flex items-center justify-center text-white/20 hover:border-white/40 hover:text-white/40 transition-colors cursor-pointer">
                                                    <Icon name="noData" class="shrink-0 w-3 h-3" />
                                                </div>
                                            </Tooltip>
                                        {/if}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                {:else}
                    <div class="flex flex-col gap-2 items-center justify-center bg-gradient-to-r from-transparent to-[#1a1a1a] border border-white/5 rounded-xl p-6 text-xs text-white/40 italic flex items-center justify-center min-h-[150px]">
                        <Icon name="noData" class="shrink-0 w-6 h-6" />
                        {$t("profile.no_weapon") || "No weapon"}
                    </div>
                {/if}

                <div class="grid grid-cols-2 gap-2 flex-1">
                    {#each ['bodyEquip', 'armEquip', 'firstAccessory', 'secondAccessory'] as eqKey}
                        {@const equip = detailedChar?.[eqKey]}
                        {#if equip && equip.equipData}
                            {@const staticId = getStaticEquipId(equip.equipData)}
                            {@const staticEquip = staticId ? equipment[staticId] : null}
                            {@const eqRarity = getEquipRarity(equip, staticEquip)}
                            {@const tier = eqRarity < 5 ? 0 : (equip.enhanceStatus !== undefined ? Math.max(0, equip.enhanceStatus - 1) : getEquipTier(equip.equipData.level?.value || equip.equipData.level, eqRarity))}
                            {@const rarityColor = eqRarity === 6 ? "#F4700C" : (eqRarity === 5 ? "#F9B90C" : (eqRarity === 4 ? "#9253F1" : (eqRarity === 3 ? "#26BAFB" : (eqRarity === 2 ? "#AABD00" : "#8F8F8F"))))}
                            {@const statsToRender = (() => {
                                let list = [];
                                const staticDefAttr = staticEquip?.displayAttr?.find(a => a.attrType.toLowerCase() === "def");
                                if (staticDefAttr) {
                                    list.push({ propKey: "equip_attr_def", statIcon: "def", statVal: staticDefAttr.values[tier] || staticDefAttr.values[0] });
                                } else {
                                    list.push({ propKey: "equip_attr_def", statIcon: "def", statVal: 10 + tier * 5 });
                                }
                                const subProperties = (equip.equipData.properties || []).filter(p => !p.toLowerCase().includes("def"));
                                for (const propKey of subProperties) {
                                    const statIcon = getStatIcon(propKey);
                                    const displayAttr = staticEquip?.displayAttr?.find(a => a.attrType === propKey.replace("equip_attr_", "").toUpperCase() || propKey.toLowerCase().includes(a.attrType.toLowerCase()));
                                    const statVal = displayAttr ? displayAttr.values[tier] || displayAttr.values[0] : null;
                                    list.push({ propKey, statIcon, statVal });
                                }
                                return list;
                            })()}
                            
                            <a href="/equipment/{staticId || equip.equipId}" class="relative flex items-center justify-between p-2 rounded-xl pl-5 hover:bg-white/5 transition-all cursor-pointer min-h-[32px] min-w-0"
                               style="background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(20,20,20,0.85) 100%) padding-box, linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.15)) border-box;">
                                <div class="flex flex-col items-center justify-between shrink-0 h-full">
                                    <!--<div class="w-9 h-5 select-none self-start">
                                    
                                        <svg class="w-full h-full filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="33.3789" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 33.3789 15)" fill={tier >= 1 ? "#26BAFB" : "#8F8F8F"} />
                                            <rect x="41.8555" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 41.8555 15)" fill={tier >= 2 ? "#26BAFB" : "#8F8F8F"} />
                                            <rect x="50.3281" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 50.3281 15)" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"} />
                                            <path d="M28 17L20 29H8L0 17L8 5H20L28 17ZM14 12C11.2386 12 9 14.2386 9 17C9 19.7614 11.2386 22 14 22C16.7614 22 19 19.7614 19 17C19 14.2386 16.7614 12 14 12Z" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"} />
                                            {#if tier >= 1}
                                                <path d="M28.0068 17L20.0068 29H8.00684L4.39844 23.5859L9.8877 19.834C10.7895 21.1422 12.2978 22 14.0068 22C16.7683 22 19.0068 19.7614 19.0068 17C19.0068 15.9584 18.6885 14.9912 18.6885 14.1904L23.625 10.4453L28.0068 17Z" fill="#26BAFB" />
                                            {/if}
                                            <path d="M31 0L36.1962 9H25.8038L31 0Z" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"} />
                                            {#if tier >= 1 && tier < 3}
                                                <path d="M33.5981 4.5L36.197 9H25.8047L33.5981 4.5Z" fill="#26BAFB" />
                                            {/if}
                                        </svg>
                                    </div>-->
                                    <div class="relative w-20 h-20 flex items-center justify-center -my-1 top-4">
                                        <img src={staticId ? getImagePath(staticId, 'equipment') : (equip.equipData?.iconUrl || '')} alt="Equip" style="transform: scale(1.1);" class="w-[110%] h-full object-contain pointer-events-none" on:error={(e) => { if (equip.equipData?.iconUrl) e.target.src = equip.equipData.iconUrl; }} />
                                    </div>
                                    <div class="w-12 h-[4px] rounded" style="background-color: {rarityColor};"></div>
                                </div>
                                
                                <div class="flex flex-col items-end gap-1 flex-1 select-none overflow-hidden justify-center h-full">
                                    {#each statsToRender as stat}
                                        <div class="flex items-center gap-1.5 text-[13px] font-black text-white font-nums bg-black/30 px-2 py-1 rounded leading-none border border-white/5 w-fit">
                                            {#if stat.statIcon}
                                                <Icon name={stat.statIcon} class="w-3.5 h-3.5 text-white/90" />
                                            {/if}
                                            <span>
                                                {#if stat.statVal !== null && stat.statVal !== undefined}
                                                    {#if Math.abs(stat.statVal) > 0 && Math.abs(stat.statVal) < 1}
                                                        {Math.round(stat.statVal * 100)}%
                                                    {:else}
                                                        +{Math.round(stat.statVal)}
                                                    {/if}
                                                {:else}
                                                    +{10 + tier * 5}
                                                {/if}
                                            </span>
                                        </div>
                                    {/each}
                                    {#if statsToRender.length < 4}
                                        {#each Array(4 - statsToRender.length) as _}
                                            <div class="h-[22px] w-2"></div>
                                        {/each}
                                    {/if}
                                </div>
                            </a>
                        {:else}
                            <div class="flex flex-col gap-1 items-center justify-center bg-[#202020]/40 border border-dashed border-white/10 rounded-xl min-h-[84px] text-[10px] text-white/40 select-none">
                                <Icon name="noData" class="shrink-0 w-3 h-3" /> 
                                <span>{$t("profile.empty_slot") || "Empty Slot"}</span>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>