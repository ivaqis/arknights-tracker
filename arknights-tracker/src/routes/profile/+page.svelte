<script>
    import {
        createUserProfile,
        deleteGameAccount,
        getAvatarUrl,
        getUserProfile,
        linkUserPulls,
        syncGameAccount,
        unlinkUserPulls,
        updateUserProfile,
        uploadAvatar
    } from "$lib/api.js";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import ConfirmationModal from "$lib/components/modals/ConfirmationModal.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";
    import AccountSummary from "$lib/components/profile/AccountSummary.svelte";
    import CropModal from "$lib/components/profile/CropModal.svelte";
    import OperatorSection from "$lib/components/profile/OperatorSection.svelte";
    import ProfileSkeleton from "$lib/components/profile/ProfileSkeleton.svelte";
    import SettingsModal from "$lib/components/profile/SettingsModal.svelte";
    import SyncModal from "$lib/components/profile/SyncModal.svelte";
    import RatingCard from "$lib/components/records/RatingCard.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { characters } from "$lib/data/characters.js";
    import { t } from "$lib/i18n.js";
    import { accountStore } from "$lib/stores/accounts.js";
    import { login, logout, user } from "$lib/stores/cloudStore.js";
    import { addNotification } from "$lib/stores/notifications.js";
    import { isPageLoading } from "$lib/stores/pageLoading.js";
    import { getServerLabel } from "$lib/utils/profileUtils.js";
    import { onDestroy, onMount } from "svelte";
    import { fade } from "svelte/transition";

    const { accounts } = accountStore;

    let profile = null;
    let linkCopied = false;
    let copiedUid = null;
    let loading = true;
    let needsRegistration = false;
    let syncModalOpen = false;
    let settingsModalOpen = false;
    let showCropModal = false;
    let showFullAvatarModal = false;
    let cropImageSrc = "";
    let cropModal;
    let isEditingName = false;
    let newProfileName = "";
    let showNameWarning = false;
    let warningTimeout = null;

    function handleNameInput(e) {
        const inputVal = e.target.value;
        const sanitized = inputVal.replace(/[^a-zA-Z0-9_]/g, "");
        if (inputVal !== sanitized) {
            showNameWarning = true;
            if (warningTimeout) clearTimeout(warningTimeout);
            warningTimeout = setTimeout(() => {
                showNameWarning = false;
            }, 3000);
        }
        newProfileName = sanitized;
        e.target.value = sanitized;
    }
    let avatarInput;
    let isPrivate = false;

    let bgSearchQuery = "";
    $: availableBackgrounds = Object.values(characters || {})
        .filter(char => char.id && char.id !== "endministrator1" && char.id !== "endministrator2")
        .flatMap(char => [
            { id: `${char.id}_potential1`, name: char.name, pot: 1 },
            { id: `${char.id}_potential3`, name: char.name, pot: 3 },
            { id: `${char.id}_potential5`, name: char.name, pot: 5 }
        ]);

    $: primaryAccountOptions = [
        { value: "", label: $t("profile.settings_primary_account_none") },
        ...($accounts || []).map(a => ({
            value: a.id,
            label: a.name || $t("settings.defaultAccountName"),
            subLabel: getServerLabel(a.serverId || "3")
        }))
    ];

    $: activeAccountPullsAccountId = (() => {
        if (!activeAccount) return "";
        const allAccs = $accounts || [];
        if (allAccs.length === 0) return "";

        if (typeof window !== "undefined") {
            const explicit = localStorage.getItem(`ark_banner_linked_acc_${activeAccount.game_uid}`);
            if (explicit && allAccs.some(a => a.id === explicit)) {
                return explicit;
            }
        }

        if (activeAccount.records_uid) {
            const byId = allAccs.find(a => a.id === activeAccount.records_uid);
            if (byId) return byId.id;
            const byServerUid = allAccs.find(a => a.serverUid && a.serverUid === activeAccount.records_uid);
            if (byServerUid) return byServerUid.id;
        }

        if (typeof window !== "undefined" && activeAccount.pulls?.profileId) {
            const targetPub = activeAccount.pulls.profileId;
            const byPub = allAccs.find(a => {
                const pId = localStorage.getItem(`ark_banner_public_id_${a.id}`) ||
                            (a.serverUid ? localStorage.getItem(`ark_banner_public_id_${a.serverUid}`) : null);
                return pId === targetPub;
            });
            if (byPub) return byPub.id;
        }

        if (activeAccount.pulls || activeAccount.records_uid) {
            const byGameUid = allAccs.find(a => a.serverUid && a.serverUid === activeAccount.game_uid);
            if (byGameUid) return byGameUid.id;

            if (typeof window !== "undefined") {
                const accsWithPulls = allAccs.filter(a => localStorage.getItem(`ark_banner_private_id_${a.id}`));
                if (accsWithPulls.length === 1) return accsWithPulls[0].id;
            }
        }

        return "";
    })();

    function translateBackendError(message) {
        if (!message) return "";
        const msg = message.trim();

        const exactMappings = {
            "Username must be between 3 and 20 characters long.": "profile.name_length_error",
            "Username can only contain English letters, numbers, and underscores.": "profile.name_invalid_error",
            "Username contains inappropriate language.": "profile.name_profanity_error",
            "Username is already taken.": "profile.username_taken",
            "Invalid background format.": "profile.invalid_background",
            "Unauthorized: Game account belongs to another user.": "profile.account_linked_elsewhere",
            "Profile not found.": "profile.profile_not_found",
            "Profile not found": "profile.profile_not_found",
            "Profile not found. Register first.": "profile.profile_not_found",
            "Profile not registered. Please register a profile first.": "profile.profile_not_registered",
            "Profile not registered.": "profile.profile_not_registered",
            "This profile is private": "profile.profile_private_error",
            "Game account not found.": "profile.game_account_not_found",
            "You do not own this game account.": "profile.not_account_owner",
            "Game token is required.": "profile.token_empty",
            "Invalid token format in JSON structure.": "profile.token_invalid",
            "Invalid JSON token format.": "profile.token_invalid",
            "Invalid token format.": "profile.token_invalid",
            "Invalid or expired game token.": "profile.token_invalid_or_expired",
            "No game accounts found or failed to fetch their details.": "profile.sync_no_accounts",
            "Authentication service temporarily unavailable": "profile.auth_unavailable",
            "No token provided": "profile.no_auth_token",
            "Invalid token format": "profile.invalid_auth_token",
            "Failed to parse token payload": "profile.invalid_auth_token",
            "Unsupported algorithm": "profile.invalid_auth_token",
            "Key ID not found in Google certificates": "profile.invalid_auth_token",
            "Invalid signature": "profile.invalid_auth_token",
            "Invalid issuer": "profile.invalid_auth_token",
            "Invalid audience": "profile.invalid_auth_token",
            "Token expired": "profile.auth_token_expired",
            "Subject is missing": "profile.invalid_auth_token",
            "Invalid image format header. Only JPEG, PNG, WebP, and AVIF are allowed.": "profile.image_format_error",
            "Image exceeds the 1MB limit.": "profile.image_size_limit_error",
            "Image is too small. Minimum resolution is 128x128 pixels.": "profile.image_size_error",
            "Monthly upload limit reached (max 30 uploads per month).": "profile.upload_limit_reached",
            "Converted WebP exceeds 1MB limit.": "profile.image_size_limit_error",
            "Unauthorized": "profile.unauthorized",
            "No access": "profile.no_access",
            "User not found": "profile.user_not_found",
            "User already exists": "profile.username_taken",
            "Username already exists": "profile.username_taken",
            "Profile already exists": "profile.profile_already_exists",
            "Username contains banned words": "profile.name_profanity_error",
            "User profile not found": "profile.profile_not_found",
            "User profile is private": "profile.profile_private_error",
            "Reached upload limit": "profile.upload_limit_reached",
            "NSFW service unavailable": "profile.nsfw_service_unavailable",
            "NSFW image": "profile.nsfw_image",
            "Sync on cooldown": "profile.sync_cooldown_simple",
            "Gryphline auth failed": "profile.token_invalid_or_expired",
            "Token not verified or expired": "profile.token_invalid_or_expired",
            "Token already used": "profile.token_already_used",
            "Invalid image format.": "profile.image_format_error",
            "Banner profile not found": "profile.banner_profile_not_found",
            "Banner profile not found.": "profile.banner_profile_not_found"
        };

        if (exactMappings[msg]) {
            return $t(exactMappings[msg]);
        }

        if (msg.startsWith("Sync is on cooldown. Please wait")) {
            const match = msg.match(/wait (\d+) minutes/);
            const mins = match ? match[1] : "";
            return $t("profile.sync_cooldown", { time: mins });
        }
        if (msg.startsWith("Game UID") && msg.includes("is already linked to another user account.")) {
            const match = msg.match(/Game UID (\d+) is already linked/);
            const gameUid = match ? match[1] : "";
            return $t("profile.uid_already_linked", { uid: gameUid });
        }
        if (msg.startsWith("Forbidden file format detected:")) {
            return $t("profile.image_format_error");
        }
        if (msg.startsWith("Image processing failed:")) {
            return $t("profile.image_processing_failed");
        }
        if (msg.startsWith("Game binding query failed:")) {
            return $t("profile.binding_query_failed");
        }

        return msg;
    }

    $: filteredBackgrounds = availableBackgrounds.filter(bg => {
        if (!bgSearchQuery) return true;
        const query = bgSearchQuery.toLowerCase();
        const charKey = `characters.${bg.id.split('_')[0]}`;
        const trans = $t(charKey);
        const localizedName = (trans !== charKey ? trans : bg.name).toLowerCase();
        return bg.name.toLowerCase().includes(query) || localizedName.includes(query);
    });

    async function handleSelectBackground(bgId) {
        try {
            const token = await $user.getIdToken();
            await updateUserProfile(token, profile.name, { backgroundId: bgId || null });
            profile.background = bgId || null;
            profile.backgroundId = bgId || null;
            addNotification("success", $t("profile.background_updated"));
        } catch (e) {
            addNotification("error", translateBackendError(e.message));
        }
    }

    async function handleSelectRecordsUid(recordsUid) {
        if (!activeAccount) return;
        try {
            const token = await $user.getIdToken();
            if (recordsUid) {
                const targetAccount = ($accounts || []).find(a => a.id === recordsUid || (a.serverUid && a.serverUid === recordsUid));
                const targetAccId = targetAccount ? targetAccount.id : recordsUid;
                let privateId = null;
                if (typeof window !== "undefined") {
                    privateId = localStorage.getItem(`ark_banner_private_id_${targetAccId}`) ||
                        (targetAccount?.serverUid ? localStorage.getItem(`ark_banner_private_id_${targetAccount.serverUid}`) : null) ||
                        localStorage.getItem(`ark_banner_private_id_${recordsUid}`) ||
                        localStorage.getItem("ark_banner_private_id_main") ||
                        null;
                }
                if (!privateId) {
                    addNotification("error", $t("profile.private_id_not_found"));
                    return;
                }
                await linkUserPulls(token, activeAccount.game_uid, privateId);
                activeAccount.records_uid = recordsUid;
                if (typeof window !== "undefined") {
                    localStorage.setItem(`ark_banner_linked_acc_${activeAccount.game_uid}`, targetAccId);
                }
            } else {
                await unlinkUserPulls(token, activeAccount.game_uid);
                activeAccount.records_uid = null;
                activeAccount.pulls = null;
                if (typeof window !== "undefined") {
                    localStorage.removeItem(`ark_banner_linked_acc_${activeAccount.game_uid}`);
                }
            }
            const refreshed = await getUserProfile(profile.name, token);
            if (refreshed) {
                profile = refreshed;
                if (recordsUid && refreshed.details) {
                    const refreshedAcc = refreshed.details.find(d => d.game_uid === activeAccount.game_uid);
                    if (refreshedAcc?.pulls?.profileId && typeof window !== "undefined") {
                        localStorage.setItem(`ark_banner_public_id_${recordsUid}`, refreshedAcc.pulls.profileId);
                    }
                }
            }
            addNotification("success", $t("profile.primary_account_updated"));
        } catch (e) {
            console.error("[handleSelectRecordsUid] Error:", e);
            addNotification("error", translateBackendError(e.message));
        }
    }

    $: if (profile) {
        isPrivate = profile.is_private === 1;
    }

    async function handleTogglePrivate() {
        try {
            const token = await $user.getIdToken();
            const nextPrivateVal = !isPrivate;
            await updateUserProfile(token, profile.name, { isPrivate: nextPrivateVal });
            isPrivate = nextPrivateVal;
            profile.is_private = nextPrivateVal ? 1 : 0;
            profile.isPrivate = nextPrivateVal;
            addNotification("success", $t("profile.privacy_settings_updated"));
        } catch (e) {
            addNotification("error", translateBackendError(e.message));
        }
    }

    let testEmptySlot = false;
    let selectedGameUid = null;
    let favoriteGameUid = "";

    function toggleFavorite(uid) {
        const nextFavoriteUid = favoriteGameUid === uid ? "" : uid;
        favoriteGameUid = nextFavoriteUid;
        if (typeof window !== 'undefined') {
            if (nextFavoriteUid) {
                localStorage.setItem("goyfield_favorite_game_uid", nextFavoriteUid);
            } else {
                localStorage.removeItem("goyfield_favorite_game_uid");
            }
        }
        if (nextFavoriteUid) {
            addNotification("success", $t("profile.favorite_set"));
            selectedGameUid = nextFavoriteUid;
        } else {
            addNotification("success", $t("profile.favorite_removed"));
        }
    }

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
    $: contractChars = (() => {
        const chars = activeAccount?.info?.contract?.chars || [];
        let list = [...chars];
        if (testEmptySlot && list.length > 0) {
            list[list.length - 1] = null;
        }
        while (list.length < 4) {
            list.push(null);
        }
        return list;
    })();

    let localAvatar = "";

    onMount(async () => {
        if (typeof window !== 'undefined') {
            localAvatar = localStorage.getItem("goyfield_local_avatar") || "";
            favoriteGameUid = localStorage.getItem("goyfield_favorite_game_uid") || "";
        }
        
        const unsubscribe = user.subscribe(async (u) => {
            if (u) {
                loading = true;
                const token = await u.getIdToken();
                const data = await getUserProfile(null, token);
                if (data) {
                    profile = data;
                    if (profile.details && profile.details.length > 0) {
                        const fav = favoriteGameUid;
                        const hasFav = profile.details.some(d => d.game_uid === fav);
                        const highestLevelAcc = [...profile.details].sort((a, b) => {
                            const levelA = a.info?.base?.level ?? a.level ?? 1;
                            const levelB = b.info?.base?.level ?? b.level ?? 1;
                            return levelB - levelA;
                        })[0];
                        selectedGameUid = hasFav ? fav : (highestLevelAcc?.game_uid || profile.details[0].game_uid);
                    }
                    newProfileName = profile.name || "";
                    needsRegistration = false;
                } else {
                    needsRegistration = true;
                }
                loading = false;
            } else {
                profile = null;
                needsRegistration = false;
                loading = false;
            }
        });

        return () => {
            unsubscribe();
        };
    });

    $: isPageLoading.set(loading);
    onDestroy(() => {
        isPageLoading.set(false);
    });

    async function handleGoogleLogin() {
        try {
            await login();
        } catch (e) {
            addNotification("error", $t("profile.login_failed"));
        }
    }

    async function handleRegister() {
        const trimmed = newProfileName.trim();
        if (!trimmed) {
            addNotification("error", $t("profile.name_empty_error"));
            return;
        }
        if (trimmed.length < 3 || trimmed.length > 20) {
            addNotification("error", $t("profile.name_length_error")); 
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            addNotification("error", $t("profile.name_invalid_error"));
            return;
        }
        try {
            loading = true;
            const token = await $user.getIdToken();
            
            const data = await createUserProfile(token, trimmed, false);
            profile = { ...data, details: [] };
            needsRegistration = false;
            
            if (localAvatar) {
                try {
                    const uploadResult = await uploadAvatar(token, localAvatar, "avatar.webp", trimmed);
                    if (uploadResult.nsfw) {
                        profile = {
                            ...profile,
                            picture: null,
                            avatar_strike: 1
                        };
                        localStorage.setItem("goyfield_local_avatar", localAvatar);
                        addNotification("warning", $t("profile.strike_warning"));
                    } else {
                        localAvatar = "";
                        localStorage.removeItem("goyfield_local_avatar");
                        profile = {
                            ...profile,
                            picture: uploadResult.picture,
                            avatar_strike: 0
                        };
                    }
                } catch (uploadErr) {
                    console.error("Failed to upload avatar after registration:", uploadErr);
                    addNotification("error", $t("profile.profile_created_avatar_failed") + translateBackendError(uploadErr.message));
                }
            }
            
            addNotification("success", $t("profile.profile_created"));
        } catch (e) {
            addNotification("error", translateBackendError(e.message));
        } finally {
            loading = false;
        }
    }

    async function handleUpdateName() {
        const trimmed = newProfileName.trim();
        if (!trimmed) return;
        if (trimmed === profile.name) {
            isEditingName = false;
            return;
        }
        if (trimmed.length < 3 || trimmed.length > 20) {
            addNotification("error", $t("profile.name_length_error"));
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            addNotification("error", $t("profile.name_validation_error"));
            return;
        }
        try {
            const token = await $user.getIdToken();
            const data = await updateUserProfile(token, profile.name, { newUid: trimmed });
            profile.name = data.name;
            profile.publicUid = data.name;
            isEditingName = false;
            addNotification("success", $t("profile.username_updated"));
        } catch (e) {
            addNotification("error", translateBackendError(e.message));
        }
    }

    function handleCancelEditName() {
        newProfileName = profile ? (profile.name || "") : "";
        isEditingName = false;
        showNameWarning = false;
    }

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

    function getLastSyncText(updatedAt) {
        if (!updatedAt) return "";
        const diff = Date.now() - new Date(updatedAt).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return $t("profile.last_sync", { time: $t("profile.time_just_now") });
        const hours = Math.floor(mins / 60);
        if (hours < 1) return $t("profile.last_sync", { time: $t("profile.time_mins", { n: mins }) });
        const days = Math.floor(hours / 24);
        if (days < 1) return $t("profile.last_sync", { time: $t("profile.time_hours", { n: hours }) });
        return $t("profile.last_sync", { time: $t("profile.time_days", { n: days }) });
    }


    function processAndUploadImage(file) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
        if (!allowedTypes.includes(file.type)) {
            addNotification("error", $t("profile.image_format_error"));
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new globalThis.Image();
            img.onload = function () {
                if (img.width < 128 || img.height < 128) {
                    addNotification("error", $t("profile.image_size_error"));
                    return;
                }

                cropImageSrc = event.target.result;
                cropModal.reset(img);
                showCropModal = true;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    async function handleCropSave(e) {
        const webpBase64 = e.detail;
        showCropModal = false;

        if (needsRegistration) {
            localAvatar = webpBase64;
            return;
        }

        try {
            loading = true;
            const token = await $user.getIdToken();
            const uploadResult = await uploadAvatar(token, webpBase64, "avatar.webp", profile.name);

            if (uploadResult.nsfw) {
                localAvatar = webpBase64;
                localStorage.setItem("goyfield_local_avatar", webpBase64);
                if (profile) {
                    profile = {
                        ...profile,
                        picture: null,
                        avatar_strike: 1
                    };
                }
                addNotification("warning", $t("profile.strike_warning"));
            } else {
                localAvatar = "";
                localStorage.removeItem("goyfield_local_avatar");
                if (profile) {
                    profile = {
                        ...profile,
                        picture: uploadResult.picture,
                        avatar_strike: 0
                    };
                }
                addNotification("success", $t("profile.avatar_success"));
            }
        } catch (err) {
            addNotification("error", translateBackendError(err.message));
        } finally {
            loading = false;
        }
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            processAndUploadImage(file);
        }
    }

    let syncModal;

    async function handleSync(e) {
        const { token: gameToken, server, onSuccess, onError } = e.detail;
        try {
            const authToken = await $user.getIdToken();
            await syncGameAccount(authToken, gameToken, null, server, profile.name);
            const refreshed = await getUserProfile(profile.name, authToken);
            if (refreshed) {
                profile = refreshed;
                if (profile.details && profile.details.length > 0) {
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
            syncModalOpen = false;
            addNotification("success", $t("profile.sync_success"));
            onSuccess?.(false);
        } catch (err) {
            addNotification("error", translateBackendError(err.message));
            onError?.(err);
        }
    }

    let showDeleteAccountModal = false;
    let accountToDeleteUid = null;

    function triggerDeleteAccount(gameUid) {
        accountToDeleteUid = gameUid;
        showDeleteAccountModal = true;
    }

    async function confirmDeleteAccount() {
        showDeleteAccountModal = false;
        if (!accountToDeleteUid) return;
        try {
            const token = await $user.getIdToken();
            await deleteGameAccount(token, accountToDeleteUid, profile.name);
            profile = {
                ...profile,
                details: profile.details.filter(d => d.game_uid !== accountToDeleteUid)
            };
            if (accountToDeleteUid === favoriteGameUid) {
                favoriteGameUid = "";
                if (typeof window !== 'undefined') {
                    localStorage.removeItem("goyfield_favorite_game_uid");
                }
            }
            if (selectedGameUid === accountToDeleteUid) {
                const fav = favoriteGameUid;
                const remaining = profile.details;
                const hasFav = remaining.some(d => d.game_uid === fav);
                const highestLevelAcc = [...remaining].sort((a, b) => {
                    const levelA = a.info?.base?.level ?? a.level ?? 1;
                    const levelB = b.info?.base?.level ?? b.level ?? 1;
                    return levelB - levelA;
                })[0];
                selectedGameUid = hasFav ? fav : (highestLevelAcc?.game_uid || null);
            }
            addNotification("success", $t("profile.unlink_success"));
        } catch (e) {
            addNotification("error", translateBackendError(e.message));
        } finally {
            accountToDeleteUid = null;
        }
    }
</script>

<svelte:head>
    <title>{$t("pages.profile")} - Goyfield</title>
    <meta name="description" content={$t("seo.descriptions.profile")} />
    <meta property="og:title" content={`${$t("pages.profile")} - Goyfield`} />
    <meta property="og:description" content={$t("seo.descriptions.profile")} />
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
    {:else if !$user}
        <div class="flex items-center justify-center min-h-[70vh] relative z-10" in:fade>
            <div class="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-lg text-center flex flex-col items-center">
                <h2 class="text-2xl font-bold dark:text-white text-gray-900 mb-4 font-sdk">
                    {$t("profile.sync_title")}
                </h2>
                <p class="text-sm dark:text-gray-400 text-gray-600 mb-6 leading-relaxed">
                    {$t("profile.register_subtitle")}
                </p>
                <button
                    on:click={handleGoogleLogin}
                    class="flex items-center gap-3 px-6 py-3 border border-gray-300 dark:border-[#444444] dark:bg-[#424242] dark:text-[#E4E4E4] rounded-lg hover:bg-gray-100 transition-all font-bold text-gray-700 bg-white"
                >
                    <Icon name="google" class="w-5 h-5" />
                    {$t("profile.sync_btn")}
                </button>
            </div>
        </div>
    {:else if needsRegistration}
        <div class="flex items-center justify-center min-h-[70vh] relative z-10" in:fade>
            <div class="bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-md flex flex-col items-center">
                <h2 class="text-2xl font-bold dark:text-white text-gray-900 mb-6 font-sdk">
                    {$t("profile.register_title")}
                </h2>
                <div class="relative group mb-6 w-28 h-28">
                    {#if localAvatar}
                        <button
                            type="button"
                            class="w-full h-full rounded-xl border-2 border-[#FFE145] overflow-hidden cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[#FFE145]"
                            on:click={() => showFullAvatarModal = true}
                            aria-label="View avatar"
                        >
                            <img src={localAvatar} alt="Local Avatar" class="w-full h-full object-cover" />
                        </button>
                        <button
                            type="button"
                            class="absolute bottom-1.5 right-1.5 w-7 h-7 bg-[#FFE145] hover:bg-[#ebd03e] text-gray-900 rounded-full flex items-center justify-center shadow-md transition-all scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-10 cursor-pointer focus:scale-100 focus:opacity-100 outline-none"
                            on:click|stopPropagation={() => avatarInput.click()}
                            aria-label="Change avatar"
                        >
                            <Icon name="pen" class="w-3.5 h-3.5" />
                        </button>
                    {:else}
                        <button
                            type="button"
                            class="w-full h-full rounded-xl bg-white/10 border-2 border-white/20 hover:border-[#FFE145] transition-colors flex items-center justify-center text-white/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFE145]"
                            on:click={() => avatarInput.click()}
                            aria-label="Upload avatar"
                        >
                            <span class="text-4xl">+</span>
                        </button>
                    {/if}
                    <input type="file" accept="image/*" class="hidden" bind:this={avatarInput} on:change={handleFileChange} />
                </div>

                <div class="w-full mb-6 mt-2 relative pb-6">
                    <label class="block text-sm dark:text-gray-400 text-gray-600 font-bold mb-2" for="reg-username">
                        {$t("profile.register_name")}
                    </label>
                    <input
                        id="reg-username"
                        type="text"
                        value={newProfileName}
                        on:input={handleNameInput}
                        placeholder="e.g. user69"
                        class="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-[#FFE145] transition-colors font-mono"
                    />
                    {#if showNameWarning}
                        <p class="absolute text-xs text-orange-400 font-sans w-full mt-2" transition:fade>
                            {$t("profile.name_validation_error")}
                        </p>
                    {:else}
                        <p class="absolute text-xs text-gray-400 font-sans w-full mt-2">
                            {$t("profile.name_validation_hint")}
                        </p>
                    {/if}
                </div>

                <Button
                    variant="yellow"
                    color="gray"
                    onClick={handleRegister}
                    className="w-full !p-3 !h-12 !px-0 flex items-center justify-center font-nums mt-2"
                >
                    <div slot="icon">
                        <Icon name="save" class="w-6 h-6" />
                    </div>
                    {$t("profile.register_btn")}
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
                            class="w-full h-full rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FFE145] transition-all overflow-hidden {localAvatar || getAvatarUrl(profile.picture) ? 'cursor-zoom-in' : 'cursor-pointer'}"
                            on:click={() => {
                                if (localAvatar || getAvatarUrl(profile.picture)) {
                                    showFullAvatarModal = true;
                                } else {
                                    avatarInput.click();
                                }
                            }}
                            aria-label="View avatar"
                        >
                            {#if localAvatar || getAvatarUrl(profile.picture)}
                                <img
                                    src={localAvatar || getAvatarUrl(profile.picture)}
                                    alt="User Avatar"
                                    class="w-full h-full object-cover"
                                />
                            {:else}
                                <div class="w-full h-full bg-white/10 flex items-center justify-center text-white/50 text-3xl font-bold">
                                    {profile.name ? profile.name[0].toUpperCase() : "?"}
                                </div>
                            {/if}
                        </button>
                        {#if localAvatar || getAvatarUrl(profile.picture)}
                            <button
                                type="button"
                                class="absolute bottom-1.5 right-1.5 w-7 h-7 bg-[#FFE145] hover:bg-[#ebd03e] text-gray-900 rounded-full flex items-center justify-center shadow-md transition-all scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-10 cursor-pointer focus:scale-100 focus:opacity-100 outline-none"
                                on:click|stopPropagation={() => avatarInput.click()}
                                aria-label="Change avatar"
                            >
                                <Icon name="pen" class="w-3.5 h-3.5" />
                            </button>
                        {/if}
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" class="hidden" bind:this={avatarInput} on:change={handleFileChange} />

                    <div class="flex flex-col gap-1 relative min-w-0 flex-1">
                        {#if isEditingName}
                            <div class="flex items-center gap-1 w-full">
                                <input
                                    type="text"
                                    value={newProfileName}
                                    on:input={handleNameInput}
                                    class="bg-white/10 border border-white/20 text-white rounded px-2 py-1 outline-none font-mono text-xl w-full min-w-0 max-w-[150px] sm:max-w-xs"
                                    on:keydown={(e) => { if (e.key === "Enter") handleUpdateName(); else if (e.key === "Escape") handleCancelEditName(); }}
                                />
                                <Tooltip text={$t("settings.account.cancel")}>
                                    <button
                                        on:click={handleCancelEditName}
                                        class="w-8 h-8 rounded text-gray-500 bg-[#323232] hover:bg-[#343434] flex items-center justify-center transition-colors"
                                    >
                                        <Icon name="close" class="w-4 h-4" />
                                    </button>
                                </Tooltip>
                                <Tooltip text={$t("settings.account.save")}>
                                    <button
                                        on:click={handleUpdateName}
                                        class="w-8 h-8 ml-1 rounded bg-[#FFE145] hover:bg-[#ebd03e] text-gray-900 flex items-center justify-center transition-colors"
                                    >
                                        <Icon name="save" class="w-4 h-4" />
                                    </button>
                                </Tooltip>
                            </div>
                            {#if showNameWarning}
                                <p class="absolute top-full left-0 text-[10px] text-orange-400 mt-0.5 font-sans whitespace-nowrap z-10" transition:fade>
                                    {$t("profile.name_validation_error")}
                                </p>
                            {/if}
                        {:else}
                            <div class="flex items-center gap-2">
                                <h1 class="text-3xl font-bold dark:text-white text-gray-900 font-sdk">
                                    {profile.name}
                                </h1>
                                <Tooltip text={$t("profile.edit_nickname")}>
                                    <button on:click={() => { newProfileName = profile.name || ""; isEditingName = true; }} class="text-gray-400 hover:text-white transition-colors flex items-center justify-center w-6 h-6">
                                        <Icon name="pen" class="w-4 h-4" />
                                    </button>
                                </Tooltip>
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
                        {/if}
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
                                <Tooltip
                                    text={favoriteGameUid === d.game_uid ? $t("profile.remove_favorite") : $t("profile.set_favorite")}
                                    class="absolute -top-1.5 -left-1.5 z-20 {favoriteGameUid === d.game_uid ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all"
                                >
                                    <button
                                        on:click|stopPropagation={() => toggleFavorite(d.game_uid)}
                                        class="border p-1.5 rounded-full shadow-md active:scale-95 flex items-center justify-center cursor-pointer transition-colors
                                        {favoriteGameUid === d.game_uid ? 'bg-[#F9B90C]/95 border-[#F9B90C]/50 hover:bg-[#F9B90C] text-black' : 'bg-gray-800/95 border-gray-500/50 hover:bg-gray-700 hover:border-gray-400 text-white'}"
                                    >
                                        <Icon name="favorite" class="w-4 h-4" />
                                    </button>
                                </Tooltip>

                                <Tooltip
                                    text={$t("profile.unlink_account")}
                                    class="absolute -top-1.5 -right-1.5 z-20 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <button
                                        on:click|stopPropagation={() => triggerDeleteAccount(d.game_uid)}
                                        class="bg-red-900/95 border border-red-500/50 hover:bg-red-600 hover:border-red-400 p-1.5 rounded-lg text-white shadow-md active:scale-95 flex items-center justify-center cursor-pointer"
                                    >
                                        <Icon name="trash" class="w-3.5 h-3.5" />
                                    </button>
                                </Tooltip>

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
                                                    <Icon name="success" class="w-3 h-3 text-yellow-400" />
                                                {:else}
                                                    <Icon name="copy" class="w-3 h-3 opacity-60 hover:opacity-100" />
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

                    <div class="flex flex-col items-end shrink-0">
                        <div class="flex items-center gap-2">
                            <div class="relative flex flex-col items-center shrink-0">
                                <Button variant="round" color="white" onClick={() => syncModalOpen = true}>
                                    <div class="flex items-center gap-2 px-2 py-1 font-sdk">
                                        <Icon name="refresh" class="w-4 h-4" />
                                        <span>{$t("profile.update_btn")}</span>
                                    </div>
                                </Button>
                                {#if profile.updated_at}
                                    <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] text-gray-400 font-sans font-medium text-center whitespace-nowrap">
                                        {getLastSyncText(profile.updated_at)}
                                    </span>
                                {/if}
                            </div>
                            <Button
                                variant="round"
                                color="gray"
                                onClick={() => settingsModalOpen = true}
                                className="w-10 h-10 !p-0 !h-10 !px-0 flex items-center justify-center"
                            >
                                <Icon name="settings" class="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
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

                    <div class="min-w-0 flex flex-col 2xl:col-start-1 2xl:row-start-2">
                        {#if activeAccount?.records_uid || activeAccount?.pulls}
                            <RatingCard customGameUid={activeAccount.records_uid} profileStats={activeAccount?.pulls} isProfile={true} hideBorders={!!profile?.background} />
                        {:else}
                            <div class="{!profile?.background ? 'bg-white dark:bg-[#383838] border border-white/10' : 'bg-white/5 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-xl p-5 min-w-0 flex flex-col backdrop-blur-sm shadow-sm">
                                <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] mb-4 font-sdk border-b {!profile?.background ? 'border-gray-100 dark:border-[#444444]' : 'border-gray-100/30 dark:border-[#444444]/30'} pb-3">
                                    {$t("profile.stats")}
                                </h2>
                                <div class="flex flex-col items-center h-40 justify-center text-center border border-gray-100/50 dark:border-[#444444]/50 rounded-lg bg-gray-50/20 dark:bg-[#2e2e2e]/20 text-xs text-gray-500 dark:text-gray-400 backdrop-blur-sm px-4">
                                    <Icon name="noData" class="w-8 h-8 mb-2 opacity-30" />
                                    <p class="italic">
                                        {$t("profile.bind_to_view_luck")}
                                    </p>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <!--<CrisisContract
                        contract={activeAccount.info?.contract}
                        hasBackground={!!profile?.background}
                    />-->

                    <div class="min-w-0 md:col-span-2 2xl:col-span-1 2xl:col-start-2 2xl:row-start-1 2xl:row-span-2">
                        <OperatorSection
                            {activeAccount}
                            hasBackground={!!profile?.background}
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

    <SyncModal bind:this={syncModal} isOpen={syncModalOpen} on:close={() => syncModalOpen = false} on:sync={handleSync} on:error={(e) => addNotification("error", e.detail)} />

    <SettingsModal
        isOpen={settingsModalOpen}
        {isPrivate}
        {profile}
        {activeAccount}
        {primaryAccountOptions}
        selectedRecordsAccountId={activeAccountPullsAccountId}
        {filteredBackgrounds}
        bind:bgSearchQuery
        on:close={() => settingsModalOpen = false}
        on:togglePrivate={handleTogglePrivate}
        on:selectRecordsUid={(e) => handleSelectRecordsUid(e.detail)}
        on:selectBackground={(e) => handleSelectBackground(e.detail)}
        on:logout={async () => { await logout(); settingsModalOpen = false; addNotification("success", "Logged out successfully!"); }}
    />

    <CropModal bind:this={cropModal} isOpen={showCropModal} imageSrc={cropImageSrc} on:save={handleCropSave} on:close={() => showCropModal = false} on:error={(e) => addNotification("error", e.detail)} />


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
                src={localAvatar || getAvatarUrl(profile?.picture)}
                alt="Avatar Fullsize"
                class="max-w-full max-h-[80vh] rounded-2xl border border-white/20 shadow-2xl object-contain select-text"
            />
        </div>
    </Modal>

    <ConfirmationModal
        isOpen={showDeleteAccountModal}
        title={$t("profile.confirm_unlink")}
        confirmText={$t("settings.account.deleteAccount")}
        isDestructive={true}
        on:confirm={confirmDeleteAccount}
        on:close={() => (showDeleteAccountModal = false)}
    />

</div>
