<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { splitEquipmentView } from "$lib/stores/settings.js";
    import { t } from "$lib/i18n";
    import { weapons } from "$lib/data/weapons.js";
    import WeaponDetailsView from "$lib/components/weapons/WeaponDetailsView.svelte";

    $: id = $page.params.id;

    onMount(() => {
        if ($splitEquipmentView) {
            goto(`/weapons?id=${id}`, { replaceState: true });
        }
    });

    $: weaponName = $t(`weaponsList.${id}`) !== `weaponsList.${id}` ? $t(`weaponsList.${id}`) : (weapons[id]?.name || id);
    $: pageTitle = weaponName ? `${weaponName} - ${$t("pages.weapons")} - Goyfield` : `${$t("pages.weapons")} - Goyfield`;
    $: pageDescription = $t("seo.descriptions.weaponDetail", { name: weaponName || id });
</script>

<svelte:head>
    <title>{pageTitle}</title>
    <meta name="description" content={pageDescription} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={pageDescription} />
</svelte:head>

<WeaponDetailsView {id} showBackButton={true} />
