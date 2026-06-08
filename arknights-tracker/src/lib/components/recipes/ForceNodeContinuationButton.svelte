<script>
    import Icons from "$lib/components/Icons.svelte";
</script>

<div class="relative rounded-full h-16 w-16 flex items-center justify-center bg-[#383838] group">
    <div
        class="absolute inset-0 border-[2px] border-white rounded-full z-30 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"
    ></div>

    <Icons
        name="eyeOpen"
        class="text-[#FDFDFD] h-[80%] w-[80%]"
    />

</div>