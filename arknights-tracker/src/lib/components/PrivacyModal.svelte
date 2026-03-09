<script>
  import { createEventDispatcher } from "svelte";
  import { fade, scale } from "svelte/transition";
  import { t } from "$lib/i18n";
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icons.svelte";

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  function onClose() {
    dispatch("close");
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
    <div 
      class="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default outline-none"
      transition:fade={{ duration: 200 }}
      role="button"
      tabindex="0"
      on:click={onClose}
      on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClose();
      }}
    ></div>

    <div
      class="relative bg-white rounded-2xl dark:bg-[#383838] dark:border-[#444444] p-6 md:p-8 w-full max-w-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      <div class="flex justify-between items-center mb-6 shrink-0 border-b border-gray-100 dark:border-[#444444] pb-4">
        <h3 class="text-2xl font-bold font-sdk dark:text-[#FDFDFD] text-[#21272C]">
          {$t("privacy.title")}
        </h3>
        <button 
          on:click={onClose}
          class="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-1"
        >
          <Icon name="close" class="w-6 h-6" />
        </button>
      </div>

      <div class="overflow-y-auto custom-scrollbar pr-3 space-y-6 text-sm dark:text-[#B7B6B3] text-gray-600 leading-relaxed flex-1">
        
        <section>
          <h4 class="text-base font-bold text-gray-900 dark:text-[#E0E0E0] mb-2">{$t("privacy.analytics_title")}</h4>
          <p>{$t("privacy.analytics_text1")}</p>
          <p class="mt-2">{$t("privacy.analytics_text2")}</p>
        </section>

        <section>
          <h4 class="text-base font-bold text-gray-900 dark:text-[#E0E0E0] mb-2">{$t("privacy.tracker_title")}</h4>
          <p>{$t("privacy.tracker_text1")}</p>
          <p class="mt-2">{$t("privacy.tracker_text2")}</p>
        </section>

        <section>
          <h4 class="text-base font-bold text-gray-900 dark:text-[#E0E0E0] mb-2">{$t("privacy.global_title")}</h4>
          <p>{$t("privacy.global_text")}</p>
        </section>

        <section>
          <h4 class="text-base font-bold text-gray-900 dark:text-[#E0E0E0] mb-2">{$t("privacy.cloud_title")}</h4>
          <p>{$t("privacy.cloud_text1")}</p>
          <p class="mt-2">{$t("privacy.cloud_text2")}</p>
        </section>

      </div>

      <div class="mt-6 pt-4 flex justify-end shrink-0 border-t border-gray-100 dark:border-[#444444]">
        <div class="w-auto min-w-[120px]">
          <Button variant="round" color="yellow" onClick={onClose}>
            {$t("privacy.close")}
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}