<script>
    import Images from "$lib/components/Images.svelte";

    export let text;
    export let iconId;
    export let iconVariant; // "building-icon"

</script>

<div class="flex flex-row min-h-10 pl-2 gap-2 w-full items-center rounded-[6px] bg-[#2f2f2f] dark:bg-[#1f1f1f]">

    {#if (iconId && iconVariant)}
        <div class="flex justify-center items-center h-8 w-8">
            <Images id={iconId} variant={iconVariant}/>
        </div>
    {/if}

    <div class="flex items-center w-full">
        <span class="font-sdk text-lg text-[#FDFDFD] dark:text-[#FDFDFD]">
            {text}
        </span>
    </div>

</div>