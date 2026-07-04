<script>
    import { t } from "$lib/i18n.js";
    import { currentLocale } from "$lib/stores/locale.js";
    import { characters } from "$lib/data/characters.js";
    import { weapons } from "$lib/data/weapons.js";
    import { getImagePath } from "$lib/utils/imageUtils.js";
    import { formatContractDescription } from "$lib/utils/richText.js";
    import { equipment } from "$lib/data/items/equipment.js";

    import Icon from "$lib/components/Icon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import ContractLevelTag from "$lib/components/profile/ContractLevelTag.svelte";
    import ContractCard from "$lib/components/profile/ContractCard.svelte";
    import ruEquip from "../../locales/ru/equipment.json";
    import enEquip from "../../locales/en/equipment.json";

    export let contract = null;
    export let chars = null;
    export let hasBackground = false;
    export let hideHeader = false;
    export let transparent = false;

    const charactersById = Object.values(characters || {}).reduce((acc, char) => {
        if (char && char.id) acc[char.id] = char;
        return acc;
    }, {});

    function getSvelteCharId(char) {
        if (!char) return "";
        return char.id || char.charId || char.charData?.id || "";
    }

    function mapProfessionToClass(key) {
        if (!key) return "guard";
        return key.replace("profession_", "");
    }

    function mapPropertyToElement(key) {
        if (!key) return null;
        return key.replace("char_property_", "");
    }

    function getOperatorData(char) {
        const svelteId = getSvelteCharId(char);
        const staticData = charactersById[svelteId];
        if (staticData) {
            return staticData;
        }

        return {
            id: char.charData?.avatarSqUrl || svelteId || char.id,
            name: char.charData?.name || char.name || "Operator",
            rarity: Number(char.charData?.rarity?.value || char.rarity || 4),
            class: mapProfessionToClass(char.charData?.profession?.key) || "guard",
            element: mapPropertyToElement(char.charData?.property?.key) || null
        };
    }

    function getWeaponData(weapon) {
        if (!weapon) return null;
        const skillKey = weapon.weaponData?.skills?.find(s => s.key?.startsWith("sk_wpn_"))?.key;
        const gameId = skillKey ? skillKey.replace("sk_", "") : (weapon.id || weapon.weaponData?.id);
        const staticData = Object.values(weapons || {}).find(w => w.id === gameId || w.gameId === gameId);
        if (staticData) {
            return staticData;
        }
        return {
            id: gameId,
            name: weapon.weaponData?.name || weapon.name || gameId,
            rarity: Number(weapon.weaponData?.rarity?.value || weapon.rarity?.value || weapon.rarity || 4),
            type: weapon.weaponData?.type?.value || weapon.type || "sword"
        };
    }

    function getWeaponIcon(weapon) {
        if (!weapon) return "";
        const mapped = getWeaponData(weapon);
        const wpnId = mapped?.id || weapon.id;
        if (wpnId) {
            return getImagePath(wpnId, "weapon-icon");
        }
        return weapon.icon || "";
    }

    function getEquipIcon(equip) {
        if (!equip) return "";
        const staticId = getStaticEquipId(equip.equipData) || equip.id;
        if (staticId) {
            return getImagePath(staticId, "equipment");
        }
        return equip.icon || (equip.equipData?.iconUrl || "");
    }

    function getStaticEquipId(equipData) {
        if (!equipData) return "";
        const nameToMatch = equipData.name;
        if (nameToMatch) {
            let matched = Object.keys(equipmentNames).find(key => equipmentNames[key]?.name === nameToMatch);
            if (matched) return matched;

            matched = Object.keys(ruEquip).find(key => ruEquip[key]?.name === nameToMatch);
            if (matched) return matched;

            matched = Object.keys(enEquip).find(key => enEquip[key]?.name === nameToMatch);
            if (matched) return matched;
        }

        const rawId = equipData.id || equipData.templateId || "";
        if (equipment[rawId]) return rawId;
        if (rawId && !rawId.startsWith("item_")) {
            const prepended = "item_" + rawId;
            if (equipment[prepended]) return prepended;
        }
        return rawId;
    }

    let equipmentNames = {};
    $: if (typeof window !== 'undefined' && $currentLocale) {
        loadEquipmentNames($currentLocale);
    }
    async function loadEquipmentNames(lang) {
        try {
            const safeLang = (lang || "en").toLowerCase().replace("-", "");
            const mod = await import(`../../locales/${safeLang}/equipment.json`);
            equipmentNames = mod.default || mod;
        } catch (e) {
            try {
                const mod = await import(`../../locales/en/equipment.json`);
                equipmentNames = mod.default || mod;
            } catch (err) {}
        }
    }

    $: contractLevel = contract?.level || contract?.contractLevel || 0;
    $: clearTime = contract?.clearTime !== undefined ? contract.clearTime : (contract?.clear_time || 0);

    $: contractChars = (() => {
        const listChars = chars || contract?.chars || [];
        let list = [...listChars];
        while (list.length < 4) {
            list.push(null);
        }
        return list;
    })();
</script>

<div class="w-full">
    <div class={transparent ? "flex flex-col" : `${!hasBackground ? 'bg-white dark:bg-[#383838] border border-white/10' : 'bg-white/5 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-2xl p-6 backdrop-blur-sm shadow-sm flex flex-col`}>
        {#if !hideHeader}
            <div class="flex items-center justify-between border-b {!hasBackground ? 'border-gray-100 dark:border-[#444444]' : 'border-gray-100/30 dark:border-[#444444]/30'} pb-2 mb-4">
                <div class="flex items-center gap-2">
                    <Icon name="contract" class="w-7 h-7 text-[#21272C] dark:text-[#FDFDFD]" />
                    <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk">
                        {$t("profile.crisis_contract")}
                    </h2>
                </div>
            </div>
        {/if}

        {#if contract && contractLevel > 0}
            <div class="flex items-center justify-between mb-4">
                <div class="text-sm font-medium dark:text-gray-400 text-gray-600">
                    {$t("profile.clear_time_label")} 
                    <span class="dark:text-white text-gray-900 font-bold text-lg ml-1 font-nums">
                        {$t("leaderboard.sec", { time: clearTime })}
                    </span>
                </div>
                <ContractLevelTag level={contractLevel} />
            </div>

            <div class="grid grid-cols-2 justify-items-center min-[450px]:flex min-[450px]:flex-row min-[450px]:justify-center gap-4 max-w-max mx-auto">
                {#each contractChars as char}
                    <ContractCard
                        {char}
                        {getOperatorData}
                        {getWeaponData}
                        {getWeaponIcon}
                        {getEquipIcon}
                        {getStaticEquipId}
                        {equipmentNames}
                    />
                {/each}
            </div>

            {#if contract.indicators && contract.indicators.length > 0}
                <div class="grid grid-cols-[repeat(auto-fill,56px)] gap-1.5 mt-4 border-t border-white/10 pt-4 justify-center">
                    {#each contract.indicators as ind}
                        {@const tagId = typeof ind === 'object' ? ind.id : ind}
                        {@const tagName = $t(`contractTagNames.${tagId}`) || (typeof ind === 'object' ? ind.name : tagId)}
                        {@const tagDesc = formatContractDescription(tagId, $t(`contractTagDesc.${tagId}`) || (typeof ind === 'object' ? ind.desc : ''))}
                        {@const cleanDesc = tagDesc ? tagDesc.replace(/<[^>]*>/g, "") : ""}
                        <Tooltip text={tagName + (cleanDesc ? ": " + cleanDesc : "")}>
                            <div class="w-12 h-12 bg-black/90 border border-white/10 rounded-lg p-1.5 flex items-center justify-center cursor-pointer hover:border-white/30 transition-all">
                                <img src={getImagePath(tagId, "contract-tag-icon")} alt={tagName} class="w-full h-full object-contain" on:error={(e) => e.target.src = (typeof ind === 'object' ? ind.icon : '')} />
                            </div>
                        </Tooltip>
                    {/each}
                </div>
            {/if}
        {:else}
            <div class="text-center py-10 text-gray-400 italic flex flex-col items-center bg-gray-50/20 dark:bg-[#2C2C2C]/20 rounded-2xl border border-gray-100/50 dark:border-[#444444]/50 w-full backdrop-blur-sm">
                <Icon name="noData" class="w-8 h-8 mb-2 opacity-30" />
                <p class="text-sm">
                    {$t("emptyState.noData") || "No records found"}
                </p>
            </div>
        {/if}
    </div>
</div>
