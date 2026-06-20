<script>
  import { notifications, removeNotification } from "$lib/stores";
  import { fly, fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { cubicOut } from "svelte/easing";
  import { t } from "$lib/i18n";
  import Icon from "../Icon.svelte";
</script>

{#if $notifications && $notifications.length > 0}
  <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none select-none">
    {#each $notifications as notification (notification.id)}
      <div
        animate:flip={{ duration: 400, easing: cubicOut }}
        in:fly={{ y: 40, duration: 550, easing: cubicOut }}
        out:fly={{ y: 25, duration: 350, easing: cubicOut }}
        class="pointer-events-auto flex items-center justify-between gap-3 bg-white dark:bg-[#2C2C2C] border border-gray-100/80 dark:border-[#3E3E3E]/60 shadow-[0_4px_18px_rgba(0,0,0,0.05)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.25)] rounded-xl px-4 py-3 transition-all duration-300
          {notification.type === 'success' ? 'border-green-200/80 dark:border-green-900/30' : ''}
          {notification.type === 'error' ? 'border-red-200/80 dark:border-red-900/30' : ''}
          {notification.type === 'warning' ? 'border-amber-200/80 dark:border-amber-900/30' : ''}
          {notification.type === 'info' ? 'border-blue-200/80 dark:border-blue-900/30' : ''}"
      >
        <div class="flex items-center gap-3 min-w-0">
          {#if notification.type === 'success'}
            <div class="flex-shrink-0 bg-green-50 dark:bg-green-950/40 p-1.5 rounded-full flex items-center justify-center">
              <Icon name="success" class="w-[15px] h-[15px] text-green-500" />
            </div>
          {:else if notification.type === 'error'}
            <div class="flex-shrink-0 bg-red-50 dark:bg-red-950/40 p-1.5 rounded-full flex items-center justify-center">
              <Icon name="error" class="w-[15px] h-[15px] text-red-500" />
            </div>
          {:else if notification.type === 'warning'}
            <div class="flex-shrink-0 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-full flex items-center justify-center">
              <Icon name="warning" class="w-[15px] h-[15px] text-amber-500" />
            </div>
          {:else}
            <div class="flex-shrink-0 bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-full flex items-center justify-center">
              <Icon name="info" class="w-[15px] h-[15px] text-blue-500" />
            </div>
          {/if}

          <div class="flex flex-col min-w-0">
            <span class="text-sm font-bold text-gray-800 dark:text-[#E4E4E4] leading-tight break-words">
              {notification.message}
              {#if notification.subtitle}
                <span class="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md
                  {notification.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200/40 dark:border-red-900/20' : ''}
                  {notification.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-200/40 dark:border-green-900/20' : ''}
                  {notification.type === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/20' : ''}
                  {notification.type === 'info' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/40 dark:border-blue-900/20' : ''}">
                  {notification.subtitle}
                </span>
              {/if}
            </span>
          </div>
        </div>

        <button
          on:click={() => removeNotification(notification.id)}
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1 hover:bg-gray-100 dark:hover:bg-[#3E3E3E] rounded-md outline-none"
          aria-label={$t("close") || "Close"}
        >
          <Icon name="close" class="w-3.5 h-3.5" />
          <span class="hidden">{$t("close") || "Close"}</span>
        </button>
      </div>
    {/each}
  </div>
{/if}
