<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { splitEquipmentView } from "$lib/stores/settings.js";
    import { t } from "$lib/i18n";
    import { enemies } from "$lib/data/enemies.js";
    import EnemyDetailsView from "$lib/components/enemies/EnemyDetailsView.svelte";

    $: id = $page.params.id;

    onMount(() => {
        if ($splitEquipmentView) {
            goto(`/enemies?id=${id}`, { replaceState: true });
        }
    });

    $: enemyName = $t(`enemies.${id}`) !== `enemies.${id}` ? $t(`enemies.${id}`) : (enemies[id]?.name || id);
    $: pageTitle = enemyName ? `${enemyName} - ${$t("pages.enemies")} - Goyfield` : `${$t("pages.enemies")} - Goyfield`;
    $: pageDescription = $t("seo.descriptions.enemyDetail", { name: enemyName || id });
</script>

<svelte:head>
    <title>{pageTitle}</title>
    <meta name="description" content={pageDescription} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={pageDescription} />
</svelte:head>

<EnemyDetailsView {id} showBackButton={true} />
