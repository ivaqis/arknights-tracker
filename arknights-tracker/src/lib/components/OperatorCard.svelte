<!-- src/lib/components/OperatorCard.svelte -->
<script>
    import { t } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import Icon from "$lib/components/Icons.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Images from "$lib/components/Images.svelte";

    export let operator = {};

    let isHovered = false;

    function getRarityColor(rarity) {
        if (rarity === 6) return "#F4700C";
        if (rarity === 5) return "#F9B90C";
        if (rarity === 4) return "#9253F1";
        return "#888";
    }

    $: safeRarity = operator?.rarity || 1;
    $: rarityColor = getRarityColor(safeRarity);
    $: nameKey =
        operator.id || operator.name?.toLowerCase().replace(/\s+/g, "");

    // Локальная переменная для хранения элемента текста
    let nameElement;
    // Флаг, нужно ли показывать тултип
    let isTruncated = false;

    // Функция проверки переполнения
    function checkTruncation() {
        if (nameElement) {
            isTruncated = nameElement.scrollWidth > nameElement.clientWidth;
        }
    }

    function handleClick() {
        if (operator?.id) {
            goto(`/operators/${operator.id}`);
        }
    }
</script>

{#if operator && operator.id}
    <div
        class="relative w-[150px] h-[147px] rounded-[4px] cursor-pointer transition-all duration-200 select-none group bg-white overflow-visible"
        on:mouseenter={() => (isHovered = true)}
        on:mouseleave={() => (isHovered = false)}
        role="button"
        tabindex="0"
        on:click={handleClick}
        on:keydown={(e) => e.key === "Enter" && handleClick()}
    >
        <!-- === Hover === -->
        {#if isHovered}
            <div class="absolute -inset-[4px] z-30 pointer-events-none">
                <div
                    class="absolute top-0 left-0 w-3 h-3 border-t-[4px] border-l-[4px] border-[#FFF593] rounded-tl-md"
                ></div>
                <div
                    class="absolute top-0 right-0 w-3 h-3 border-t-[4px] border-r-[4px] border-[#FFF593] rounded-tr-md"
                ></div>
                <div
                    class="absolute bottom-0 left-0 w-3 h-3 border-b-[4px] border-l-[4px] border-[#FFF593] rounded-bl-md"
                ></div>
                <div
                    class="absolute bottom-0 right-0 w-3 h-3 border-b-[4px] border-r-[4px] border-[#FFF593] rounded-br-md"
                ></div>
            </div>
            <!-- Толщина внутренней рамки 2px, можно увеличить до 3px если хочется ярче -->
            <div
                class="absolute inset-0 border-[2px] border-white rounded-[4px] z-20 pointer-events-none drop-shadow-md"
            ></div>
        {/if}

        <!-- === Image === -->
       <div class="absolute inset-0 bottom-[21%] rounded-t-[4px] overflow-hidden bg-[#f0f0f0]">
            <Images
                id={operator.id}
                variant="operator-preview"
                size="100%"
                alt={operator.name}
                className="w-full h-full object-cover"
            />
        </div>

        <!-- === ИКОНКИ === -->
        <div
            class="absolute inset-0 z-10 pl-0.5 pt-0.5 flex flex-col gap-0 items-start pointer-events-none"
        >
            <!-- 1. Класс -->
            <div class="pointer-events-auto">
                <Tooltip
                    textKey={`classes.${operator.class}`}
                    class="flex items-center justify-center filter drop-shadow-md w-6 h-6 cursor-pointer"
                >
                    <Icon
                        name={operator.class}
                        class="w-full h-full text-white"
                    />
                </Tooltip>
            </div>

            <!-- 2. Элемент -->
            {#if operator.element}
                <div class="pointer-events-auto">
                    <Tooltip
                        textKey={`elements.${operator.element}`}
                        class="flex items-center justify-center filter drop-shadow-md w-6 h-6 cursor-pointer"
                    >
                        <Icon
                            name={operator.element}
                            class="w-full h-full text-white"
                        />
                    </Tooltip>
                </div>
            {/if}
        </div>

        <!-- === Stars === -->
        <div
            class="absolute bottom-[24px] w-full flex justify-center items-center gap-[-2px] z-20"
        >
            {#each Array(safeRarity) as _}
                <div
                    class="relative w-[20px] h-[20px] flex items-center justify-center"
                >
                    <!-- Звезда -->
                    <div
                        class="relative z-10 w-full h-full"
                        style:color={rarityColor}
                    >
                        <Icon name="strokeStar" class="w-5 h-5 fill-current" />
                    </div>
                </div>
            {/each}
        </div>

        <!-- === Name === -->
        <div
            class="absolute bottom-0 left-0 w-full h-[32px] bg-white rounded-b-[4px] z-10 flex items-center justify-center px-2 pb-0.5"
            role="none"
            on:mouseenter={checkTruncation}
        >
            <div class="w-full relative z-20 pointer-events-auto">
                <!-- Добавил cursor-pointer в class -->
                <Tooltip
                    text={isTruncated
                        ? $t(`characters.${nameKey}`) || operator.name
                        : ""}
                    class="w-full block cursor-pointer"
                >
                    <div
                        bind:this={nameElement}
                        class="font-bold text-[#1d1e1f] text-[11px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis text-center w-full"
                    >
                        {$t(`characters.${nameKey}`) || operator.name}
                    </div>
                </Tooltip>
            </div>

            <div
                class="absolute bottom-0 left-0 w-full h-[7px] rounded-b-[4px]"
                style:background-color={rarityColor}
            ></div>
        </div>
    </div>
{/if}
