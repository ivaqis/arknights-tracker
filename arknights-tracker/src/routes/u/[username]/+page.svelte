<script>
    import { page } from "$app/stores";
    import { getAvatarUrl, getUserProfileByName } from "$lib/api.js";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";
    import AccountSummary from "$lib/components/profile/AccountSummary.svelte";
    import OperatorSection from "$lib/components/profile/OperatorSection.svelte";
    import ProfileSkeleton from "$lib/components/profile/ProfileSkeleton.svelte";
    import RatingCard from "$lib/components/records/RatingCard.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { characters } from "$lib/data/characters.js";
    import { t } from "$lib/i18n.js";
    import { addNotification } from "$lib/stores/notifications.js";
    import { isPageLoading } from "$lib/stores/pageLoading.js";
    import { getServerLabel } from "$lib/utils/profileUtils.js";
    import { onDestroy } from "svelte";
    import { fade } from "svelte/transition";

    $: username = $page.params.username;
    $: initialChar = $page.url.searchParams.get("char") || $page.url.searchParams.get("operator");
    $: urlServer = $page.url.searchParams.get("server");
    $: urlUid = $page.url.searchParams.get("uid");

    let profile = null;
    let loading = true;
    let errorMsg = "";
    let selectedGameUid = null;
    let favoriteGameUid = "";
    let linkCopied = false;
    let copiedUid = null;
    let showFullAvatarModal = false;

    $: if (username) {
        loadProfile(username);
    }

    async function loadProfile(name) {
        loading = true;
        errorMsg = "";
        try {
            const data = await getUserProfileByName(name);
            if (!data) {
                errorMsg = "Profile not found";
                profile = null;
            } else {
                profile = data;
                favoriteGameUid = profile.favorite_game_uid || "";
                if (profile.details && profile.details.length > 0) {
                    if (urlUid && profile.details.some(d => d.game_uid === urlUid)) {
                        selectedGameUid = urlUid;
                    } else if (urlServer && profile.details.some(d => String(d.info?.base?.serverId) === urlServer)) {
                        const matched = profile.details.find(d => String(d.info?.base?.serverId) === urlServer);
                        selectedGameUid = matched ? matched.game_uid : profile.details[0].game_uid;
                    } else {
                        const fav = favoriteGameUid;
                        const hasFav = profile.details.some(d => d.game_uid === fav);
                        const highestLevelAcc = [...profile.details].sort((a, b) => {
                            const levelA = a.info?.base?.level ?? a.level ?? 1;
                            const levelB = b.info?.base?.level ?? b.level ?? 1;
                            return levelB - levelA;
                        })[0];
                        selectedGameUid = hasFav ? fav : (highestLevelAcc?.game_uid || profile.details[0].game_uid);
                    }
                }
            }
        } catch (e) {
            errorMsg = e.message || "Failed to load profile";
        } finally {
            loading = false;
        }
    }

    $: isPageLoading.set(loading);
    onDestroy(() => {
        isPageLoading.set(false);
    });

    $: sortedDetails = (() => {
        const details = profile?.details || [];
        return [...details].sort((a, b) => {
            if (favoriteGameUid) {
                if (a.game_uid === favoriteGameUid) return -1;
                if (b.game_uid === favoriteGameUid) return 1;
            }
            const levelA = a.info?.base?.level ?? a.level ?? 1;
            const levelB = b.info?.base?.level ?? b.level ?? 1;
            return levelB - levelA;
        });
    })();

    $: activeAccount = profile?.details?.find(d => d.game_uid === selectedGameUid) || sortedDetails?.[0];

    function handleCopyProfileLink() {
        if (!profile || !profile.name) return;
        const link = `${window.location.origin}/u/${profile.name}`;
        navigator.clipboard.writeText(link).then(() => {
            linkCopied = true;
            setTimeout(() => {
                linkCopied = false;
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy link: ", err);
            addNotification("error", $t("profile.copy_failed"));
        });
    }

    function handleCopyUid(uid) {
        navigator.clipboard.writeText(uid).then(() => {
            copiedUid = uid;
            setTimeout(() => {
                if (copiedUid === uid) copiedUid = null;
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy UID: ", err);
            addNotification("error", $t("profile.copy_failed"));
        });
    }
    $: pageTitle = username ? `${username} - ${$t("pages.profile")} - Goyfield` : `${$t("pages.profile")} - Goyfield`;
    $: pageDescription = $t("seo.descriptions.userProfile", { username: username || "" });
</script>

<svelte:head>
    <title>{pageTitle}</title>
    <meta name="description" content={pageDescription} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={pageDescription} />
</svelte:head>

<div class="max-w-[1550px] w-full mx-auto pb-20">
    {#if profile && profile.background}
        <div class="fixed inset-0 w-[100vw] h-[100vh] pointer-events-none z-0 flex items-center justify-center overflow-hidden">
            <div class="w-full h-full object-cover opacity-65 dark:opacity-55 transform scale-105">
                <Image id={profile.background} variant="operator-art" size="100%" />
            </div>
            <div class="absolute inset-0 bg-black/5 dark:bg-black/15 z-10"></div>
            <div class="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t dark:from-[#2a2a2a] from-[#F0F2F4] to-transparent z-10"></div>
        </div>
    {/if}
    {#if loading}
        <ProfileSkeleton />
    {:else if errorMsg}
        <div class="flex flex-col items-center justify-center min-h-[80vh] text-center relative z-10" in:fade>
            <div class="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md backdrop-blur-md shadow-2xl">
                <img src="/images/empty.png" alt="Empty" class="w-36 h-auto object-contain mb-4 mx-auto select-none pointer-events-none" />
                <h3 class="text-xl font-bold dark:text-white text-gray-900 mb-2 font-sdk">
                    {errorMsg === "Profile not found" ? $t("profile.profile_not_found") : $t("profile.profile_hidden")}
                </h3>
                <p class="text-sm dark:text-gray-400 text-gray-600">
                    {errorMsg === "Profile not found" 
                        ? $t("profile.profile_not_registered_desc", { username }) 
                        : $t("profile.profile_hidden_desc")}
                </p>
                <Button variant="yellow" onClick={() => window.location.href = '/leaderboard'} className="mt-6 ">
                    <div slot="icon">
                        <Icon name="arrowLeft" class="w-5 h-5" />
                    </div>
                    {$t("profile.error_return_btn")}
                </Button>
            </div>
        </div>
    {:else if profile}
        <div class="space-y-6 relative z-10" in:fade>
            <div class="{!profile?.background ? 'bg-white dark:bg-[#383838] border border-white/10' : 'bg-white/5 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-2xl p-6 backdrop-blur-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="flex items-center gap-4">
                    <div class="relative group shrink-0 w-28 h-28">
                        <button
                            type="button"
                            class="w-full h-full rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FFE145] transition-all overflow-hidden {getAvatarUrl(profile.picture) ? 'cursor-zoom-in' : 'cursor-default'}"
                            on:click={() => {
                                if (getAvatarUrl(profile.picture)) {
                                    showFullAvatarModal = true;
                                }
                            }}
                            aria-label="View avatar"
                        >
                            {#if getAvatarUrl(profile.picture)}
                                <img
                                    src={getAvatarUrl(profile.picture)}
                                    alt="User Avatar"
                                    class="w-full h-full object-cover"
                                />
                            {:else}
                                <div class="w-full h-full bg-white/10 flex items-center justify-center text-white/50 text-3xl font-bold">
                                    {profile.name ? profile.name[0].toUpperCase() : "?"}
                                </div>
                            {/if}
                        </button>
                    </div>

                    <div class="flex flex-col gap-1 relative">
                        <div class="flex items-center gap-2">
                            <h1 class="text-3xl font-bold dark:text-white text-gray-900 font-sdk">
                                {profile.name}
                            </h1>
                            <Tooltip text={$t("profile.copy_profile_link")}>
                                <button on:click={handleCopyProfileLink} class="text-gray-400 hover:text-white transition-colors flex items-center justify-center w-6 h-6">
                                    {#if linkCopied}
                                        <Icon name="success" class="w-3.5 h-3.5 text-yellow-400" />
                                    {:else}
                                        <Icon name="link" class="w-4 h-4" />
                                    {/if}
                                </button>
                            </Tooltip>
                        </div>
                        {#if profile.avatar_strike === 1}
                            <span class="text-[10px] text-orange-400 font-bold flex items-center gap-1 mt-1">
                                <Icon name="warning" class="w-3.5 h-3.5" />
                                {$t("profile.strike_warning")}
                            </span>
                        {/if}
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-4">
                    {#if sortedDetails && sortedDetails.length > 0}
                        {#each sortedDetails as d}
                            <div
                                on:click={() => selectedGameUid = d.game_uid}
                                on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectedGameUid = d.game_uid; }}
                                role="button"
                                tabindex="0"
                                class="{!profile?.background ? 'bg-gray-100/80' : 'bg-gray-100/25'}  dark:bg-black/20 backdrop-blur-md border text-left p-3 rounded-xl flex items-center gap-4 w-[255px] hover:bg-gray-400/15 dark:hover:bg-black/35 transition-all relative group cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-[#FFE145]
                                {selectedGameUid === d.game_uid ? 'border-2 border-[#FFE145]' : 'border-2 border-white/10 dark:border-gray-400/20'}"
                            >
                                <img
                                    src={d.info?.base?.avatarUrl || (d.info?.chars?.[0]?.charData?.avatarSqUrl) || "/images/operators/icons/endministrator1.png"}
                                    alt="Roster Leader"
                                    referrerpolicy="no-referrer"
                                    class="w-12 h-12 rounded bg-white/10 border border-white/20 object-cover shrink-0"
                                    on:error={(e) => e.target.src = '/images/operators/icons/endministrator1.png'}
                                />
                                <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                                    <div class="flex items-center gap-1.5">
                                        <span class="text-md font-bold dark:text-white text-gray-900 font-sdk truncate">{d.info?.base?.name || "Profile"}</span>
                                        <!--<ContractLevelTag level={d.info?.contract?.level || 0} />-->
                                    </div>
                                    <div class="text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate flex items-center gap-1">
                                        <span>UID: {d.game_uid}</span>
                                        <Tooltip text={$t("profile.copy_uid")}>
                                            <button 
                                                on:click|stopPropagation={() => handleCopyUid(d.game_uid)} 
                                                class="text-gray-500 hover:text-gray-600 hover:dark:text-white transition-colors cursor-pointer flex items-center justify-center p-0.5"
                                            >
                                                {#if copiedUid === d.game_uid}
                                                    <Icon name="success" class="w-3.5 h-3.5 text-yellow-400" />
                                                {:else}
                                                    <Icon name="copy" class="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                                                {/if}
                                            </button>
                                        </Tooltip>
                                    </div>
                                    <div class="bg-gray-200 text-gray-600 dark:bg-[#383838] dark:text-[#B0B0B0] px-1.5 py-0.5 rounded text-[9px] font-medium font-sans w-fit truncate">
                                        {getServerLabel(d.info?.base?.serverId)}
                                    </div>
                                </div>
                                <div class="flex flex-col items-center justify-center shrink-0 min-w-[36px] border-l border-white/10 pl-3">
                                    <span class="bg-gray-800 text-white dark:bg-white dark:text-black font-black text-[9px] px-1 tracking-tighter uppercase leading-none mb-0.5 select-none">Lv.</span>
                                    <span class="text-2xl font-black dark:text-white text-gray-900 font-mono leading-none">{d.info?.base?.level || 1}</span>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>

            {#if activeAccount}
                <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-[360px_1fr] gap-6 items-start min-w-0" in:fade>
                    
                    <div class="min-w-0 2xl:col-start-1 2xl:row-start-1">
                        <AccountSummary 
                            stats={activeAccount.info?.stats || {}} 
                            totalCharsCount={Object.keys(characters).length - 1} 
                            profileBackground={!profile?.background}
                        />
                    </div>

                    {#if activeAccount?.records_uid || activeAccount?.pulls}
                        <div class="min-w-0 flex flex-col 2xl:col-start-1 2xl:row-start-2">
                            <RatingCard customGameUid={activeAccount.records_uid} profileStats={activeAccount?.pulls} isProfile={true} hideBorders={!!profile?.background} />
                        </div>
                    {/if}

                    <!--<CrisisContract
                        contract={activeAccount.info?.contract}
                        hasBackground={!!profile?.background}
                    />-->

                    <div class="min-w-0 md:col-span-2 2xl:col-span-1 2xl:col-start-2 2xl:row-start-1 2xl:row-span-2">
                        <OperatorSection
                            {activeAccount}
                            hasBackground={!!profile?.background}
                            initialCharId={initialChar}
                        />
                    </div>

                </div>
            {:else}
                <div class="{!profile?.background ? 'bg-white dark:bg-[#383838] border border-white/10' : 'bg-white/5 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-2xl p-12 text-center backdrop-blur-sm text-gray-500 dark:text-gray-400 font-mono text-sm shadow-sm leading-relaxed" in:fade>
                    {$t("profile.no_connected_accounts")}
                </div>
            {/if}
        </div>
    {/if}

    <Modal isOpen={showFullAvatarModal} on:close={() => showFullAvatarModal = false}>
        <div class="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center select-none">
            <button
                on:click={() => showFullAvatarModal = false}
                class="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors bg-black/40 p-2 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFE145]"
                aria-label="Close"
            >
                <Icon name="close" class="w-6 h-6" />
            </button>
            <img
                src={getAvatarUrl(profile?.picture)}
                alt="Avatar Fullsize"
                class="max-w-full max-h-[80vh] rounded-2xl border border-white/20 shadow-2xl object-contain select-text"
            />
        </div>
    </Modal>
</div>
