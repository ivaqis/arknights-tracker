<script>
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';

  import Image from "$lib/components/Image.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Checkbox from "$lib/components/Checkbox.svelte";

  export let options = [];
  export let value = []; // Array of selected values
  export let placeholder = "Select options";
  export let variant = "white"; // 'white' | 'black'
  export let className = "";
  export let maxVisibleTags = null;
  export let resetLabel = "";

  const dispatch = createEventDispatcher();
  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
  }

  function toggleOption(optValue) {
    if (value.includes(optValue)) {
      value = value.filter(v => v !== optValue);
    } else {
      value = [...value, optValue];
    }
    dispatch('change', value);
  }

  function removeOption(e, optValue) {
    e.stopPropagation();
    value = value.filter(v => v !== optValue);
    dispatch('change', value);
  }

  function clickOutside(node) {
    const handleClick = event => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        isOpen = false;
      }
    };
    document.addEventListener('click', handleClick, true);
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  $: selectedOptions = options.filter(o => value.includes(o.value));
</script>

<div class="relative {className}" use:clickOutside>
  <div
    on:click={toggle}
    on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle()}
    role="button"
    tabindex="0"
    class="
      w-full min-h-11 py-1.5 px-3 flex items-center justify-between border rounded-xl transition text-left text-sm focus:outline-none gap-2 flex-wrap cursor-pointer select-none
      {variant === 'black'
        ? 'bg-[#363636] border-[#454545] text-white hover:bg-[#404040]'
        : 'bg-white dark:bg-[#383838] border-gray-200 dark:border-[#444] text-[#21272C] dark:text-[#E0E0E0] hover:border-gray-300 dark:hover:border-[#555]'}
    "
  >
    {#if selectedOptions.length === 0}
      <span class="text-gray-400 dark:text-[#888]">{placeholder}</span>
    {:else}
      <div class="flex flex-wrap gap-1.5 max-w-[90%]">
        {#each (maxVisibleTags ? selectedOptions.slice(0, maxVisibleTags) : selectedOptions) as opt}
          <span
            class="inline-flex items-center gap-1.5 text-[11px] font-bold pl-1.5 pr-1 py-1 rounded-md border
            {variant === 'black'
              ? 'bg-[#505050] border-[#666] text-white'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200/50 dark:border-amber-900/30'}"
          >
            {#if opt.iconId}
              <div class="w-9 h-5 rounded-sm overflow-hidden flex-shrink-0 border border-black/10 dark:border-white/10">
                <Image
                  id={opt.iconId}
                  variant="banner-mini"
                  size="100%"
                  className="w-full h-full object-cover"
                  alt={opt.label}
                />
              </div>
            {/if}
            <span>{opt.label}</span>
            <button
              type="button"
              class="hover:opacity-75 transition-opacity flex items-center justify-center"
              on:click={(e) => removeOption(e, opt.value)}
            >
              <Icon name="close" class="w-4 h-4" />
            </button>
          </span>
        {/each}

        {#if maxVisibleTags && selectedOptions.length > maxVisibleTags}
          <span
            class="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-lg border
            {variant === 'black'
              ? 'bg-[#404040] border-[#555] text-white'
              : 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-800'}"
          >
            +{selectedOptions.length - maxVisibleTags}
          </span>
        {/if}
      </div>
    {/if}

    <Icon
      name="arrowDown"
      class="w-3.5 h-3.5 transition-transform duration-200 ml-auto shrink-0 {isOpen ? 'rotate-180' : ''}"
    />
  </div>

  {#if isOpen}
    <div
      transition:slide={{ duration: 200 }}
      class="
        absolute left-0 right-0 mt-1.5 z-50 border shadow-xl rounded-xl max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar w-full
        {variant === 'black'
          ? 'bg-[#363636] border-[#454545] text-white'
          : 'bg-white dark:bg-[#383838] border-gray-100 dark:border-[#444] text-[#21272C] dark:text-[#E0E0E0]'}
      "
    >
      {#if options.length === 0}
        <div class="px-3 py-2 text-xs text-gray-400 italic">No options available</div>
      {:else}
        {#if resetLabel}
          <button
            type="button"
            disabled={value.length === 0}
            on:click={() => {
              value = [];
              dispatch('change', value);
            }}
            class="w-full text-left px-2 py-1.5 text-xs font-bold transition-colors border-b border-gray-100 dark:border-[#444] mb-1.5
              {value.length === 0
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-60'
                : 'text-[#F9B90C] hover:text-[#e0a60a] dark:text-[#FFE145] dark:hover:text-white cursor-pointer'}"
          >
            {resetLabel}
          </button>
        {/if}
        {#each options as opt}
          <div class="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-[#444] rounded-lg cursor-pointer flex">
            <Checkbox
              variant="yellow"
              align="center"
              className="w-full"
              checked={value.includes(opt.value)}
              on:change={() => toggleOption(opt.value)}
            >
              <div class="flex items-center gap-3 ml-2 text-left">
                {#if opt.iconId}
                  <div class="w-10 h-6 rounded-sm overflow-hidden flex-shrink-0 shadow-sm border border-black/10 dark:border-white/10">
                    <Image
                      id={opt.iconId}
                      variant="banner-mini"
                      size="100%"
                      className="w-full h-full object-cover"
                      alt={opt.label}
                    />
                  </div>
                {/if}
                <div class="flex flex-col leading-none">
                  <span class="text-sm dark:text-[#E0E0E0] truncate max-w-[280px]">{opt.label}</span>
                  {#if opt.subLabel}
                    <span class="text-[10px] font-mono tracking-tight mt-0.5 opacity-60 text-gray-500 dark:text-gray-300">
                      {opt.subLabel}
                    </span>
                  {/if}
                </div>
              </div>
            </Checkbox>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
