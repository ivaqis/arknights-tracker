<script>
    import { createEventDispatcher } from "svelte";
    import { scale } from "svelte/transition";
    import { t } from "$lib/i18n";
    import { user } from "$lib/stores/cloudStore.js";
    import { addNotification } from "$lib/stores/notifications.js";
    import { attachContractVideo } from "$lib/api.js";

    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/Button.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";

    export let isOpen = false;
    export let recordId = "";
    export let videoCode = "";
    export let clearTime = 0;
    export let initialUrl = "";

    const dispatch = createEventDispatcher();

    let inputVideoUrl = "";
    let errorMessage = "";
    let isSubmitting = false;
    let copied = false;
    let copyTimeout = null;

    $: if (isOpen) {
        errorMessage = "";
        inputVideoUrl = initialUrl || "";
    }

    $: hashtag = videoCode ? `#goyfield-${videoCode}` : "";

    function formatClearTimeMinSec(seconds) {
        const sec = Number(seconds);
        if (!sec || isNaN(sec)) return $t("leaderboard.sec", { time: 0 });
        const m = Math.floor(sec / 60);
        const s = Math.round(sec % 60);
        if (m > 0 && s > 0) {
            return $t("leaderboard.min_sec", { m, s });
        }
        if (m > 0) {
            return $t("leaderboard.min", { m });
        }
        return $t("leaderboard.sec", { time: s });
    }

    function parseYouTubeVideoId(url) {
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
                return videoId;
            }
        } catch {}
        return null;
    }

    function isValidYouTubeUrl(url) {
        return !!parseYouTubeVideoId(url);
    }

    async function copyHashtag() {
        if (!hashtag) return;
        try {
            await navigator.clipboard.writeText(hashtag);
            copied = true;
            if (copyTimeout) clearTimeout(copyTimeout);
            copyTimeout = setTimeout(() => {
                copied = false;
            }, 2000);
        } catch {}
    }

    async function handleAttachVideo() {
        errorMessage = "";
        const trimmedUrl = inputVideoUrl.trim();
        if (!isValidYouTubeUrl(trimmedUrl)) {
            errorMessage = $t("contractVideo.error_invalid_url");
            return;
        }

        if (!$user) return;

        isSubmitting = true;
        try {
            const token = await $user.getIdToken();
            const res = await attachContractVideo(token, recordId, trimmedUrl);
            addNotification("success", $t("contractVideo.success_added"));
            dispatch("success", { videoUrl: res.videoUrl });
            closeModal();
        } catch (e) {
            const msg = e.message || "";
            if (msg.includes("INVALID_YOUTUBE_URL")) {
                errorMessage = $t("contractVideo.error_invalid_url");
            } else if (msg.includes("VIDEO_NOT_FOUND")) {
                errorMessage = $t("contractVideo.error_video_not_found");
            } else if (msg.includes("TAG_NOT_FOUND")) {
                errorMessage = $t("contractVideo.error_tag_not_found");
            } else if (msg.includes("VIDEO_TOO_SHORT")) {
                errorMessage = $t("contractVideo.error_video_too_short");
            } else if (msg.includes("VIDEO_TOO_LONG")) {
                errorMessage = $t("contractVideo.error_video_too_long");
            } else if (msg.includes("YOUTUBE_API_KEY_MISSING")) {
                errorMessage = $t("contractVideo.error_api_key_missing");
            } else {
                errorMessage = $t("contractVideo.error_generic");
            }
        } finally {
            isSubmitting = false;
        }
    }

    function closeModal() {
        dispatch("close");
    }
</script>

<Modal {isOpen} on:close={closeModal}>
    <div
        class="relative bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444444] rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl cursor-auto"
        transition:scale={{ duration: 200, start: 0.95 }}
    >
        <button
            type="button"
            on:click={closeModal}
            class="absolute top-4 right-4 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
        >
            <Icon name="close" class="w-6 h-6" />
        </button>

        <h3 class="text-xl font-bold font-sdk dark:text-[#FDFDFD] text-[#21272C] mb-4 select-text flex items-center gap-2">
            <Icon name="youtube" class="w-6 h-6 text-red-500 fill-current" />
            <span>{$t("contractVideo.rules_title")}</span>
        </h3>

        <div class="flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300">
            <ul class="list-disc pl-5 flex flex-col gap-2 leading-relaxed">
                <li>
                    {$t("contractVideo.rule_match_record")}
                </li>
                <li>
                    {$t("contractVideo.rule_min_duration")} {formatClearTimeMinSec(clearTime)}
                </li>
                <li>
                    {$t("contractVideo.rule_max_duration", { time: formatClearTimeMinSec(Number(clearTime || 0) + 120) })}
                </li>
                <li>
                    {$t("contractVideo.rule_privacy")}
                </li>
                <li>
                    {$t("contractVideo.rule_hashtag")}
                </li>
            </ul>

            {#if hashtag}
                <div class="flex items-center justify-between gap-3 bg-gray-100 dark:bg-[#2C2C2C] border border-gray-200 dark:border-[#444444] rounded-xl px-4 py-2.5">
                    <span class="font-mono font-bold text-sm text-[#d9a009] dark:text-[#FFE145] select-all">
                        {hashtag}
                    </span>
                    <button
                        type="button"
                        on:click={copyHashtag}
                        class="p-0.5 rounded-md bg-white dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-white transition-colors flex items-center gap-2 px-3 text-sm font-bold border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none cursor-pointer"
                    >
                        {#if copied}
                            <Icon name="success" class="w-3.5 h-3.5 text-yellow-400" />
                        {:else}
                            <Icon name="copy" class="w-4 h-4" />
                        {/if}
                        <span>{$t("common.copy")}</span>
                    </button>
                </div>
            {/if}

            <div class="flex items-start gap-2.5 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 dark:text-yellow-300 text-xs leading-relaxed">
                <Icon name="warning" class="w-4 h-4 shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <span>{$t("contractVideo.warning_resync")}</span>
            </div>

            <div class="flex flex-col gap-1.5 mt-2">
                <label for="yt-url-input" class="text-xs font-bold text-gray-700 dark:text-gray-300 font-sdk select-text">
                    {$t("contractVideo.url_label")}
                </label>
                <input
                    id="yt-url-input"
                    type="text"
                    bind:value={inputVideoUrl}
                    placeholder={$t("contractVideo.url_placeholder")}
                    class="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-[#2C2C2C] border border-gray-300 dark:border-[#555] text-gray-900 dark:text-[#FDFDFD] focus:outline-none focus:ring-2 focus:ring-[#FFE145] transition-all font-sans"
                    on:keydown={(e) => e.key === 'Enter' && !isSubmitting && inputVideoUrl.trim() && handleAttachVideo()}
                />
                {#if errorMessage}
                    <span class="text-xs text-red-500 font-medium">
                        {errorMessage}
                    </span>
                {/if}
            </div>
        </div>

        <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
            <Button
                variant="round"
                color="gray"
                onClick={closeModal}
                className="!h-10 !px-5 text-xs sm:text-sm font-bold"
            >
                {$t("settings.account.cancel")}
            </Button>
            <Button
                variant="round"
                color="yellow"
                onClick={handleAttachVideo}
                disabled={isSubmitting || !inputVideoUrl.trim()}
                className="!h-10 !px-5 text-xs sm:text-sm font-bold"
            >
                {isSubmitting ? $t("contractVideo.saving") : $t("settings.account.save")}
            </Button>
        </div>
    </div>
</Modal>

