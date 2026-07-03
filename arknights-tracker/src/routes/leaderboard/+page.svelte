<script>
    import { onMount } from "svelte";
    import { t } from "$lib/i18n.js";
    import { fetchLeaderboard } from "$lib/api.js";
    import { user } from "$lib/stores/cloudStore.js";
    import { addNotification } from "$lib/stores/notifications.js";
    import { fade, fly } from "svelte/transition";
    import { characters } from "$lib/data/characters.js";

    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/Button.svelte";
    import ContractLevelTag from "$lib/components/profile/ContractLevelTag.svelte";
    import Select from "$lib/components/Select.svelte";

    $: serverOptions = [
        { value: 'all', label: $t('leaderboard.filter_all') },
        { value: '3', label: 'Americas/Europe' },
        { value: '2', label: 'Asia' }
    ];

    const charactersById = Object.values(characters || {}).reduce((acc, char) => {
        if (char && char.id) acc[char.id] = char;
        return acc;
    }, {});

    const charactersByApiId = Object.values(characters || {}).reduce((acc, char) => {
        if (char && char.apiId) acc[char.apiId] = char;
        return acc;
    }, {});

    let entries = [];
    let loading = true;
    let selectedEvent = "contract"; // "contract" or "monument"
    let serverFilter = "all"; // "all", "3" (Americas/Europe), "2" (Asia)

    let selectedEntry = null;

    async function loadLeaderboard() {
        loading = true;
        try {
            entries = await fetchLeaderboard(selectedEvent);
        } catch (e) {
            addNotification("error", "Failed to load leaderboard");
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadLeaderboard();
    });

    $: if (selectedEvent) {
        loadLeaderboard();
    }

    $: filteredEntries = entries.filter(e => {
        if (serverFilter === "all") return true;
        return String(e.serverId) === serverFilter;
    });

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return "0s";
        const m = Math.floor(seconds / 60);
        const s = Math.round(seconds % 60);
        if (m > 0) {
            return `${m}m ${s}s`;
        }
        return `${s}s`;
    }

    function formatRelativeTime(updatedAt) {
        if (!updatedAt) return "";
        const diff = Date.now() - new Date(updatedAt).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return $t("profile.time_just_now");
        const hours = Math.floor(mins / 60);
        if (hours < 1) return $t("profile.time_mins", { n: mins });
        const days = Math.floor(hours / 24);
        if (days < 1) return $t("profile.time_hours", { n: hours });
        return $t("profile.time_days", { n: days });
    }

    function getServerName(serverId) {
        return serverId === "2" ? "Asia" : "Americas/Europe";
    }

    function getAvatarUrl(pictureId) {
        if (pictureId) return `http://localhost:3001/uploads/${pictureId}.webp`;
        return "";
    }

    function getSvelteCharId(char) {
        if (!char) return "";
        const charId = char.charData?.id || char.id || char.charId || "";

        if (charId && charactersByApiId[charId]) {
            return charactersByApiId[charId].id;
        }

        const rawName = char.charData?.name || char.name || "";
        const nameLower = rawName.toLowerCase().trim();

        const ruMapping = {
            "эндминистратор": "endministrator1",
            "перлика": "perlica",
            "арделия": "ardelia",
            "пограничник": "pogranichnik",
            "арклайт": "arclight",
            "авивенна": "avywenna",
            "светоснежка": "snowshine",
            "чэнь цяньюй": "chenQianyu",
            "да пан": "daPan",
            "алеш": "alesh",
            "эстелла": "estella",
            "кэтчер": "catcher",
            "флюорит": "fluorite",
            "акэкури": "akekuri",
            "антал": "antal",
            "лейватейн": "laevatain",
            "ивонн": "yvonne",
            "джилберта": "gilberta",
            "эмбер": "ember",
            "ласт райт": "lastRite",
            "лифэн": "lifeng",
            "вулфгард": "wulfgard",
            "ксайхи": "xaihi",
            "ксаихи": "xaihi",
            "тангтанг": "tangtang",
            "росси": "rossi",
            "чжуань фаньи": "zhuangfy",
            "ми фу": "mifu"
        };

        if (ruMapping[nameLower]) {
            return ruMapping[nameLower];
        }

        return charId;
    }

    function mapProfessionToClass(key) {
        if (!key) return "guard";
        return key.replace("profession_", "");
    }

    function mapPropertyToElement(key) {
        if (!key) return null;
        return key.replace("char_property_", "");
    }

    function getOperatorData(char) {
        const svelteId = getSvelteCharId(char);
        const staticData = charactersById[svelteId];
        if (staticData) {
            return staticData;
        }

        return {
            id: char.charData?.avatarSqUrl || svelteId || char.id,
            name: char.charData?.name || char.name || "Operator",
            rarity: Number(char.charData?.rarity?.value || char.rarity || 4),
            class: mapProfessionToClass(char.charData?.profession?.key) || "guard",
            element: mapPropertyToElement(char.charData?.property?.key) || null
        };
    }
</script>

<div class="max-w-[1600px] mx-auto w-full pb-20">
    
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
            <h1 class="font-sdk dark:text-[#FDFDFD] text-5xl font-black text-[#21272C] mb-2">
                {$t("leaderboard.title")}
            </h1>
        </div>

        {#if !$user}
            <div class="bg-white/5 border border-white/10 px-4 py-3 rounded-xl max-w-sm flex items-center gap-3">
                <Icon name="info" class="w-5 h-5 text-[#FFE145] shrink-0" />
                <div class="text-xs text-gray-300 leading-normal">
                    {$t("leaderboard.not_synced_desc")}
                    <a href="/profile" class="text-[#FFE145] hover:underline block font-bold mt-1">
                        {$t("leaderboard.not_synced_btn")} &rarr;
                    </a>
                </div>
            </div>
        {/if}
    </div>

    <div class="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div class="flex bg-black/30 p-1 rounded-xl border border-white/5 shrink-0">
            <button
                on:click={() => selectedEvent = "contract"}
                class="px-5 py-2.5 rounded-lg text-sm font-bold font-sdk transition-colors
                {selectedEvent === 'contract' ? 'bg-[#FFE145] text-gray-900' : 'text-gray-400 hover:text-white'}"
            >
                {$t("leaderboard.contract")}
            </button>
            <button
                on:click={() => selectedEvent = "monument"}
                class="px-5 py-2.5 rounded-lg text-sm font-bold font-sdk transition-colors
                {selectedEvent === 'monument' ? 'bg-[#FFE145] text-gray-900' : 'text-gray-400 hover:text-white'}"
            >
                {$t("leaderboard.monument")}
            </button>
        </div>

        <div class="flex items-center gap-3 text-sm w-full md:w-auto">
            <Select
                options={serverOptions}
                bind:value={serverFilter}
                className="w-full md:w-48"
                variant="gray" 
            />
        </div>
    </div>

    {#if loading}
        <div class="flex items-center justify-center min-h-[40vh]">
            <Icon name="loading" class="w-10 h-10 text-[#FFE145] animate-spin" />
        </div>
    {:else if filteredEntries.length === 0}
        <div class="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-gray-500 text-sm">
            {$t("leaderboard.no_entries")}
        </div>
    {:else}
        <div class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl" in:fade>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr class="border-b border-white/10 bg-white/5 text-gray-400 text-xs tracking-wider">
                            <th class="py-4 px-6 w-20">{$t("leaderboard.rank")}</th>
                            <th class="py-4 px-6">{$t("leaderboard.operator")}</th>
                            <th class="py-4 px-6 w-24">{$t("leaderboard.level")}</th>
                            {#if selectedEvent === 'contract'}
                                <th class="py-4 px-6 w-32">{$t("leaderboard.contract_level")}</th>
                            {/if}
                            <th class="py-4 px-6 w-36">{$t("leaderboard.time")}</th>
                            <th class="py-4 px-6 w-48">{$t("leaderboard.last_update")}</th>
                            <th class="py-4 px-6">{$t("leaderboard.team")}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        {#each filteredEntries as entry, index}
                            <tr
                                on:click={() => selectedEntry = entry}
                                class="hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                                <td class="py-4 px-6">
                                    {#if index === 0}
                                        <span class="w-7 h-7 rounded-full bg-[#FFE145] text-gray-900 font-black flex items-center justify-center border-2 border-white/10 shadow-lg text-xs" title="1st Place">
                                            1
                                        </span>
                                    {:else if index === 1}
                                        <span class="w-7 h-7 rounded-full bg-[#C0C0C0] text-gray-900 font-black flex items-center justify-center border-2 border-white/10 shadow-lg text-xs" title="2nd Place">
                                            2
                                        </span>
                                    {:else if index === 2}
                                        <span class="w-7 h-7 rounded-full bg-[#CD7F32] text-white font-black flex items-center justify-center border-2 border-white/10 shadow-lg text-xs" title="3rd Place">
                                            3
                                        </span>
                                    {:else}
                                        <span class="text-gray-400 font-bold pl-2">{index + 1}</span>
                                    {/if}
                                </td>

                                <td class="py-4 px-6">
                                    <div class="flex items-center gap-3">
                                        {#if entry.user.picture && entry.user.avatar_strike === 0}
                                            <a href="/u/{entry.user.name}">
                                                <img
                                                    src={getAvatarUrl(entry.user.picture)}
                                                    alt={entry.user.name}
                                                    class="w-8 h-8 rounded-xl object-cover border border-white/10 shrink-0 hover:opacity-85 transition-opacity"
                                                />
                                            </a>
                                        {:else}
                                            <a href="/u/{entry.user.name}">
                                                <div class="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/70 font-bold text-xs shrink-0 select-none hover:bg-white/20 transition-colors">
                                                    {entry.user.name ? entry.user.name[0].toUpperCase() : "?"}
                                                </div>
                                            </a>
                                        {/if}
                                        <div class="flex items-center gap-2">
                                            <a href="/u/{entry.user.name}" class="font-bold text-white hover:text-[#FFE145] transition-colors">{entry.user.name}</a>
                                            <span class="bg-gray-200 text-gray-600 dark:bg-[#383838] dark:text-[#B0B0B0] px-1.5 py-0.5 rounded text-[9px] font-medium font-sans select-none shrink-0">
                                                {getServerName(entry.serverId)}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                <td class="py-4 px-6 text-gray-300">
                                    {entry.level}
                                </td>

                                {#if selectedEvent === 'contract'}
                                    <td class="py-4 px-6">
                                        <ContractLevelTag level={entry.contractLevel || 0} />
                                    </td>
                                {/if}

                                <td class="py-4 px-6 font-bold text-[#FFE145]">
                                    {formatTime(entry.clear_time)}
                                </td>

                                <td class="py-4 px-6 text-gray-400">
                                    {formatRelativeTime(entry.updatedAt)}
                                </td>

                                <td class="py-4 px-6">
                                    <div class="flex items-center gap-1.5">
                                        {#each (entry.chars || []).slice(0, 4) as char}
                                            {@const opData = getOperatorData(char)}
                                            <img
                                                src={opData.id.startsWith('http') ? opData.id : `/images/operators/icons/${opData.id}.png`}
                                                alt={opData.name}
                                                class="w-8 h-8 rounded bg-white/10 border border-white/10 object-cover"
                                                title={`${opData.name} (Level ${char.level || 1})`}
                                                on:error={(e) => e.target.src = '/images/operators/icons/endministrator1.png'}
                                            />
                                        {/each}
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}

    {#if selectedEntry}
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[20000] flex items-center justify-center p-4" transition:fade>
            <div class="bg-[#242424] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative" transition:fly={{ y: 50 }}>
                <button
                    on:click={() => selectedEntry = null}
                    class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <Icon name="close" class="w-6 h-6" />
                </button>

                <div class="flex items-center gap-4 border-b border-white/10 pb-4 mb-6">
                    {#if selectedEntry.user.picture && selectedEntry.user.avatar_strike === 0}
                        <a href="/u/{selectedEntry.user.name}">
                            <img
                                src={getAvatarUrl(selectedEntry.user.picture)}
                                alt={selectedEntry.user.name}
                                class="w-14 h-14 rounded-xl object-cover border border-white/10 hover:opacity-85 transition-opacity"
                            />
                        </a>
                    {:else}
                        <a href="/u/{selectedEntry.user.name}">
                            <div class="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/70 font-bold text-lg select-none hover:bg-white/20 transition-colors">
                                {selectedEntry.user.name ? selectedEntry.user.name[0].toUpperCase() : "?"}
                            </div>
                        </a>
                    {/if}
                    <div>
                        <h4 class="text-xl font-bold dark:text-white text-gray-900 font-sdk">
                            <a href="/u/{selectedEntry.user.name}" class="hover:text-[#FFE145] transition-colors">{selectedEntry.user.name}</a>
                        </h4>
                        <div class="text-xs text-gray-400 mt-1">
                            Level {selectedEntry.level} &bull; {getServerName(selectedEntry.serverId)}
                        </div>
                    </div>
                </div>

                <div class="bg-black/20 rounded-xl p-4 mb-6 text-sm border border-white/5">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-gray-400">Event:</span>
                        <span class="text-white font-bold font-sdk">
                            {selectedEvent === 'contract' ? $t("leaderboard.contract") : $t("leaderboard.monument")}
                        </span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-400">{$t("leaderboard.time")}:</span>
                        <span class="text-[#FFE145] font-black text-lg">
                            {formatTime(selectedEntry.clear_time)}
                        </span>
                    </div>
                </div>

                <h5 class="text-xs uppercase tracking-wider text-gray-400 font-black mb-3">
                    {$t("leaderboard.team")}
                </h5>
                
                <div class="grid grid-cols-2 gap-4">
                    {#each (selectedEntry.chars || []).slice(0, 4) as char}
                        {@const opData = getOperatorData(char)}
                        <div class="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                            <img
                                src={opData.id.startsWith('http') ? opData.id : `/images/operators/icons/${opData.id}.png`}
                                alt={opData.name}
                                class="w-12 h-12 rounded bg-white/10 border border-white/20 object-cover"
                                on:error={(e) => e.target.src = '/images/operators/icons/endministrator1.png'}
                            />
                            <div class="min-w-0 flex-1">
                                <div class="text-xs font-bold text-white truncate">{opData.name}</div>
                                <div class="text-[10px] text-gray-400 mt-0.5">Lvl {char.level || 1}</div>
                                <div class="text-[8px] text-[#FFE145] font-black mt-0.5">
                                    {#each Array(char.potential || 1) as _}
                                        ★
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>
