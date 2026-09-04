<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { splitEquipmentView } from "$lib/stores/settings.js";
    import { t } from "$lib/i18n";
    import { enemies } from "$lib/data/enemies.js";
    import { getImagePath } from "$lib/utils/imageUtils.js";
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
    $: imageUrl = `${$page.url.origin}${getImagePath(id, "enemy-icon")}`;
</script>

<svelte:head>
    <title>{pageTitle}</title>
    <meta name="description" content={pageDescription} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={pageDescription} />
    <meta property="og:image" content={imageUrl} />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={pageTitle} />
    <meta name="twitter:description" content={pageDescription} />
    <meta name="twitter:image" content={imageUrl} />
</svelte:head>

<EnemyDetailsView {id} showBackButton={true} />
