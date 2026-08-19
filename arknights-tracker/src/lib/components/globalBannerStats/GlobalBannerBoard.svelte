<script lang="ts">
    import type { Banner } from "$lib/classes/banners/Banner";
    import Image from "$lib/components/Image.svelte";
    import { t } from "$lib/i18n";
    import { fade } from "svelte/transition";

    export let banner: Banner;

    export let clickHandler: (() => void) | undefined = undefined;

    let isActive = false;
    let isUpcoming = false;
    let timeLeftStr: string | null = null;

    $: if (banner) {
        updateStatus(banner);
    }

    function updateStatus(banner: Banner) {
        const now = new Date();

        isUpcoming = banner.endTime !== null && banner.endTime < now;
        isActive = banner.startTime < now && (!banner.endTime || banner.endTime > now);

        timeLeftStr = isActive && banner.endTime ? formatTimeLeft(banner.endTime) : null;
    }

    function formatTimeLeft(endTime: Date): string | null {
        const now = Date.now();

        const diff = endTime.getTime() - now;

        if (diff <= 0) {
            return null;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),);
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0)
            return $t("timer.left_d_h", { d: days, h: hours });

        if (hours > 0)
            return $t("timer.left_h_m", { h: hours, m: minutes });

        return $t("timer.left_m", { m: minutes });
    }
</script>

<div
    role="button"
    tabindex="0"
    on:click={clickHandler}
    on:keydown={(e) => (e.key === "Enter" || e.key === " ") && clickHandler?.()}
    class="relative w-full aspect-[21/9] bg-gray-200 dark:bg-[#1E1E1E] rounded-xl overflow-hidden shadow-2xl group border border-white/50 dark:border-[#444444] select-none cursor-pointer outline-none focus:ring-4 focus:ring-[#FACC15] transition-all"
>

    <div
        class="absolute inset-0"
        in:fade={{ duration: 300 }}
    >

        <Image
            id={banner.icon}
            variant="banner-icon"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            alt={banner.name}
        />

        <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 pointer-events-none"
        ></div>

    </div>

    <div class="absolute bottom-6 left-6 right-6 z-20 pointer-events-none flex flex-col items-start gap-3">

        <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-full shadow-lg">

            <span
                class="w-2 h-2 rounded-full {
                isActive ? 'bg-[#FACC15] animate-pulse'
                    : isUpcoming ? 'bg-blue-400'
                    : 'bg-gray-400'}"
            ></span>

            <span class="text-xs font-bold text-white font-nums tracking-wide leading-none">

                {#if timeLeftStr}

                    {timeLeftStr}

                {:else}

                    {isActive ? $t("status.active") : isUpcoming ? $t("status.upcoming") : $t("status.ended")}

                {/if}

            </span>

        </div>

        <div>
            <h1 class="text-2xl md:text-4xl font-sdk font-bold text-white leading-tight drop-shadow-lg">
                {$t(`banners.${banner.id}`)}
            </h1>
        </div>

    </div>

</div>