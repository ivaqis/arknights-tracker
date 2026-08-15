<script lang="ts">
    import type { Character } from "$lib/classes/characters/Character";
    import type { Weapon } from "$lib/classes/weapons/Weapon";

    export let featuredList: (Character | Weapon)[] = [];
    export let totalCount: number = 0;
    export let freeCount: number | null = null;
    export let guaranteedCount: number | null = null;


</script>

