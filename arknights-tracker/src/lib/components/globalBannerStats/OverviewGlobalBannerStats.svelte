<script lang="ts">
    import GlobalBannerStatParam from "$lib/components/globalBannerStats/GlobalBannerStatParam.svelte";
    import Image from "$lib/components/Image.svelte";
    import { t } from "$lib/i18n";
    import { formatCount } from "$lib/utils/textUtils";

    export let totalUsers: number;
    export let totalPulls: number;
    export let freePulls: number | null = null;
    export let oroberylSpent: number | null = null;
    export let arsenalTicketsSpent: number | null = null;
</script>

<div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100">

    <h3 class="text-lg font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD] mb-2">
        {$t("global.overview")}
    </h3>

    <div class="pt-3 space-y-3">

        <GlobalBannerStatParam
            title={$t("global.totalUsers")}
        >
            {formatCount(totalUsers)}
        </GlobalBannerStatParam>

        <GlobalBannerStatParam
            title={$t("global.totalPulls")}
        >
            {formatCount(totalPulls)}
        </GlobalBannerStatParam>

        {#if freePulls !== null}

            <GlobalBannerStatParam
                title={$t("global.freePulls")}
            >
                {formatCount(freePulls)}
            </GlobalBannerStatParam>

        {/if}

        {#if oroberylSpent !== null}

            <GlobalBannerStatParam
                title={$t("global.spent")}
            >
                <Image
                    id="oroberyl"
                    variant="currency"
                    size={20}
                />
                {formatCount(oroberylSpent)}
            </GlobalBannerStatParam>

        {/if}

        {#if arsenalTicketsSpent !== null}

            <GlobalBannerStatParam
                title={$t("global.spentArsenal")}
            >
                <Image
                    id="arsenalTicket"
                    variant="currency"
                    size={20}
                />
                {formatCount(arsenalTicketsSpent)}
            </GlobalBannerStatParam>

        {/if}

    </div>

</div>