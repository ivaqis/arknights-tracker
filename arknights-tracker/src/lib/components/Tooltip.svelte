<script>
  import { t } from "$lib/i18n";
  import { createEventDispatcher, onDestroy, tick } from "svelte";
  import { browser } from "$app/environment";

  const dispatch = createEventDispatcher();
  
  export let text = "";
  export let textKey = "";
  
  let className = "";
  export { className as class };

  let open = false;
  let triggerEl;
  let tooltipEl;
  let top = 0;
  let left = 0;
  let arrowLeft = 50; 
  let isFlipped = false; 
  let isTicking = false; 

  $: tooltipText = textKey ? $t(textKey) : text;

  function updatePos() {
    if (!triggerEl || !tooltipEl) return;

    const tRect = triggerEl.getBoundingClientRect();
    const tipRect = tooltipEl.getBoundingClientRect();

    let desiredTop = tRect.top - tipRect.height - 8;
    isFlipped = false;

    if (desiredTop < 10) {
        desiredTop = tRect.bottom + 8;
        isFlipped = true;
    }

    let desiredLeft = tRect.left + (tRect.width / 2) - (tipRect.width / 2);
    let maxLeft = window.innerWidth - tipRect.width - 10;
    left = Math.max(10, Math.min(desiredLeft, maxLeft));
    top = desiredTop;

    let triggerCenter = tRect.left + tRect.width / 2;
    let calculatedArrowLeft = triggerCenter - left;
    arrowLeft = Math.max(12, Math.min(calculatedArrowLeft, tipRect.width - 12));
  }

  function onScrollOrResize() {
    if (!isTicking) {
      requestAnimationFrame(() => {
        updatePos();
        isTicking = false;
      });
      isTicking = true;
    }
  }

  async function show(e) {
    if (!browser) return; 
    open = true;
    if (e) {
      dispatch(e.type, e);
    }
    await tick(); 
    if (tooltipEl && tooltipEl.parentNode !== document.body) {
      document.body.appendChild(tooltipEl);
    }
    updatePos();
    window.addEventListener("scroll", onScrollOrResize, { capture: true, passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
  }

  function hide(e) {
    if (!browser) return;
    open = false;
    if (e) {
      dispatch(e.type, e);
    }
    window.removeEventListener("scroll", onScrollOrResize, { capture: true });
    window.removeEventListener("resize", onScrollOrResize);
  }

  onDestroy(() => {
    if (browser) {
        window.removeEventListener("scroll", onScrollOrResize, { capture: true });
        window.removeEventListener("resize", onScrollOrResize);
    }
    tooltipEl?.remove();
  });
</script>

<button
  bind:this={triggerEl}
  type="button"
  on:mouseenter={show}
  on:mouseleave={hide}
  on:focus={show}
  on:blur={hide}
  class="inline-flex cursor-default bg-transparent p-0 border-0 focus:outline-none {className}"
>
  <slot />
</button>

{#if open && (tooltipText || $$slots.content)}
  <span
    bind:this={tooltipEl}
    class="fixed max-w-[400px] px-3 py-1.5 bg-gray-900 dark:bg-[#1E1E1E] text-white text-xs rounded-lg shadow-xl
           pointer-events-none  z-[999999]"
    style="left: {left}px; top: {top}px;"
  >
    {#if $$slots.content}
      <slot name="content" />
    {:else}
      {tooltipText}
    {/if}
    
    {#if !isFlipped}
        <span
          class="absolute top-full -mt-px border-4 border-transparent border-t-gray-900 dark:border-t-[#1E1E1E]"
          style="left: {arrowLeft}px; transform: translateX(-50%);"
        ></span>
    {:else}
        <span
          class="absolute bottom-full -mb-px border-4 border-transparent border-b-gray-900 dark:border-b-[#1E1E1E]"
          style="left: {arrowLeft}px; transform: translateX(-50%);"
        ></span>
    {/if}
  </span>
{/if}