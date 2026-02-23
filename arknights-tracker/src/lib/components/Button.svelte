<script>
  export let onClick = () => {};
  export let variant = "black";
  export let color = "gray";
  export let className = "";
  export let active = false;

  const colors = {
    gray: {
      border: "border-gray-300 dark:border-[#444444]",
      text: "text-gray-700 dark:text-[#E0E0E0]",
      hoverBorder: "group-hover:border-gray-400",
    },
    red: {
      border: "border-red-300 dark:border-[#7F3737]",
      text: "text-red-700 dark:text-[#EA5555]",
      hoverBorder: "group-hover:border-red-400",
    },
    green: {
      border: "border-green-300 dark:border-[#5D7F37]/75",
      text: "text-green-700 dark:text-[#55EA69]/75",
      hoverBorder: "group-hover:border-green-400",
    },
  };

  $: c = colors[color] || colors.gray;
  $: isRound = variant === "round" || variant === "roundSmall";

  const topo2Pattern = `
<svg 
      class="width="100%" 
      height="100%" min-h-[53px] " 
      viewBox="0 0 135 53" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <path d="M100.984 52.3594L105.451 43.1613L112.151 40.6062L114.943 38.0512L119.968 36.0072L123.318 33.9631L134.484 27.8311M92.3392 52.3594L100.01 41.332L101.654 37.6562L104.942 35.5558L108.777 32.4051L110.969 29.2544L115.352 28.7293L117.544 26.6288L121.38 25.5786L124.667 22.4279L131.242 15.0764M80.4521 52.3594C81.0067 52.3594 84.3339 45.1141 84.8885 44.5966C85.443 44.0791 88.2157 42.009 88.7702 42.009C89.2139 42.009 91.1733 40.9739 92.0975 40.4564V34.7637L95.4247 31.141L100.97 26.4834L103.743 23.3782L105.961 19.7556L109.288 16.133L113.17 12.5103L115.943 8.37016L118.715 5.26504H122.597M72.8876 52.3594L76.7721 41.4268L77.8819 34.659L80.1016 31.5353L85.096 29.4529L90.6452 25.2881L95.6396 21.6439L100.634 17.4791V14.3555L103.963 12.7937L107.293 10.1907L109.513 7.06711L113.952 1.34051M66.4037 52.3594L70.2972 40.3856L70.8534 32.5765L76.4156 28.9323L82.5339 23.2057L88.0961 19.5615L89.7647 14.8761L94.2145 12.7937L99.7766 7.58772L104.226 1.34051M58.8392 51.3782L63.8451 39.01V32.8259L74.4132 23.0344L78.8629 17.3657L83.8689 13.7583L88.3186 10.6662L93.8807 6.54348L96.6618 1.9054V0.359375M51.2747 51.3782V43.7194L55.5973 38.1029L56.1376 32.997L59.3795 28.9123L63.1618 25.3382L67.4844 21.7641L71.2666 19.7217L73.4279 17.1688L78.8312 13.0841L80.4521 11.0417L81.5328 8.48876C82.0731 7.80797 83.2618 6.4464 83.6941 6.4464C84.1263 6.4464 85.6752 5.42522 86.3957 4.91463L88.0166 1.34051M39.3876 51.3782L41.6377 46.7829L44.4504 42.1876L46.7005 38.1029L47.8255 34.5288L51.2007 31.4653L53.4508 27.8911L55.7009 24.8276L57.3885 20.2323L60.2011 18.1899L64.1388 16.1476L65.8264 14.1052L69.7641 11.5523L72.0142 10.0205L75.3894 5.93581L79.3271 2.87227L80.4521 1.34051M0.484375 39.4464C1.40523 43.0945 4.35195 50.1822 8.77203 49.3484C13.1921 48.5145 17.2439 45.5266 18.7172 44.1368L22.0323 39.4464L25.8999 42.5733C26.8207 43.4419 29.2149 44.7622 31.425 43.0945C34.1875 41.0098 35.845 39.9675 35.845 39.4464C35.845 39.0294 38.4234 36.1457 39.7126 34.7559L43.0277 31.1078L44.6852 29.0232L46.8952 25.8962V21.2058L52.4203 17.0365C53.157 16.3416 54.7409 14.9518 55.1829 14.9518C55.6249 14.9518 58.6821 13.5621 60.1555 12.8672L62.918 9.74025L64.5756 8.17677L70.1007 5.57097L71.7582 2.96517L73.9682 1.92285V0.359375M46.9521 14.0952C47.8428 13.6726 49.55 11.1015 50.2923 9.86881L54.7459 7.2273L58.086 5.64239L60.8695 4.58579L65.3231 0.359375" stroke="url(#paint0_linear_1342_85130)"/>
      <defs>
      <linearGradient id="paint0_linear_1342_85130" x1="2.48438" y1="26.3594" x2="134.484" y2="26.3594" gradientUnits="userSpaceOnUse">
      <stop stop-color="#D6D6D6" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#D1D1D1"/>
      </linearGradient>
      </defs>
    </svg>
  `;

  const dotsPattern = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-black opacity-20">
      <rect x="0" y="0" width="4" height="4" /> <rect x="8" y="0" width="4" height="4" /> <rect x="16" y="0" width="4" height="4" />
      <rect x="0" y="8" width="4" height="4" /> <rect x="8" y="8" width="4" height="4" /> <rect x="16" y="8" width="4" height="4" />
    </svg>
  `;

  const roundBgPattern = `
    <svg class="width="100%" 
      height="100%" opacity-[0.3]" viewBox="0 0 135 53" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <path d="M100.984 52.3594L105.451 43.1613L112.151 40.6062L114.943 38.0512L119.968 36.0072L123.318 33.9631L134.484 27.8311M92.3392 52.3594L100.01 41.332L101.654 37.6562L104.942 35.5558L108.777 32.4051L110.969 29.2544L115.352 28.7293L117.544 26.6288L121.38 25.5786L124.667 22.4279L131.242 15.0764M80.4521 52.3594C81.0067 52.3594 84.3339 45.1141 84.8885 44.5966C85.443 44.0791 88.2157 42.009 88.7702 42.009C89.2139 42.009 91.1733 40.9739 92.0975 40.4564V34.7637L95.4247 31.141L100.97 26.4834L103.743 23.3782L105.961 19.7556L109.288 16.133L113.17 12.5103L115.943 8.37016L118.715 5.26504H122.597M72.8876 52.3594L76.7721 41.4268L77.8819 34.659L80.1016 31.5353L85.096 29.4529L90.6452 25.2881L95.6396 21.6439L100.634 17.4791V14.3555L103.963 12.7937L107.293 10.1907L109.513 7.06711L113.952 1.34051M66.4037 52.3594L70.2972 40.3856L70.8534 32.5765L76.4156 28.9323L82.5339 23.2057L88.0961 19.5615L89.7647 14.8761L94.2145 12.7937L99.7766 7.58772L104.226 1.34051M58.8392 51.3782L63.8451 39.01V32.8259L74.4132 23.0344L78.8629 17.3657L83.8689 13.7583L88.3186 10.6662L93.8807 6.54348L96.6618 1.9054V0.359375M51.2747 51.3782V43.7194L55.5973 38.1029L56.1376 32.997L59.3795 28.9123L63.1618 25.3382L67.4844 21.7641L71.2666 19.7217L73.4279 17.1688L78.8312 13.0841L80.4521 11.0417L81.5328 8.48876C82.0731 7.80797 83.2618 6.4464 83.6941 6.4464C84.1263 6.4464 85.6752 5.42522 86.3957 4.91463L88.0166 1.34051M39.3876 51.3782L41.6377 46.7829L44.4504 42.1876L46.7005 38.1029L47.8255 34.5288L51.2007 31.4653L53.4508 27.8911L55.7009 24.8276L57.3885 20.2323L60.2011 18.1899L64.1388 16.1476L65.8264 14.1052L69.7641 11.5523L72.0142 10.0205L75.3894 5.93581L79.3271 2.87227L80.4521 1.34051M0.484375 39.4464C1.40523 43.0945 4.35195 50.1822 8.77203 49.3484C13.1921 48.5145 17.2439 45.5266 18.7172 44.1368L22.0323 39.4464L25.8999 42.5733C26.8207 43.4419 29.2149 44.7622 31.425 43.0945C34.1875 41.0098 35.845 39.9675 35.845 39.4464C35.845 39.0294 38.4234 36.1457 39.7126 34.7559L43.0277 31.1078L44.6852 29.0232L46.8952 25.8962V21.2058L52.4203 17.0365C53.157 16.3416 54.7409 14.9518 55.1829 14.9518C55.6249 14.9518 58.6821 13.5621 60.1555 12.8672L62.918 9.74025L64.5756 8.17677L70.1007 5.57097L71.7582 2.96517L73.9682 1.92285V0.359375M46.9521 14.0952C47.8428 13.6726 49.55 11.1015 50.2923 9.86881L54.7459 7.2273L58.086 5.64239L60.8695 4.58579L65.3231 0.359375" stroke="url(#paint0_linear_1342_85130)"/>
      <defs>
      <linearGradient id="paint0_linear_1342_85130" x1="2.48438" y1="26.3594" x2="134.484" y2="26.3594" gradientUnits="userSpaceOnUse">
      <stop stop-color="currentColor" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#D1D1D1"/>
      </linearGradient>
      </defs>
    </svg>
  `;
</script>

<button
  on:click={onClick}
  class="
    group relative flex items-center justify-center overflow-hidden transition-all active:scale-95
    {className}
    {variant === 'round'
    ? 'rounded-full border-2 bg-white dark:bg-[#383838] h-12 px-6'
    : ''}
    {variant === 'roundSmall'
    ? 'rounded-full border-2 bg-white dark:bg-[#383838] h-8 px-4 text-xs font-bold'
    : ''}
    {!isRound && variant !== 'menuButton' ? 'w-full h-14 rounded-r-md' : ''}
    {variant === 'menuButton'
    ? 'w-full h-12 rounded-r-md bg-[#2A2A2A] border-none'
    : ''}
    {isRound ? `${c.border} ${c.text} ${c.hoverBorder}` : ''}
  "
>
  {#if variant === "yellow"}
    <div class="absolute inset-0 bg-[#FFE145] z-0"></div>
    <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D4B929] z-20"></div>
    <div class="absolute top-2 right-2 z-10">{@html dotsPattern}</div>
  {:else if variant === "black2"}
    <div class="absolute inset-0 bg-[#3A3A3A] z-0"></div>
    <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#888888] z-20"></div>
    <div
      class="absolute top-0 right-0 h-full z-0 pointer-events-none mix-blend-overlay dark:opacity-[0.25]"
    >
      {@html topo2Pattern}
    </div>
  {:else if variant === "black"}
    <div class="absolute inset-0 bg-[#3A3A3A] z-0"></div>
    <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#888888] z-20"></div>
    <div
      class="absolute inset-0 z-0 pointer-events-none mix-blend-overlay dark:opacity-[0.2]"
    >
      {@html topo2Pattern}
    </div>
  {:else if isRound}
    <div
      class="absolute right-0 top-0 bottom-0 w-3/4 z-0 pointer-events-none mask-linear-fade flex justify-end overflow-hidden rounded-r-full dark:opacity-[0.2]"
    >
      {@html roundBgPattern}
    </div>
  {:else if variant === "menuButton"}
    <div class="absolute inset-0 bg-[#2A2A2A] z-0"></div>
    <div
      class="absolute right-0 top-0 bottom-0 w-3/4 z-0 pointer-events-none mask-linear-fade flex justify-end overflow-hidden rounded-r-full dark:opacity-[0.2]"
    >
      {@html topo2Pattern}
    </div>
    <div class="absolute left-0 top-0 bottom-0 w-[5px] bg-[#666] z-20"></div>
    {#if active}
      <div
        class="absolute left-[15px] top-1/2 -translate-y-1/2 h-[20px] w-[3px] bg-[#FFEE00] z-20 rounded-full shadow-[0_0_5px_#FFEE00]"
      ></div>
    {/if}
  {/if}

  {#if isRound}
    <span class="relative z-10 font-medium">
      <slot />
    </span>
  {:else if variant === "menuButton"}
    <div class="relative z-10 w-full h-full">
      <span
        class="absolute bottom-1 right-3 text-white text-lg font-normal tracking-wide"
      >
        <slot />
      </span>
    </div>
  {:else}
    <div class="relative z-10 flex items-center w-full h-full pl-5 pr-3">
      <div
        class="flex items-center justify-center w-8 h-8 mr-3  {variant ===
        'yellow'
          ? 'text-[#21272C]'
          : 'text-white'}"
      >
        <slot name="icon" />
      </div>
      <div
        class="h-6 w-px mx-0.5 {variant === 'yellow'
          ? 'bg-[#21272C]/30'
          : 'bg-white/30'}"
      ></div>
      <span
        class="ml-3 text-lg font-normal {variant === 'yellow'
          ? 'text-[#21272C]'
          : 'text-white'}"
      >
        <slot />
      </span>
    </div>
  {/if}
</button>

<style>
  .mask-linear-fade {
    -webkit-mask-image: linear-gradient(to right, transparent, black);
    mask-image: linear-gradient(to right, transparent, black);
  }
</style>
