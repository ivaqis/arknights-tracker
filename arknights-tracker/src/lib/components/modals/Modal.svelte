<script>
  import { createEventDispatcher, onDestroy } from "svelte";
  import { fade } from "svelte/transition";

  export let isOpen = false;
  export let closeOnOutsideClick = true;
  export let closeOnEscape = true;

  const dispatch = createEventDispatcher();

  function close() {
    dispatch("close");
  }

  $: if (typeof document !== "undefined") {
    document.body.classList.toggle("overflow-hidden", isOpen);
  }

  onDestroy(() => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("overflow-hidden");
    }
  });
</script>

<svelte:window on:keydown={(e) => isOpen && closeOnEscape && e.key === "Escape" && close()} />

{#if isOpen}
  <div
    class="fixed inset-0 md:ml-[var(--sb-w)] z-[100] flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default outline-none"
      transition:fade={{ duration: 200 }}
      on:click={closeOnOutsideClick ? close : null}
    ></div>

    <div class="relative z-10 w-full flex items-center justify-center pointer-events-none">
      <div class="pointer-events-auto flex items-center justify-center">
        <slot />
      </div>
    </div>
  </div>
{/if}
