<script>
    import { t } from "$lib/i18n";
    import CodeBlock from "$lib/components/CodeBlock.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import {
        powerShellScript,
        powerShellScript2,
        powerShellScript3,
        browserBookmarklet,
        toolsdevBookmarklet
    } from "$lib/config/importScripts";

    export let platformTab = "pc-web";

    $: iosSteps = [
        { text: $t("import.ios_step1") },
        { text: $t("import.ios_step2") },
        { text: $t("import.ios_step3"), subList: [$t("import.ios_step3_1"), $t("import.ios_step3_2"), $t("import.ios_step3_3")] },
        { text: $t("import.ios_step4") },
        { text: $t("import.ios_step5") },
        { text: $t("import.ios_step6") },
        { text: $t("import.ios_step7") },
        { text: $t("import.ios_step8") },
        { text: $t("import.ios_step9") },
        { text: $t("import.ios_step10") },
        { text: $t("import.ios_step11") },
        { text: $t("import.ios_step12") }
    ];

    $: androidSteps = [
        { text: $t("import.android_s1") },
        { text: $t("import.android_s2") },
        { text: $t("import.android_s3"), subList: [$t("import.android_s3_sub1"), $t("import.android_s3_sub2"), $t("import.android_s3_sub3")] },
        { text: $t("import.android_s4") },
        { text: $t("import.android_s5") },
        { text: $t("import.android_s6") },
        { text: $t("import.android_s7") },
        { text: $t("import.android_s8") },
        { text: $t("import.android_s9") },
        { text: $t("import.android_s10") },
        { text: $t("import.android_s11") }
    ];
</script>

{#if platformTab === "android"}
    <div
        class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-600/30 border border-yellow-100 dark:border-yellow-500/20 rounded-lg flex items-start gap-3 transition-colors"
    >
        <div class="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0">
            <Icon name="info" class="w-5 h-5" />
        </div>
        <div class="text-sm text-red-900 dark:text-red-100 leading-relaxed font-medium">
            {@html $t("import.android_note")}
        </div>
    </div>
{/if}

<div class="ml-2 pt-2">
    {#if platformTab === "ios" || platformTab === "android"}
        {#each (platformTab === "ios" ? iosSteps : androidSteps) as step, i}
            {@const isLast = i === (platformTab === "ios" ? iosSteps.length - 1 : androidSteps.length - 1)}
            <div
                class="relative pl-10 {isLast ? 'border-l-2 border-transparent pb-4' : 'border-l-2 border-gray-200 dark:border-[#FDFD1F]/50 pb-10'}"
            >
                <div
                    class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
                >
                    {i + 1}
                </div>
                <div
                    class="text-lg text-[#21272C] dark:text-[#E0E0E0] pt-1 font-medium leading-relaxed max-w-4xl"
                >
                    {@html step.text}
                    {#if step.subList}
                        <ul
                            class="list-disc pl-5 mt-3 space-y-2 text-gray-600 text-base dark:border-[#444444] dark:bg-[#343434] dark:text-[#E0E0E0] bg-gray-50 p-4 rounded-lg border border-gray-100"
                        >
                            {#each step.subList as subItem}
                                <li>{@html subItem}</li>
                            {/each}
                        </ul>
                    {/if}
                </div>
            </div>
        {/each}
    {:else if platformTab === "pc1" || platformTab === "pc2" || platformTab === "pc3"}
        <div
            class="relative border-l-2 dark:border-[#FDFD1F]/50 border-gray-200 pb-1 pl-10"
        >
            <div
                class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
            >
                1
            </div>
            <div
                class="text-lg dark:text-[#E0E0E0] text-[#21272C] pt-1 font-medium leading-relaxed max-w-4xl mb-4"
            >
                {$t("import.step2_pre")}
                <Tooltip text={$t("import.ps_tooltip")}>
                    <span class="underline decoration-dotted">{$t("import.step2_ps")}</span>
                </Tooltip>
                {$t("import.step2_post")}
            </div>
            <div class="max-w-4xl">
                <CodeBlock
                    script={{
                        pc1: powerShellScript,
                        pc2: powerShellScript2,
                        pc3: powerShellScript3,
                    }[platformTab]}
                    language="POWERSHELL"
                />

                <div class="flex justify-end">
                    <a
                        href="https://github.com/ivaqis/arknights-pull-url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all italic group"
                    >
                        {#if platformTab === "pc1" || platformTab === "pc3"}
                            <span>{$t("import.script_details")}</span>
                            <Icon
                                name="sendToLink"
                                class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity"
                            />
                        {/if}
                    </a>
                </div>
            </div>
        </div>

        <div
            class="relative border-l-2 border-transparent pl-10 pb-4"
        >
            <div
                class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
            >
                2
            </div>
            <p
                class="text-lg text-[#21272C] dark:text-[#E0E0E0] font-medium pt-1"
            >
                {#if platformTab === "pc1"}
                    {$t("import.step3")}
                {:else}
                    {$t("import.android_s11")}
                {/if}
            </p>
        </div>
    {:else if platformTab === "pc-manual"}
        <div
            class="relative border-l-2 dark:border-[#FDFD1F]/50 border-gray-200 pb-10 pl-10"
        >
            <div
                class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
            >
                1
            </div>
            <div
                class="text-lg dark:text-[#E0E0E0] text-[#21272C] pt-1 font-medium leading-relaxed max-w-4xl"
            >
                {$t("import.manual_text_pre")}
                <code
                    class="select-all bg-gray-100 dark:bg-[#444] px-1.5 py-0.5 rounded font-mono text-sm"
                >%LocalAppData%\PlatformProcess\Cache\data_1</code>,
                {$t("import.manual_text_mid")}
                <span
                    class="text-blue-500 font-mono text-sm break-all"
                >"https://ef-webview.gryphline.com/...u8_token=..."</span>
                {$t("import.manual_text_post")}
            </div>
        </div>
        <div
            class="relative border-l-2 border-transparent pl-10 pb-4"
        >
            <div
                class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
            >
                2
            </div>
            <p
                class="text-lg text-[#21272C] dark:text-[#E0E0E0] font-medium pt-1"
            >
                {$t("import.step3")}
            </p>
        </div>
    {:else if platformTab === "endmin" || platformTab === "toolsdev" || platformTab === "protorig" || platformTab === "trackmypulls"}
        <div
            class="mb-6 p-3 bg-orange-50/70 dark:bg-orange-600/10 border-l-2 border-orange-500 rounded-r-lg max-w-4xl text-sm text-gray-600 dark:text-[#B7B6B3]"
        >
            <span class="font-bold text-orange-600 dark:text-orange-400">
                {$t("import.warning")}:
            </span>
            {@html $t("import.tracker_backup_warning")}
        </div>

        {#each [{ text: $t(`import.${platformTab}_step1`) }, { text: $t(`import.${platformTab}_step2`), code: platformTab === "toolsdev" ? toolsdevBookmarklet : null }, { text: $t(`import.${platformTab}_step3`) }] as step, i}
            <div
                class="relative border-l-2 pl-10 {i === 2 ? 'border-transparent pb-4' : 'border-gray-200 dark:border-[#FDFD1F]/50 pb-6'}"
            >
                <div
                    class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
                >
                    {i + 1}
                </div>
                <div
                    class="text-lg text-[#21272C] dark:text-[#E0E0E0] pt-1 font-medium leading-relaxed max-w-4xl pb-3"
                >
                    {@html step.text}
                </div>
                {#if step.code}
                    <div class="max-w-4xl mt-3 mb-2">
                        <CodeBlock
                            script={step.code}
                            language="JAVA SCRIPT"
                        />
                    </div>
                {/if}
            </div>
        {/each}
    {:else}
        <div
            class="relative border-l-2 dark:border-[#FDFD1F]/50 border-gray-200 pb-10 pl-10"
        >
            <div
                class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
            >
                1
            </div>
            <div
                class="text-lg dark:text-[#E0E0E0] text-[#21272C] pt-1 font-medium leading-relaxed max-w-4xl"
            >
                {$t("import.pc_web_step1")}
                <a
                    href="https://act.skport.com/endfield/recordBook"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 underline"
                >act.skport.com/endfield/recordBook</a>
            </div>
        </div>

        <div
            class="relative border-l-2 dark:border-[#FDFD1F]/50 border-gray-200 pb-3 pl-10"
        >
            <div
                class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
            >
                2
            </div>
            <div
                class="text-lg dark:text-[#E0E0E0] text-[#21272C] pt-1 font-medium leading-relaxed max-w-4xl mb-4"
            >
                {$t("import.pc_web_step2")}
            </div>
            <div class="max-w-4xl">
                <CodeBlock
                    script={browserBookmarklet}
                    language="JAVA SCRIPT"
                />
            </div>
        </div>

        <div
            class="relative border-l-2 dark:border-[#FDFD1F]/50 border-gray-200 pb-10 pl-10"
        >
            <div
                class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
            >
                3
            </div>
            <div
                class="text-lg dark:text-[#E0E0E0] text-[#21272C] pt-1 font-medium leading-relaxed max-w-4xl"
            >
                {$t("import.pc_web_step3")}
            </div>
        </div>

        <div class="relative border-l-2 border-transparent pl-10">
            <div
                class="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#FFE145] border-2 border-[#FFE145] shadow-sm flex items-center justify-center font-sdk font-bold text-xl text-[#21272C] z-10"
            >
                4
            </div>
            <p
                class="text-lg text-[#21272C] dark:text-[#E0E0E0] font-medium mb-4 pt-1"
            >
                {$t("import.android_s11")}
            </p>
        </div>
    {/if}
</div>
