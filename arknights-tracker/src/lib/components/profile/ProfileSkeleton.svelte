<script>
</script>

<div class="space-y-6 relative z-10">
    <div class="bg-white/80 dark:bg-[#383838]/80 border border-gray-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-4">
            <div class="w-28 h-28 rounded-md bg-gray-300 dark:bg-white/10 animate-pulse shrink-0"></div>
            <div class="flex flex-col gap-2 min-w-0 flex-1">
                <div class="h-8 w-44 rounded-lg bg-gray-300 dark:bg-white/10 animate-pulse"></div>
                <div class="h-4 w-28 rounded bg-gray-200 dark:bg-white/5 animate-pulse mt-1"></div>
            </div>
        </div>

        <div class="flex flex-wrap items-center gap-4">
            <div class="w-[255px] h-[72px] rounded-xl bg-gray-200/80 dark:bg-white/10 animate-pulse"></div>
            <div class="flex items-center gap-2">
                <div class="w-28 h-10 rounded-full bg-gray-200/80 dark:bg-white/10 animate-pulse"></div>
                <div class="w-10 h-10 rounded-full bg-gray-200/80 dark:bg-white/10 animate-pulse"></div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-[360px_1fr] gap-6 items-start min-w-0">
        <div class="min-w-0 2xl:col-start-1 2xl:row-start-1">
            <div class="bg-white/80 dark:bg-[#383838]/80 border border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-sm min-w-0 flex flex-col backdrop-blur-sm">
                <div class="h-6 w-32 rounded bg-gray-300 dark:bg-white/10 animate-pulse mb-3 pb-3 border-b border-gray-100/50 dark:border-white/5"></div>
                <div class="space-y-3 px-1">
                    {#each Array(8) as _}
                        <div class="flex justify-between items-center py-1">
                            <div class="h-4 w-28 rounded bg-gray-200 dark:bg-white/5 animate-pulse"></div>
                            <div class="h-4 w-12 rounded bg-gray-200 dark:bg-white/5 animate-pulse"></div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <div class="min-w-0 flex flex-col 2xl:col-start-1 2xl:row-start-2">
            <div class="bg-white/80 dark:bg-[#383838]/80 border border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-sm min-w-0 flex flex-col backdrop-blur-sm">
                <div class="h-6 w-28 rounded bg-gray-300 dark:bg-white/10 animate-pulse mb-4 pb-3 border-b border-gray-100/50 dark:border-white/5"></div>
                <div class="h-44 rounded-lg bg-gray-200/60 dark:bg-white/5 animate-pulse"></div>
            </div>
        </div>

        <div class="min-w-0 md:col-span-2 2xl:col-span-1 2xl:col-start-2 2xl:row-start-1 2xl:row-span-2">
            <div class="bg-white/80 dark:bg-[#383838]/80 border border-gray-200 dark:border-white/10 rounded-xl p-5 flex flex-col w-full mx-auto backdrop-blur-sm shadow-sm min-w-0 overflow-hidden">
                <div class="h-6 w-36 rounded bg-gray-300 dark:bg-white/10 animate-pulse mb-4 pb-3 border-b border-gray-100/50 dark:border-white/5"></div>
                <div class="flex gap-3.5 pb-4 overflow-hidden items-center">
                    {#each Array(10) as _}
                        <div class="w-11 h-11 rounded-full bg-gray-300/80 dark:bg-white/10 animate-pulse shrink-0"></div>
                    {/each}
                </div>
                <div class="space-y-4 mt-2">
                    <div class="h-10 w-full rounded-lg bg-gray-200/80 dark:bg-white/5 animate-pulse"></div>
                    <div class="h-52 w-full rounded-xl bg-gray-200/50 dark:bg-white/5 animate-pulse"></div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {#each Array(4) as _}
                            <div class="h-20 rounded-xl bg-gray-200/50 dark:bg-white/5 animate-pulse"></div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
