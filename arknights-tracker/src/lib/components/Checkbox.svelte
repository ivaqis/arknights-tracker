<script>
  import { createEventDispatcher } from 'svelte';

  export let checked = false;
  export let disabled = false;
  export let variant = "accent"; // 'accent' | 'yellow' | 'red'
  export let align = "start"; // 'start' | 'center'
  export let label = "";
  export let labelClass = "";
  export let className = ""; // Class for the outer label wrapper
  export let checkboxClass = ""; // Override classes for the checkbox input itself
  export let checkmarkClass = ""; // Override classes for the checkmark SVG

  import Icon from "$lib/components/Icons.svelte";

  const dispatch = createEventDispatcher();

  function handleChange(event) {
    checked = event.target.checked;
    dispatch('change', checked);
  }

  const variants = {
    accent: {
      unchecked: "border-line bg-surface",
      checked: "checked:border-accent checked:bg-accent",
      checkmark: "text-[#21272C]"
    },
    yellow: {
      unchecked: "border-gray-300 bg-white dark:border-[#444444] dark:bg-[#343434]",
      checked: "checked:border-[#FFE145] checked:bg-[#FFE145] checked:dark:border-[#FFE145] checked:dark:bg-[#FFE145]",
      checkmark: "text-[#21272C]"
    },
    red: {
      unchecked: "border-gray-300 bg-white dark:border-[#444444] dark:bg-[#343434]",
      checked: "checked:border-red-500 checked:bg-red-500 checked:dark:border-red-500 checked:dark:bg-red-500",
      checkmark: "text-white"
    }
  };

  $: style = variants[variant] || variants.accent;
</script>

<label
  class="flex select-none group cursor-pointer w-fit transition-opacity {disabled ? 'opacity-50 pointer-events-none' : ''} {align === 'start' ? 'items-start gap-3' : 'items-center gap-3'} {className}"
>
  <div class="relative flex items-center {align === 'start' ? 'mt-0.5' : ''}">
    <input
      type="checkbox"
      bind:checked
      {disabled}
      on:change={handleChange}
      class="peer w-5 h-5 cursor-pointer appearance-none rounded border-2 transition-all {checkboxClass || `${style.unchecked} ${style.checked}`}"
    />
      <Icon name="success" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity {checkmarkClass || style.checkmark}" />
  </div>
  
  {#if $$slots.default}
    <slot />
  {:else if label}
    <span class="text-gray-600 dark:text-[#E0E0E0] group-hover:text-black group-hover:dark:text-[#FDFDFD] transition-colors cursor-pointer font-medium text-sm {labelClass}">
      {label}
    </span>
  {/if}
</label>
