<script>
  import { t } from "$lib/i18n";
  import { fade } from 'svelte/transition';

  import Icon from "./Icons.svelte";

  export let script = "";
  export let language = "PowerShell";

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
    }
  }
</script>

<div class="w-full font-sans shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-[#444444] my-2">
  <div class="flex items-center justify-between bg-[#2d2d2d] px-4 py-2">
    <div class="flex items-center gap-2">
      <Icon name="code" class="w-4 h-4 text-green-400" />
      <span class="text-xs font-bold text-gray-300 uppercase tracking-wider">{language}</span>
    </div>

    <button 
      on:click={handleCopy}
      class="flex items-center text-gray-300 gap-2 px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors group cursor-pointer"
    >
      {#if isCopied}
        <span class="text-green-400 text-xs font-bold" in:fade={{ duration: 100 }}>
            {$t('common.copied') || 'Copied!'}
        </span>
        <Icon name="success" class="w-3 h-3 text-green-400" />
      {:else}
        <span class="text-gray-300 text-xs font-medium group-hover:text-white transition-colors">
            {$t('common.copy') || 'Copy'}
        </span>
        <Icon name="copy" class="w-4 h-4 group-hover:text-white transition-colors" />
      {/if}
    </button>
  </div>

  <div class="bg-[#1e1e1e] p-4 overflow-x-auto relative group">
    <pre class="font-mono text-xs md:text-sm text-[#d4d4d4] whitespace-pre-wrap break-all selection:bg-blue-700 selection:text-white"><code>{script}</code></pre>
  </div>
</div>