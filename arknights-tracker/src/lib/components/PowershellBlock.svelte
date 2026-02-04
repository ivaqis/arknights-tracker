<script>
  import { t } from "$lib/i18n";
  import { fade } from 'svelte/transition';

  export let script = "";

  let isCopied = false;
  let timeoutId;

  async function handleCopy() {
    if (!script) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(script);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = script;
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      isCopied = true;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => { isCopied = false; }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Не удалось скопировать автоматически. Пожалуйста, выделите текст и нажмите Ctrl+C");
    }
  }
</script>

<div class="w-full font-sans shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-[#444444] my-2">
  <div class="flex items-center justify-between bg-[#2d2d2d] px-4 py-2">
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <span class="text-xs font-bold text-gray-300 uppercase tracking-wider">PowerShell Script</span>
    </div>

    <button 
      on:click={handleCopy}
      class="flex items-center gap-2 px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors group cursor-pointer"
    >
      {#if isCopied}
        <span class="text-green-400 text-xs font-bold" in:fade={{ duration: 100 }}>
            {$t('common.copied') || 'Скопировано!'}
        </span>
        <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      {:else}
        <span class="text-gray-300 text-xs font-medium group-hover:text-white transition-colors">
            {$t('common.copy') || 'Копировать код'}
        </span>
        <svg class="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      {/if}
    </button>
  </div>

  <div class="bg-[#1e1e1e] p-4 overflow-x-auto relative group">
    <pre class="font-mono text-xs md:text-sm text-[#d4d4d4] whitespace-pre-wrap break-all selection:bg-blue-700 selection:text-white"><code>{script}</code></pre>
  </div>
</div>