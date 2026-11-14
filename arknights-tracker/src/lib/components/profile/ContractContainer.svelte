<script>
    import { createEventDispatcher } from "svelte";
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import { getSvelteCharId, mapProfessionToClass, mapPropertyToElement, getOperatorData, getWeaponData } from "$lib/utils/operatorUtils";
    import { getRankTagStyle } from "$lib/utils/colorUtils";
    import { getImagePath } from "$lib/utils/imageUtils.js";
    import { formatContractDescription, normalizeContractTagId } from "$lib/utils/richText.js";
    import { equipment } from "$lib/data/items/equipment.js";
    import { user } from "$lib/stores/cloudStore.js";
    import { addNotification } from "$lib/stores/notifications.js";
    import { deleteContractVideo } from "$lib/api.js";

    import Icon from "$lib/components/Icon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import ContractLevelTag from "$lib/components/profile/ContractLevelTag.svelte";
    import ContractCard from "$lib/components/profile/ContractCard.svelte";
    import Button from "$lib/components/Button.svelte";
    import ConfirmationModal from "$lib/components/modals/ConfirmationModal.svelte";
    import ContractVideoModal from "$lib/components/modals/ContractVideoModal.svelte";
    import ruEquip from "../../locales/ru/equipment.json";
    import enEquip from "../../locales/en/equipment.json";

    export let contract = null;
    export let chars = null;
    export let hasBackground = false;
    export let hideHeader = false;
    export let transparent = false;
    export let hideRank = false;
    export let charHrefGenerator = null;
    export let isOwner = false;

    const dispatch = createEventDispatcher();

    let isVideoModalOpen = false;
    let showDeleteModal = false;

    function getYouTubeEmbedUrl(url) {
        if (!url) return null;
        try {
            const u = new URL(url.trim());
            const hostname = u.hostname.toLowerCase();
            const validHosts = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"];
            if (!validHosts.includes(hostname)) return null;

            let videoId = null;
            if (hostname === "youtu.be") {
                videoId = u.pathname.slice(1).split("/")[0] || null;
            } else if (u.pathname === "/watch") {
                videoId = u.searchParams.get("v");
            } else if (u.pathname.startsWith("/embed/")) {
                videoId = u.pathname.split("/")[2] || null;
            } else if (u.pathname.startsWith("/v/")) {
                videoId = u.pathname.split("/")[2] || null;
            } else if (u.pathname.startsWith("/shorts/")) {
                videoId = u.pathname.split("/")[2] || null;
            } else if (u.pathname.startsWith("/live/")) {
                videoId = u.pathname.split("/")[2] || null;
            }

            if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        } catch {}
        return null;
    }

    function openVideoModal() {
        isVideoModalOpen = true;
    }

    function openDeleteModal() {
        showDeleteModal = true;
    }

    async function confirmDeleteVideo() {
        showDeleteModal = false;
        if (!$user) return;

        try {
            const token = await $user.getIdToken();
            const recordId = contract.recordId || contract.id;
            await deleteContractVideo(token, recordId);
            contract.videoUrl = null;
            addNotification("success", $t("contractVideo.success_deleted"));
            dispatch("videoUpdated", { videoUrl: null });
        } catch (e) {
            addNotification("error", e.message || $t("contractVideo.error_generic"));
        }
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
            const rawLang = (lang || "en").toLowerCase();
            const safeLang = rawLang.startsWith("en") ? "en" : rawLang.replace("-", "");
            const mod = await import(`../../locales/${safeLang}/equipment.json`);
            equipmentNames = mod.default || mod;
        } catch (e) {
            try {
                const mod = await import(`../../locales/en/equipment.json`);
                equipmentNames = mod.default || mod;
            } catch (err) {}
        }
    }

    $: contractLevel = contract?.level || contract?.contractLevel || contract?.indicatorCount || 0;
    $: clearTime = contract?.clearTime !== undefined ? contract.clearTime : (contract?.clear_time !== undefined ? contract.clear_time : (contract?.passTs || 0));

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
    <div class={transparent ? "flex flex-col" : `${!hasBackground ? 'bg-white dark:bg-[#383838] border border-gray-200 dark:border-white/10' : 'bg-white/15 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-2xl p-6 backdrop-blur-[7px] shadow-sm flex flex-col`}>
        {#if !hideHeader}
            <div class="flex items-center justify-between border-b {!hasBackground ? 'border-gray-100 dark:border-[#444444]' : 'border-white/10'} pb-2 mb-4">
                <div class="flex items-center gap-2">
                    <Icon name="contract" class="w-7 h-7 text-[#21272C] dark:text-[#FDFDFD]" />
                    <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk">
                        {$t("profile.crisis_contract")}
                    </h2>
                </div>
                {#if isOwner && contract && contractLevel > 0 && !contract.videoUrl}
                    <Button
                        variant="roundSmall"
                        color="gray"
                        onClick={openVideoModal}
                        className="!h-8 !px-3 text-xs font-bold shrink-0"
                    >
                        <div class="flex items-center gap-1.5">
                            <Icon name="youtube" class="w-3.5 h-3.5 text-red-600 fill-current" />
                            <span>{$t("contractVideo.add_video_btn")}</span>
                        </div>
                    </Button>
                {/if}
            </div>
        {/if}

        {#if contract && contractLevel > 0}
            <div class="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <div class="flex items-center gap-2 flex-wrap">
                    <div class="text-sm font-medium dark:text-gray-400 text-gray-600">
                        {$t("profile.clear_time_label")} 
                        <span class="dark:text-white text-gray-900 font-bold text-lg ml-1 font-nums">
                            {$t("leaderboard.sec", { time: clearTime })}
                        </span>
                    </div>
                    {#if !hideRank && contract.rank}
                        <a
                            href="/leaderboard?event=contract"
                            class="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold font-nums inline-flex items-center justify-center shrink-0 transition-transform active:scale-95 hover:opacity-90 cursor-pointer {getRankTagStyle(contract.rank)}"
                            title={$t("navigation.leaderboard")}
                        >
                            #{contract.rank}/{contract.totalCount || contract.rank}
                        </a>
                    {/if}
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
                        charHref={charHrefGenerator && char ? charHrefGenerator(char) : null}
                    />
                {/each}
            </div>

            {#if contract.indicators && contract.indicators.length > 0}
                <div class="grid grid-cols-[repeat(auto-fill,56px)] gap-1.5 mt-4 border-t border-white/10 pt-4 justify-center">
                    {#each contract.indicators as ind}
                        {@const rawTagId = typeof ind === 'object' ? ind.id : ind}
                        {@const tagId = normalizeContractTagId(rawTagId)}
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

            {#if contract.videoUrl}
                {@const embedUrl = getYouTubeEmbedUrl(contract.videoUrl)}
                <div class="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                            <Icon name="youtube" class="w-4 h-4 text-red-500 fill-current" />
                            {$t("contractVideo.video_title")}
                        </span>
                        {#if isOwner}
                            <div class="flex items-center gap-2">
                                <Button
                                    variant="roundSmall"
                                    color="gray"
                                    onClick={openVideoModal}
                                    className="!h-7 !px-3 text-xs"
                                >
                                    {$t("contractVideo.video_change")}
                                </Button>
                                <Button
                                    variant="roundSmall"
                                    color="red"
                                    onClick={openDeleteModal}
                                    className="!h-7 !px-3 text-xs"
                                >
                                    {$t("settings.account.delete")}
                                </Button>
                            </div>
                        {/if}
                    </div>
                    {#if embedUrl}
                        <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-md">
                            <iframe
                                src={embedUrl}
                                title="YouTube video player"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowfullscreen
                                class="w-full h-full"
                            ></iframe>
                        </div>
                    {/if}
                </div>
            {/if}
        {:else}
            <div class="text-center py-10 text-gray-400 italic flex flex-col items-center bg-gray-50/20 dark:bg-[#2C2C2C]/20 rounded-2xl border border-gray-100/50 dark:border-[#444444]/50 w-full backdrop-blur-[7px]">
                <Icon name="noData" class="w-8 h-8 mb-2 opacity-30" />
                <p class="text-sm">
                    {$t("emptyState.noData")}
                </p>
            </div>
        {/if}
    </div>
</div>

<ContractVideoModal
    isOpen={isVideoModalOpen}
    recordId={contract?.recordId || contract?.id || ""}
    videoCode={contract?.videoCode || ""}
    clearTime={clearTime}
    initialUrl={contract?.videoUrl || ""}
    on:close={() => isVideoModalOpen = false}
    on:success={(e) => {
        if (contract) contract.videoUrl = e.detail.videoUrl;
        dispatch("videoUpdated", { videoUrl: e.detail.videoUrl });
    }}
/>

<ConfirmationModal
    isOpen={showDeleteModal}
    title={$t("settings.account.delete")}
    description={$t("contractVideo.delete_confirm")}
    confirmText={$t("settings.account.delete")}
    isDestructive={true}
    on:confirm={confirmDeleteVideo}
    on:close={() => (showDeleteModal = false)}
/>
