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

  function handleWrapperClick(e) {
    if (e.target !== e.currentTarget) return;
    const isScrollbarX = e.offsetX > e.currentTarget.clientWidth;
    const isScrollbarY = e.offsetY > e.currentTarget.clientHeight;
    if (isScrollbarX || isScrollbarY) return;
    if (closeOnOutsideClick) close();
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

    <div class="relative z-10 w-full max-h-full flex items-center justify-center pointer-events-none">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        on:click={handleWrapperClick}
        class="pointer-events-auto w-full max-w-full max-h-[85vh] md:max-h-none overflow-y-auto rounded-2xl flex flex-col items-center justify-start md:justify-center"
      >
        <slot />
      </div>
    </div>
  </div>
{/if}
