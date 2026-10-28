<script>
  import Icon from "$lib/components/Icon.svelte";

  export let href = "";
  export let onClick = () => {};
  export let variant = "black";
  export let color = "gray";
  export let className = "";
  export let active = false;
  export let disabled = false;

  const colors = {
    gray: {
      border: "border-gray-300 dark:border-[#444444]",
      text: "text-gray-700 dark:text-[#E0E0E0]",
      hoverBorder: "hover:border-gray-500/70 dark:hover:border-[#404040]",
      hoverText: "hover:text-black dark:hover:text-white"
    },
    red: {
      border: "border-red-300 dark:border-[#7F3737]",
      text: "text-red-700 dark:text-[#EA5555]",
      hoverBorder: "hover:border-red-500/70 dark:hover:border-red-500/70",
      hoverText: "hover:text-red-900 dark:hover:text-red-300"
    },
    green: {
      border: "border-green-300 dark:border-[#5D7F37]/75",
      text: "text-green-700 dark:text-[#55EA69]/75",
      hoverBorder: "hover:border-green-500/70 dark:hover:border-green-500/70",
      hoverText: "hover:text-green-900 dark:hover:text-green-300"
    },
    yellow: {
      border: "border-[#FFE145] dark:border-[#FFE145]/70",
      text: "text-yellow-700 dark:text-[#FFE145]",
      hoverBorder: "hover:border-[#FFE145] dark:hover:border-[#FFE145]",
      hoverText: "hover:text-yellow-900 dark:hover:text-yellow-300"
    },
  };

  $: c = colors[color] || colors.gray;
  $: isRound = variant === "round" || variant === "roundSmall";

  $: buttonClasses = [
    "group relative flex items-center justify-center overflow-hidden transition-all duration-200 active:scale-95",
    variant === "round" ? "rounded-full border-2 bg-white dark:bg-[#383838] h-12 px-6" : "",
    variant === "roundSmall" ? "rounded-full border-2 bg-white dark:bg-[#383838] h-8 px-4 text-xs font-bold" : "",
    !isRound && variant !== "menuButton" ? "w-full h-14 rounded-r-md" : "",
    variant === "menuButton" ? "w-full h-12 rounded-r-md bg-[#2A2A2A] border-none" : "",
    isRound ? `${c.border} ${c.text} ${c.hoverBorder} ${c.hoverText}` : "",
    className
  ].filter(Boolean).join(" ");
</script>

{#if href}
  <a
    {href}
    on:click={disabled ? (e) => e.preventDefault() : onClick}
    class="{buttonClasses} {disabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : ''}"
  >
    {#if variant === "yellow"}
      <div class="absolute inset-0 bg-[#FFE145] hover:bg-[#FFF055] transition-colors duration-200 z-0"></div>
      <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D4B929] hover:bg-[#E5C22D] transition-colors duration-200 z-20"></div>
      <div class="absolute top-2 right-2 z-10 text-black opacity-20 pointer-events-none">
        <Icon name="buttonGrid" class="w-6 h-6" />
      </div>
    {:else if variant === "black2"}
      <div class="absolute inset-0 bg-[#3A3A3A] hover:bg-[#484848] transition-colors duration-200 z-0"></div>
      <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#888888] hover:bg-[#B0B0B0] transition-colors duration-200 z-20"></div>
      <div class="absolute top-0 right-0 h-full w-full z-0 pointer-events-none mix-blend-overlay dark:opacity-[0.25]">
        <Icon name="buttonTopo" class="w-full h-full min-h-[53px] text-[#D1D1D1]" />
      </div>
    {:else if variant === "black"}
      <div class="absolute inset-0 bg-[#3A3A3A] hover:bg-[#484848] transition-colors duration-200 z-0"></div>
      <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#888888] hover:bg-[#B0B0B0] transition-colors duration-200 z-20"></div>
      <div class="absolute inset-0 z-0 pointer-events-none mix-blend-overlay dark:opacity-[0.2]">
        <Icon name="buttonTopo" class="w-full h-full min-h-[53px] text-[#D1D1D1]" />
      </div>
    {:else if isRound}
      <div class="absolute right-0 top-0 bottom-0 w-3/4 z-0 pointer-events-none mask-linear-fade flex justify-end overflow-hidden rounded-r-full dark:opacity-[0.2]">
        <Icon name="buttonTopo" class="w-full h-full opacity-[0.3] text-[#D1D1D1]" />
      </div>
    {:else if variant === "menuButton"}
      <div class="absolute inset-0 bg-[#2A2A2A] hover:bg-[#363636] transition-colors duration-200 z-0"></div>
      <div class="absolute right-0 top-0 bottom-0 w-3/4 z-0 pointer-events-none mask-linear-fade flex justify-end overflow-hidden rounded-r-full dark:opacity-[0.2]">
        <Icon name="buttonTopo" class="w-full h-full min-h-[53px] text-[#D1D1D1]" />
      </div>
      <div class="absolute left-0 top-0 bottom-0 w-[5px] bg-[#666] hover:bg-[#888] transition-colors duration-200 z-20"></div>
      {#if active}
        <div class="absolute left-[15px] top-1/2 -translate-y-1/2 h-[20px] w-[3px] bg-[#FFEE00] z-20 rounded-full shadow-[0_0_5px_#FFEE00]"></div>
      {/if}
    {/if}

    {#if isRound}
      <span class="relative z-10 font-medium transition-all duration-200">
        <slot />
      </span>
    {:else if variant === "menuButton"}
      <div class="relative z-10 w-full h-full">
        <span class="absolute bottom-1 right-3 text-white/80 group-hover:text-white transition-colors duration-200 text-lg font-normal tracking-wide">
          <slot />
        </span>
      </div>
    {:else}
      <div class="relative z-10 flex items-center w-full h-full pl-5 pr-3">
        <div class="flex items-center justify-center w-8 h-8 mr-3 transition-colors duration-200 
          {variant === 'yellow' ? 'text-[#21272C] group-hover:text-black' : 'text-white/80 group-hover:text-white'}"
        >
          <slot name="icon" />
        </div>
        <div class="h-6 w-px mx-0.5 transition-colors duration-200 
          {variant === 'yellow' ? 'bg-[#21272C]/30 group-hover:bg-[#21272C]/50' : 'bg-white/30 group-hover:bg-white/50'}"
        ></div>
        <span class="ml-3 text-lg font-normal transition-colors duration-200 
          {variant === 'yellow' ? 'text-[#21272C] group-hover:text-black' : 'text-white/80 group-hover:text-white'}"
        >
          <slot />
        </span>
      </div>
    {/if}
  </a>
{:else}
  <button
    on:click={disabled ? null : onClick}
    {disabled}
    class="{buttonClasses} {disabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : ''}"
  >
    {#if variant === "yellow"}
      <div class="absolute inset-0 bg-[#FFE145] hover:bg-[#FFF055] transition-colors duration-200 z-0"></div>
      <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D4B929] hover:bg-[#E5C22D] transition-colors duration-200 z-20"></div>
      <div class="absolute top-2 right-2 z-10 text-black opacity-20 pointer-events-none">
        <Icon name="buttonGrid" class="w-6 h-6" />
      </div>
    {:else if variant === "black2"}
      <div class="absolute inset-0 bg-[#3A3A3A] hover:bg-[#484848] transition-colors duration-200 z-0"></div>
      <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#888888] hover:bg-[#B0B0B0] transition-colors duration-200 z-20"></div>
      <div class="absolute top-0 right-0 h-full w-full z-0 pointer-events-none mix-blend-overlay dark:opacity-[0.25]">
        <Icon name="buttonTopo" class="w-full h-full min-h-[53px] text-[#D1D1D1]" />
      </div>
    {:else if variant === "black"}
      <div class="absolute inset-0 bg-[#3A3A3A] hover:bg-[#484848] transition-colors duration-200 z-0"></div>
      <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#888888] hover:bg-[#B0B0B0] transition-colors duration-200 z-20"></div>
      <div class="absolute inset-0 z-0 pointer-events-none mix-blend-overlay dark:opacity-[0.2]">
        <Icon name="buttonTopo" class="w-full h-full min-h-[53px] text-[#D1D1D1]" />
      </div>
    {:else if isRound}
      <div class="absolute right-0 top-0 bottom-0 w-3/4 z-0 pointer-events-none mask-linear-fade flex justify-end overflow-hidden rounded-r-full dark:opacity-[0.2]">
        <Icon name="buttonTopo" class="w-full h-full opacity-[0.3] text-[#D1D1D1]" />
      </div>
    {:else if variant === "menuButton"}
      <div class="absolute inset-0 bg-[#2A2A2A] hover:bg-[#363636] transition-colors duration-200 z-0"></div>
      <div class="absolute right-0 top-0 bottom-0 w-3/4 z-0 pointer-events-none mask-linear-fade flex justify-end overflow-hidden rounded-r-full dark:opacity-[0.2]">
        <Icon name="buttonTopo" class="w-full h-full min-h-[53px] text-[#D1D1D1]" />
      </div>
      <div class="absolute left-0 top-0 bottom-0 w-[5px] bg-[#666] hover:bg-[#888] transition-colors duration-200 z-20"></div>
      {#if active}
        <div class="absolute left-[15px] top-1/2 -translate-y-1/2 h-[20px] w-[3px] bg-[#FFEE00] z-20 rounded-full shadow-[0_0_5px_#FFEE00]"></div>
      {/if}
    {/if}

    {#if isRound}
      <span class="relative z-10 font-medium transition-all duration-200">
        <slot />
      </span>
    {:else if variant === "menuButton"}
      <div class="relative z-10 w-full h-full">
        <span class="absolute bottom-1 right-3 text-white/80 group-hover:text-white transition-colors duration-200 text-lg font-normal tracking-wide">
          <slot />
        </span>
      </div>
    {:else}
      <div class="relative z-10 flex items-center w-full h-full pl-5 pr-3">
        <div class="flex items-center justify-center w-8 h-8 mr-3 transition-colors duration-200 
          {variant === 'yellow' ? 'text-[#21272C] group-hover:text-black' : 'text-white/80 group-hover:text-white'}"
        >
          <slot name="icon" />
        </div>
        <div class="h-6 w-px mx-0.5 transition-colors duration-200 
          {variant === 'yellow' ? 'bg-[#21272C]/30 group-hover:bg-[#21272C]/50' : 'bg-white/30 group-hover:bg-white/50'}"
        ></div>
        <span class="ml-3 text-lg font-normal transition-colors duration-200 
          {variant === 'yellow' ? 'text-[#21272C] group-hover:text-black' : 'text-white/80 group-hover:text-white'}"
        >
          <slot />
        </span>
      </div>
    {/if}
  </button>
{/if}

<style>
  .mask-linear-fade {
    -webkit-mask-image: linear-gradient(to right, transparent, black);
    mask-image: linear-gradient(to right, transparent, black);
  }
</style>
