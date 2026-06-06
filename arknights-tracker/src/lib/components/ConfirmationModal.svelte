<script>
  import { createEventDispatcher } from "svelte";
  import { fade, scale } from "svelte/transition";
  import { t } from "$lib/i18n";
  
  import Button from "$lib/components/Button.svelte";

  export let isOpen = false;
  export let title = "";
  export let description = "";
  export let confirmText = "";
  export let isDestructive = false;
  export let confirmColor = "";
  export let enableInput = false; 
  export let value = ""; 
  export let placeholder = ""; 

  const dispatch = createEventDispatcher();

  function onConfirm() {
    dispatch("confirm", { value });
  }

  function onClose() {
    dispatch("close");
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default outline-none"
      transition:fade={{ duration: 200 }}
      role="button"
      tabindex="0"
      on:click={onClose}
      on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClose();
      }}
    ></div>

    <div
      class="relative bg-white rounded-2xl dark:bg-[#383838] dark:border-[#444444] p-6 w-full max-w-md shadow-2xl border border-gray-100"
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      <h3 class="text-xl font-bold font-sdk dark:text-[#FDFDFD] text-[#21272C] mb-2">
        {title}
      </h3>

      {#if description}
        <p class="text-gray-500 dark:text-[#B7B6B3] text-sm mb-4 leading-relaxed">
          {description}
        </p>
      {/if}

      {#if enableInput}
        <div class="mb-6">
            <input 
                type="text" 
                bind:value={value} 
                placeholder={placeholder}
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#555] bg-gray-50 dark:bg-[#2C2C2C] text-[#21272C] dark:text-[#FDFDFD] focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all"
                on:keydown={(e) => e.key === 'Enter' && onConfirm()} 
            />
        </div>
      {/if}

      <div class="flex gap-3 justify-end">
        <div class="w-auto">
          <Button variant="round" color="white" onClick={onClose}>
            {$t("settings.account.cancel") || "Cancel"}
          </Button>
        </div>
        <div class="w-auto">
          <Button
            variant="round"
            color={confirmColor ? confirmColor : (isDestructive ? "red" : "yellow")}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}