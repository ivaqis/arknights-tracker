<script>
    import TextParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxTemplate.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";

    export let styleMode;
    export let paramId; // 0 | 1 | 2 | 3

    function getEssenceColor(level) {
        if (level === 1) return "#EF4444";
        if (level === 2) return "#F97316";
        if (level === 3) return "#22C55E";
        return "";
    }

    function getLabel(level) {
        if (level === 0) return $t("stats.none") || "No Essence";
        return `${$t("stats.essence") || "Essence"} (${level}/3)`;
    }
</script>

<TextParamBoxTemplate styleMode={styleMode}>
    <div
        slot="left"
        class="w-5 h-5 flex items-center justify-center pointer-events-none"
    >
        <Icon
            name="essence"
            class="w-4 h-4 pointer-events-none"
            style="color: {getEssenceColor(paramId) || 'currentColor'}"
        />
    </div>

    {getLabel(paramId)}
</TextParamBoxTemplate>
