<script>
  import { createEventDispatcher } from "svelte";
  import { fade, scale } from "svelte/transition";
  import Button from "$lib/components/Button.svelte";

  export let isOpen = false;
  export let title = "Are you sure?";
  export let description = "";
  export let confirmText = "Confirm";
  export let cancelText = "Cancel";
  export let isDestructive = false; // Если true, кнопка будет красной (если Button поддерживает)

  const dispatch = createEventDispatcher();

  function onConfirm() {
    dispatch("confirm");
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
        // Позволяем закрыть по Enter или Пробелу, если фокус на фоне
        if (e.key === 'Enter' || e.key === ' ') onClose();
    }}
></div>

    <div
      class="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100"
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      <h3 class="text-xl font-bold font-sdk text-[#21272C] mb-2">
        {title}
      </h3>

      {#if description}
        <p class="text-gray-500 text-sm mb-6 leading-relaxed">
          {description}
        </p>
      {/if}

      <div class="flex gap-3 justify-end">
        <div class="w-auto">
          <Button variant="round" color="white" onClick={onClose}>
            {cancelText}
          </Button>
        </div>
        <div class="w-auto">
          <Button
            variant="round"
            color={isDestructive ? "black" : "yellow"}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}
