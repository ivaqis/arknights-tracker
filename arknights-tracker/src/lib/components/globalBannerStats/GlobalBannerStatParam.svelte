<script lang="ts">
    export let title: string;
</script>

<div class="flex justify-between items-center">

    <span class="text-gray-600 dark:text-[#E4E4E4] text-sm">
        {title}
    </span>

    <div class="flex items-center gap-1.5 font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]">
        <slot/>
    </div>

</div>