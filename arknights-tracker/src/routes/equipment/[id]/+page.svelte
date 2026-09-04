<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { splitEquipmentView } from "$lib/stores/settings.js";
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import { getImagePath } from "$lib/utils/imageUtils.js";
    import ruEquip from "$lib/locales/ru/equipment.json";
    import enEquip from "$lib/locales/en/equipment.json";
    import EquipmentDetailsView from "$lib/components/equipment/EquipmentDetailsView.svelte";

    $: id = $page.params.id;

    onMount(() => {
        if ($splitEquipmentView) {
            goto(`/equipment?id=${id}`, { replaceState: true });
        }
    });

    $: equipMap = $currentLocale === "ru" ? ruEquip : enEquip;
    $: itemLocale = equipMap[id] || enEquip[id] || ruEquip[id] || {};
    $: equipName = itemLocale.name || id;
    $: equipDesc = itemLocale.description || itemLocale.decoDesc || $t("seo.descriptions.equipmentDetail");
    $: pageTitle = equipName ? `${equipName} - ${$t("pages.equipment")} - Goyfield` : `${$t("pages.equipment")} - Goyfield`;
    $: imageUrl = `${$page.url.origin}${getImagePath(id, "equipment")}`;
</script>

<svelte:head>
    <title>{pageTitle}</title>
    <meta name="description" content={equipDesc} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={equipDesc} />
    <meta property="og:image" content={imageUrl} />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={pageTitle} />
    <meta name="twitter:description" content={equipDesc} />
    <meta name="twitter:image" content={imageUrl} />
</svelte:head>

<EquipmentDetailsView {id} showBackButton={true} />
