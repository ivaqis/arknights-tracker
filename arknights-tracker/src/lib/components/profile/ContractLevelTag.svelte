<script>
    import Icon from "$lib/components/Icon.svelte";

    export let level = 0;
    export let className = "";

    function getContractTagStyle(lvlValue) {
        const lvl = Number(lvlValue) || 0;
        if (lvl >= 40) {
            return {
                border: "#D83742",
                bg: "linear-gradient(to right, transparent 50%, #171201 95%), radial-gradient(circle, rgba(255,255,255,0.25) 0.5px, transparent 0.5px) 0 0 / 2px 2px, linear-gradient(to left, #171201, #61201A)"
            };
        }
        if (lvl >= 20) {
            return {
                border: "#E97126",
                bg: "linear-gradient(to right, transparent 50%, #131800 95%), radial-gradient(circle, rgba(255,255,255,0.25) 0.5px, transparent 0.5px) 0 0 / 2px 2px, linear-gradient(to left, #131800, #694012)"
            };
        }
        return {
            border: "#828282",
            bg: "linear-gradient(to right, transparent 50%, #050505 95%), radial-gradient(circle, rgba(255,255,255,0.25) 0.5px, transparent 0.5px) 0 0 / 2px 2px, linear-gradient(to left, #050505, #313434)"
        };
    }

    $: tagStyle = getContractTagStyle(level);
</script>

<div 
    class="flex items-center gap-1 border px-2 py-0.5 rounded-[3px] text-[19px] font-black text-white leading-none shrink-0 h-[24px] min-w-[62px] justify-center {className}" 
    style="border-color: {tagStyle.border}; background: {tagStyle.bg};"
>
    <span>{level || 0}</span>
    <Icon name="contract2" class="w-6 h-6 text-white shrink-0" />
</div>
