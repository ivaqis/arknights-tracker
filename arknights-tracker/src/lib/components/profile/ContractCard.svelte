<script>
    import { t } from "$lib/i18n.js";
    import { equipment } from "$lib/data/items/equipment.js";
    import { getRarityColor } from "$lib/utils/colorUtils.js";

    import Image from "$lib/components/Image.svelte";
    import PotentialIcon from "$lib/components/operators/PotentialIcon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Icon from "$lib/components/Icon.svelte";

    export let char = null;
    export let getOperatorData;
    export let getWeaponData;
    export let getWeaponIcon;
    export let getEquipIcon;
    export let getStaticEquipId = null;
    export let equipmentNames;

    $: isEmpty = !char || Object.keys(char).length === 0;
    $: opData = !isEmpty ? getOperatorData(char) : null;
</script>

{#if isEmpty}
    <div class="flex flex-col gap-2 border border-dashed border-gray-200/35 bg-gray-200/35 dark:bg-black/20 rounded-[4px] min-w-0 w-[84px] max-w-[84px] h-[307px] shrink-0 justify-center items-center text-white/20 select-none hover:border-white/30 hover:text-white/40 transition-all duration-300">
        <Icon name="noData" class="shrink-0 w-4 h-4" />
        <span class="text-[10px] font-sans text-gray-400">{$t("profile.empty_slot") || "Empty"}</span>
    </div>
{:else}
    <div class="flex flex-col border border-white/10 rounded-[4px] min-w-0 w-[84px] max-w-[84px] shrink-0 shadow-md relative">
        <a href="/operators/{opData.id}" class="relative w-full h-[190px] bg-white/3 overflow-hidden shrink-0 block group cursor-pointer">
            <div class="w-full h-full transition-transform duration-300 group-hover:scale-105">
                <Image id={opData.id} variant="operator-preview" className="w-full h-full object-cover" />
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#111111] to-transparent z-20 pointer-events-none"></div>
            
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="absolute top-1 right-1 z-30" on:click|stopPropagation|preventDefault>
                <Tooltip text="P{Math.max(1, (char.potential || 1)) - 1}">
                    <PotentialIcon pot={Math.max(0, (char.potential || 1) - 1)} size={32} />
                </Tooltip>
            </div>

            <div class="absolute bottom-2 left-2 z-30 flex flex-col items-start leading-none select-none">
                <span class="text-[8px] font-black text-white/70 uppercase tracking-wider" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">LV</span>
                <span class="text-[24px] font-black text-white leading-none tracking-tighter" style="text-shadow: 1px 1px 3px rgba(0,0,0,0.9);">{char.level}</span>
            </div>
        </a>

        {#if char.weapon}
            {@const weaponData = getWeaponData(char.weapon)}
            {@const weaponName = $t(`weaponsList.${weaponData?.id}`) !== `weaponsList.${weaponData?.id}` ? $t(`weaponsList.${weaponData?.id}`) : (weaponData?.name || char.weapon.id)}
            <Tooltip text={`${weaponName} R${char.weapon.refineLevel !== undefined ? char.weapon.refineLevel : 1}`}>
                <a href="/weapons/{weaponData.id}?level={char.weapon.level}&refine={char.weapon.refineLevel !== undefined ? char.weapon.refineLevel : 0}&skills={char.weapon.weaponTerms ? char.weapon.weaponTerms.join(',') : ''}" class="relative w-[96px] h-[55px] flex items-center justify-between p-1 overflow-hidden shrink-0 z-20 ml-[-12px] transition-transform duration-200 hover:scale-105 cursor-pointer block"
                   style="border: 1px solid transparent; background: linear-gradient(to right, #363634, #111111) padding-box, linear-gradient(to right, #464644, #1b1b1a) border-box;">
                    
                    <img 
                        src={getWeaponIcon(char.weapon)} 
                        alt="Weapon" 
                        class="absolute left-[45%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 object-contain pointer-events-none"
                        on:error={(e) => e.target.src = char.weapon.icon}
                    />
                    
                    <div class="flex flex-col justify-between h-full z-10 items-start">
                        <PotentialIcon pot={char.weapon.refineLevel !== undefined ? char.weapon.refineLevel : 0} size={20} />
                        <div class="flex flex-col items-start leading-none">
                            <span class="text-[7px] text-white/50 font-black">LV</span>
                            <span class="text-[16px] text-white font-nums font-black leading-none" style="text-shadow: 1px 1px 0 #111;">
                                {char.weapon.level}
                            </span>
                            <div class="w-6 h-[2px] mt-0.5 rounded" style="background-color: {getRarityColor(char.weapon.rarity)}"></div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-0.5 z-10 items-end justify-center h-full pr-0.5">
                        {#each char.weapon.weaponTerms || [] as term}
                            <div class="flex items-center gap-0.5 px-1 py-0.5 rounded-[2px]" style="background: linear-gradient(to right, #1C1C1C, #2D2D2B);">
                                <div class="w-[4px] h-[10px] rounded-full transform rotate-[40deg] border-[1.5px] transition-all duration-200 outline-none shrink-0 flex items-center justify-center bg-[#FFE145] border-[#FFE145] dark:bg-[#FFE145] dark:border-[#FFE145] shadow-sm"></div>
                                <span class="pl-0.5 text-[9px] font-black text-[#FFE145] font-nums leading-none">{term}</span>
                            </div>
                        {/each}
                    </div>
                </a>
            </Tooltip>
        {/if}

        <div class="grid grid-cols-2 gap-1 p-1 bg-[#111111] rounded-b-[4px]">
            {#each ['bodyEquip', 'armEquip', 'firstAccessory', 'secondAccessory'] as eqKey}
                {@const equip = char.equips?.[eqKey]}
                {#if equip}
                    {@const staticId = (equip.equipData && getStaticEquipId) ? getStaticEquipId(equip.equipData) : (equip.id || "")}
                    {@const tier = Math.max(0, (equip.enhanceStatus || 1) - 1)}
                    <Tooltip text={equipmentNames[staticId]?.name || equip.equipData?.name || staticId}>
                        <a href="/equipment/{staticId}" class="relative flex items-center justify-end w-[38px] h-[28px] py-0.5 pl-0.5 min-w-0 transition-transform duration-200 hover:scale-110 hover:z-20 cursor-pointer block"
                           style="border: 1px solid transparent; background: linear-gradient(to right, #101010, #1A4558) padding-box, linear-gradient(to right, #3D3F3A, #194457) border-box;">
                            
                            <div class="absolute top-0.5 left-0.5 w-[14px] h-[8px] flex items-center justify-center shrink-0">
                                <svg class="w-full h-full" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="33.3789" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 33.3789 15)" fill={tier >= 1 ? "#26BAFB" : "#8F8F8F"} />
                                    <rect x="41.8555" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 41.8555 15)" fill={tier >= 2 ? "#26BAFB" : "#8F8F8F"} />
                                    <rect x="50.3281" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 50.3281 15)" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"} />
                                    <path d="M28 17L20 29H8L0 17L8 5H20L28 17ZM14 12C11.2386 12 9 14.2386 9 17C9 19.7614 11.2386 22 14 22C16.7614 22 19 19.7614 19 17C19 14.2386 16.7614 12 14 12Z" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"} />
                                    {#if tier >= 1}
                                        <path d="M28.0068 17L20.0068 29H8.00684L4.39844 23.5859L9.8877 19.834C10.7895 21.1422 12.2978 22 14.0068 22C16.7683 22 19.0068 19.7614 19.0068 17C19.0068 15.9584 18.6885 14.9912 18.6885 14.1904L23.625 10.4453L28.0068 17Z" fill="#26BAFB" />
                                    {/if}
                                    <path d="M31 0L36.1962 9H25.8038L31 0Z" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"} />
                                    {#if tier >= 1 && tier < 3}
                                        <path d="M33.5981 4.5L36.197 9H25.8047L33.5981 4.5Z" fill="#26BAFB" />
                                    {/if}
                                </svg>
                            </div>

                            <img 
                                src={getEquipIcon(equip)} 
                                alt={eqKey} 
                                class="-mr-1 w-[30px] h-[30px] object-contain pointer-events-none shrink-0"
                                on:error={(e) => { if (equip.equipData?.iconUrl) e.target.src = equip.equipData.iconUrl; else if (equip.icon) e.target.src = equip.icon; }}
                            />
                            
                            <div class="left-0.5 w-[14px] h-[1.5px] bg-[#E3A000] absolute bottom-0.5 rounded"></div>
                        </a>
                    </Tooltip>
                {:else}
                    <div class="bg-[#101010]/60 border border-white/5 w-[38px] h-[28px] min-w-0 flex items-center justify-center">
                        <svg class="w-3 h-3 text-white/10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="2" y1="10" x2="10" y2="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                    </div>
                {/if}
            {/each}
        </div>
    </div>
{/if}