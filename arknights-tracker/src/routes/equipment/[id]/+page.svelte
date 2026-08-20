<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { splitEquipmentView } from "$lib/stores/settings.js";
    import { t } from "$lib/i18n";
    import EquipmentDetailsView from "$lib/components/equipment/EquipmentDetailsView.svelte";

    $: id = $page.params.id;

    onMount(() => {
        if ($splitEquipmentView) {
            goto(`/equipment?id=${id}`, { replaceState: true });
        }
    });
</script>

<svelte:head>
    <title>{$t("pages.equipment")} | Goyfield</title>
</svelte:head>

<EquipmentDetailsView {id} showBackButton={true} />
