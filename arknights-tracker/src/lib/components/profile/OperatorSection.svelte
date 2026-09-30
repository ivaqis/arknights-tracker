<script>
    import { onDestroy } from "svelte";
    import { t } from "$lib/i18n.js";
    import { currentLocale } from "$lib/stores/locale.js";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import OperatorDetailsCard from "$lib/components/profile/OperatorDetailsCard.svelte";
    import CardImageModal from "$lib/components/profile/CardImageModal.svelte";
    import {
        charOrderMap,
        getOperatorData,
        getSvelteCharId,
        getWeaponData,
        getWeaponIcon,
        getWeaponTerms,
        getStaticEquipId,
        getEquipRarity,
        getEquipTier,
        getStatIcon,
        getTalents
    } from "$lib/utils/profileUtils.js";
    import { getGradientColorByElement } from "$lib/utils/colorUtils.js";

    export let activeAccount = null;
    export let hasBackground = false;
    export let initialCharId = null;
    export let profileName = "";

    let selectedOperatorId = null;

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

    $: sortedChars = (() => {
        const chars = activeAccount?.info?.chars || [];
        return [...chars].sort((a, b) => {
            const aData = getOperatorData(a);
            const bData = getOperatorData(b);
            const aRarity = aData?.rarity || 0;
            const bRarity = bData?.rarity || 0;
            if (bRarity !== aRarity) {
                return bRarity - aRarity;
            }
            const aLevel = a?.level || 0;
            const bLevel = b?.level || 0;
            if (bLevel !== aLevel) {
                return bLevel - aLevel;
            }
            const indexA = charOrderMap[aData?.id] ?? 0;
            const indexB = charOrderMap[bData?.id] ?? 0;
            if (indexA !== indexB) return indexB - indexA;
            return (aData?.id || "").localeCompare(bData?.id || "");
        });
    })();

    $: if (sortedChars && sortedChars.length > 0) {
        if (initialCharId && (!selectedOperatorId || !sortedChars.some(c => c.id === selectedOperatorId))) {
            const found = sortedChars.find(c => {
                const sId = getSvelteCharId(c);
                return c.id === initialCharId || sId === initialCharId || c.charData?.id === initialCharId;
            });
            if (found) {
                selectedOperatorId = found.id;
            } else if (!selectedOperatorId || !sortedChars.some(c => c.id === selectedOperatorId)) {
                selectedOperatorId = sortedChars[0].id;
            }
        } else if (!selectedOperatorId || !sortedChars.some(c => c.id === selectedOperatorId)) {
            selectedOperatorId = sortedChars[0].id;
        }
    } else {
        selectedOperatorId = null;
    }

    function getDetailedChar(charId) {
        if (!activeAccount?.info?.chars) return null;
        return activeAccount.info.chars.find(c => c.charData?.id === charId || c.id === charId);
    }

    $: selectedChar = sortedChars.find(c => c.id === selectedOperatorId) || sortedChars[0];
    $: selectedDetailedChar = selectedChar ? getDetailedChar(selectedChar.id) : null;

    let selectedCharDetails = null;
    let currentFetchId = null;
    $: if (selectedChar) {
        const svelteId = getSvelteCharId(selectedChar);
        currentFetchId = svelteId;
        selectedCharDetails = null;
        if (svelteId) {
            import(`../../data/charactersData/${svelteId}.json`)
                .then(mod => {
                    if (currentFetchId === svelteId) {
                        selectedCharDetails = mod.default || mod;
                    }
                })
                .catch(err => {
                    console.warn("Failed to load details for", svelteId, err);
                    selectedCharDetails = null;
                });
        } else {
            selectedCharDetails = null;
        }
    }

    let selectedCharLocale = null;
    let currentLocaleFetchId = null;
    let currentLocaleFetchLang = null;
    $: if (selectedChar && $currentLocale) {
        const svelteId = getSvelteCharId(selectedChar);
        const rawLang = ($currentLocale || "en").toLowerCase();
        const lang = rawLang.startsWith("en") ? "en" : rawLang.replace("-", "");
        currentLocaleFetchId = svelteId;
        currentLocaleFetchLang = lang;
        selectedCharLocale = null;
        if (svelteId) {
            import(`../../locales/${lang}/characters/${svelteId}.json`)
                .then(mod => {
                    if (currentLocaleFetchId === svelteId && currentLocaleFetchLang === lang) {
                        selectedCharLocale = mod.default || mod;
                    }
                })
                .catch(err => {
                    if (lang !== "en") {
                        import(`../../locales/en/characters/${svelteId}.json`)
                            .then(mod => {
                                if (currentLocaleFetchId === svelteId && currentLocaleFetchLang === lang) {
                                    selectedCharLocale = mod.default || mod;
                                }
                            })
                            .catch(err2 => {
                                console.warn("Failed to load fallback en locale for", svelteId, err2);
                                if (currentLocaleFetchId === svelteId && currentLocaleFetchLang === lang) {
                                    selectedCharLocale = null;
                                }
                            });
                    } else {
                        console.warn("Failed to load locale for", svelteId, err);
                        if (currentLocaleFetchId === svelteId && currentLocaleFetchLang === lang) {
                            selectedCharLocale = null;
                        }
                    }
                });
        } else {
            selectedCharLocale = null;
        }
    }

    let selectedWeaponDetails = null;
    let currentWeaponFetchId = null;
    $: if (selectedDetailedChar?.weapon) {
        const wpnStatic = getWeaponData(selectedDetailedChar.weapon);
        const wpnId = wpnStatic?.id;
        if (wpnId) {
            currentWeaponFetchId = wpnId;
            import(`../../data/weaponsData/${wpnId}.json`)
                .then(mod => {
                    if (currentWeaponFetchId === wpnId) {
                        selectedWeaponDetails = mod.default || mod;
                    }
                })
                .catch(err => {
                    console.warn("Failed to load weapon details for", wpnId, err);
                    selectedWeaponDetails = null;
                });
        } else {
            selectedWeaponDetails = null;
        }
    } else {
        selectedWeaponDetails = null;
    }

    $: talentsList = selectedChar ? getTalents(selectedChar, selectedDetailedChar, selectedCharDetails, selectedCharLocale) : [];
    $: opData = selectedChar ? getOperatorData(selectedChar) : null;
    $: detailedChar = selectedDetailedChar;
    $: svelteId = selectedChar ? getSvelteCharId(selectedChar) : "";
    $: targetCharData = detailedChar?.charData || selectedChar?.charData || selectedCharDetails;
    $: elementColor = opData ? (getGradientColorByElement(opData.element) || "from-white/5 to-transparent") : "from-white/5 to-transparent";

    function boundGetStaticEquipId(equipData) {
        return getStaticEquipId(equipData, equipmentNames);
    }

    let isPhotoModalOpen = false;
    let photoImageUrl = null;
    let photoImageBlob = null;
    let photoOperatorName = "operator";
    let photoFileName = "";
    let isGeneratingPhoto = false;

    function handleOpenPhotoModal(event) {
        const detail = event.detail;
        if (detail.error) {
            handleClosePhotoModal();
            return;
        }
        isPhotoModalOpen = true;
        isGeneratingPhoto = detail.isGenerating;
        photoOperatorName = detail.operatorName;
        photoFileName = detail.fileName;
        if (detail.imageUrl) {
            if (photoImageUrl) URL.revokeObjectURL(photoImageUrl);
            photoImageUrl = detail.imageUrl;
            photoImageBlob = detail.imageBlob;
        }
    }

    function handleClosePhotoModal() {
        isPhotoModalOpen = false;
        if (photoImageUrl) {
            URL.revokeObjectURL(photoImageUrl);
            photoImageUrl = null;
        }
        photoImageBlob = null;
        isGeneratingPhoto = false;
    }

    onDestroy(() => {
        if (photoImageUrl) {
            URL.revokeObjectURL(photoImageUrl);
        }
    });
</script>

<div class="w-full min-w-0">
    <div class="{!hasBackground ? 'bg-white dark:bg-[#383838] border border-white/10' : 'bg-white/5 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-xl p-5 flex flex-col w-full mx-auto backdrop-blur-sm shadow-sm min-w-0 overflow-hidden">
        <div class="flex items-center justify-between border-b {!hasBackground ? 'border-gray-100 dark:border-[#444444]' : 'border-gray-100/30 dark:border-[#444444]/30'} pb-3 mb-3">
            <div class="flex gap-2">
                <Icon name="operators" class="w-6 h-6 text-[#21272C] dark:text-[#FDFDFD]" />
                <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk">
                    {$t("profile.operators_title")}
                </h2>
            </div>
        </div>
        <div class="flex gap-3.5 overflow-x-auto pb-2.5 whitespace-nowrap max-w-full justify-start items-center">
            {#each sortedChars as char}
                {@const opData = getOperatorData(char)}
                {@const isSelected = char.id === selectedOperatorId}
                <div class="relative w-12 h-12 shrink-0 flex items-center justify-center">
                    <button
                        on:click={() => selectedOperatorId = char.id}
                        class="w-11 h-11 rounded-full border-2 transition-all duration-300 outline-none cursor-pointer
                        {isSelected ? 'ring-2 ring-gray-400 dark:ring-white shadow-md dark:border-gray-500'  : 'border-[#FF6600]/80 hover:opacity-85'}"
                    >
                        <Image id={opData.id} variant="operator-icon" className="w-full h-full object-cover rounded-full" />
                    </button>
                    <div class="absolute -bottom-1 -right-1 z-10 px-1 py-0.5 text-[12px] text-white bg-black/40 rounded-md leading-none font-nums select-none shadow-xl">
                        {char.level}
                    </div>
                </div>
            {/each}
        </div>

        {#if selectedChar}
            {#key selectedOperatorId}
                <OperatorDetailsCard
                    {selectedChar}
                    {detailedChar}
                    {opData}
                    {targetCharData}
                    {elementColor}
                    {svelteId}
                    {talentsList}
                    {getWeaponData}
                    {getWeaponIcon}
                    {getWeaponTerms}
                    getStaticEquipId={boundGetStaticEquipId}
                    {getEquipRarity}
                    {getEquipTier}
                    {getStatIcon}
                    charDetails={selectedCharDetails}
                    charLocale={selectedCharLocale}
                    weaponDetails={selectedWeaponDetails}
                    {activeAccount}
                    {profileName}
                    on:openPhotoModal={handleOpenPhotoModal}
                />
            {/key}
        {/if}
    </div>

    <CardImageModal
        isOpen={isPhotoModalOpen}
        imageUrl={photoImageUrl}
        imageBlob={photoImageBlob}
        operatorName={photoOperatorName}
        fileName={photoFileName}
        isGenerating={isGeneratingPhoto}
        on:close={handleClosePhotoModal}
    />
</div>
