<script>
    import Icon from "$lib/components/Icon.svelte";

    export let event = null;
    export let className = "";

    $: badge = (() => {
        if (!event) return null;
        const origType = (event.originalType || "").toLowerCase();
        const type = (event.type || "").toLowerCase();
        const glassStyle =
            "bg-black/30 backdrop-blur-md border border-white/10 shadow-sm";

        if (type === "mailevent")
            return { icon: "mail", label: "Mail Event", bg: glassStyle };
        if (type === "protopass")
            return { icon: "protoPass", label: "Proto Pass", bg: glassStyle };
        if (type === "web")
            return { icon: "link", label: "Web", bg: glassStyle };
        if (type === "signin")
            return { icon: "signIn", label: "Sign-In", bg: glassStyle };
        if (type === "ingamepermanent")
            return {
                icon: "permanent",
                label: "Permanent Event",
                bg: glassStyle,
            };

        if (
            type === "weapon" ||
            type === "weap-special" ||
            type === "weap-standard" ||
            origType === "weapon" ||
            origType === "weap-special" ||
            origType === "weap-standard" ||
            event.isWeapon === true
        ) {
            return {
                icon: "atkEvent",
                label: "Arsenal Issue",
                bg: glassStyle,
            };
        }

        if (
            type === "banner" ||
            type === "standard" ||
            type === "special" ||
            type === "new-player" ||
            type === "headhunting" ||
            origType === "standard" ||
            origType === "special" ||
            origType === "new-player" ||
            origType === "banner" ||
            origType === "headhunting"
        ) {
            return {
                icon: "headhunting",
                label: "Headhunting",
                bg: glassStyle,
            };
        }

        return { icon: "clock", label: "Limited Event", bg: glassStyle };
    })();
</script>

{#if badge}
    <div
        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-white shrink-0 {badge.bg} {className}"
    >
        <Icon name={badge.icon} class="w-3.5 h-3.5" />
        <span class="text-[10px] font-bold uppercase tracking-wider opacity-90">
            {badge.label}
        </span>
    </div>
{/if}
