<script lang="ts">
    export let title: string;
</script>

<div>

    <div class="flex flex-row gap-2 mb-3 h-7 w-full">

        <div
            class="h-full w-1 rounded-full bg-[#21272C] dark:bg-[#FDFDFD]"
        ></div>

        <div class="flex items-center">

            <span class="font-sdk text-lg text-[#21272C] dark:text-[#FDFDFD]">
                {title}
            </span>

        </div>

    </div>

    <div class="flex flex-col gap-3">

        <slot/>

    </div>

</div>