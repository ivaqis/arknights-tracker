<script>
  import { t } from "$lib/i18n";
  import { onDestroy, tick } from "svelte";
  import { browser } from "$app/environment"; // <--- 1. Импортируем флаг

  export let text = "";
  export let textKey = "";
  
  // Добавляем класс, чтобы можно было центрировать (из предыдущего ответа)
  let className = "";
  export { className as class };

  let open = false;
  let triggerEl;
  let tooltipEl;

  let top = 0;
  let left = 0;

  let raf = 0;

  $: tooltipText = textKey ? $t(textKey) : text;

  function updatePos() {
    if (!triggerEl) return;
    const r = triggerEl.getBoundingClientRect();

    left = Math.round(r.left + r.width / 2);
    top = Math.round(r.top);
  }

  function startFollow() {
    const loop = () => {
      if (!open) return;
      updatePos();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  function stopFollow() {
    // requestAnimationFrame тоже есть только в браузере, лучше проверить
    if (browser && raf) {
        cancelAnimationFrame(raf);
    }
    raf = 0;
  }

  async function show() {
    // События мыши срабатывают только в браузере, но проверка не помешает
    if (!browser) return; 

    open = true;
    await tick();

    if (tooltipEl && tooltipEl.parentNode !== document.body) {
      document.body.appendChild(tooltipEl);
    }

    updatePos();
    startFollow();

    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
  }

  function hide() {
    if (!browser) return;

    open = false;
    stopFollow();

    window.removeEventListener("scroll", updatePos, true);
    window.removeEventListener("resize", updatePos);
  }

  onDestroy(() => {
    stopFollow();
    // <--- 2. Оборачиваем удаление слушателей в проверку browser
    if (browser) {
        window.removeEventListener("scroll", updatePos, true);
        window.removeEventListener("resize", updatePos);
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

{#if open && tooltipText}
  <span
    bind:this={tooltipEl}
    class="fixed px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl
           pointer-events-none whitespace-nowrap z-[9999]"
    style="left: {left}px; top: {top}px; transform: translate(-50%, calc(-100% - 8px));"
  >
    {tooltipText}
    <span
      class="absolute top-full left-1/2 -translate-x-1/2 -mt-px
             border-4 border-transparent border-t-gray-900"
    ></span>
  </span>
{/if}
