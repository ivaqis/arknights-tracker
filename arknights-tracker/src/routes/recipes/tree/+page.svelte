<script>

    import BottomSheet from "$lib/components/BottomSheet.svelte";
    import Button from "$lib/components/Button.svelte";
    import FormulaSidebar from "$lib/components/recipes/FormulaSidebar.svelte";
    import FormulaTreePlate from "$lib/components/recipes/FormulaTreePlate.svelte";

    let isBottomSheetOpen = false;
    let selectedItemId = "item_plant_grass_1";
    let sidebarMode = "tree"

</script>

<div class="max-w-[100%] flex flex-col xl:flex-row">

    <div class="w-full xl:w-[calc(100%-max(470px,30%))] mr-6">

        <div class="flex flex-row gap-6 items-center mb-8 h-12">

            <Button variant="roundSmall" color="white" onClick={() => history.back()}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </Button>

            <div class="flex items-baseline flex-wrap gap-2 md:gap-3 font-sdk">
                <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
                    Recipe tree
                </h2>
            </div>

        </div>

        <div class="w-full h-[calc(100vh-144px)]">

            <FormulaTreePlate />

        </div>

    </div>

    <BottomSheet bind:isOpen={isBottomSheetOpen}>
        <div class="w-full min-h-[50vh] h-full xl:h-[calc(100vh-64px)] sticky top-8">
            <FormulaSidebar
                currentItemId={selectedItemId}
                mode="{sidebarMode}"
            />
        </div>
    </BottomSheet>

</div>