<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "./Modal.svelte";
  import Icon from "../Icon.svelte";
  import { t } from "$lib/i18n";

  export let isOpen = false;
  export let title = "";
  export let isTableCopied = false;
  export let maxWidthClass = "max-w-sm";

  const dispatch = createEventDispatcher();

  function handleClose() {
    isOpen = false;
    dispatch("close");
  }

  function handleCopy() {
    dispatch("copy");
  }
</script>

<Modal {isOpen} on:close={handleClose}>
  <div
    class="bg-white dark:bg-[#2b2b2b] rounded-2xl w-[calc(100vw-2rem)] md:w-full {maxWidthClass} max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200 dark:border-[#444] transition-all duration-300"
  >
    <div
      class="flex items-center justify-between px-6 py-4 bg-[#21272C] text-white dark:bg-[#2C2C2C] shrink-0 select-none border-b border-gray-200/10 dark:border-white/5"
    >
      <h3 class="font-bold text-lg tracking-wide select-text">
        {title}
      </h3>
      <div class="flex items-center gap-2.5">
        <button
          on:click={handleCopy}
          class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all flex items-center gap-2 px-3 text-sm font-bold border border-white/10 shadow-sm cursor-pointer select-none"
        >
          {#if isTableCopied}
            <Icon name="success" class="w-3.5 h-3.5 text-yellow-400" />
          {:else}
            <Icon name="copy" class="w-4 h-4" />
          {/if}
          <span>{$t("common.copy") || "Copy"}</span>
        </button>
        <button
          on:click={handleClose}
          class="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all duration-200 cursor-pointer select-none"
        >
          <Icon name="close" class="w-6 h-6" />
        </button>
      </div>
    </div>

    <div
      class="overflow-auto custom-scrollbar p-0 bg-white dark:bg-[#2b2b2b]"
    >
      <slot />
    </div>
  </div>
</Modal>
