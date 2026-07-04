<script>
    export let ascension = 0;
    export let size = 34;
    export let className = "";

    const paths = [
        {
            fill: "M18.957 57L63.5112 27.9479L67.957 16L22.1297 45.6221L18.957 57Z",
            stroke: "M62.8937 27.4556L66.4656 17.8571L22.7756 46.0975L20.214 55.2848L62.8937 27.4556Z"
        },
        {
            fill: "M4 17L48.5541 46.0521L53 58L7.17262 28.3779L4 17Z",
            stroke: "M47.9366 46.5444L51.5085 56.1429L7.81857 27.9025L5.25698 18.7152L47.9366 46.5444Z"
        },
        {
            fill: "M19 41L63.5541 11.9479L68 -1.32513e-06L22.1726 29.6221L19 41Z",
            stroke: "M62.9366 11.4556L66.5085 1.85707L22.8186 30.0975L20.257 39.2848L62.9366 11.4556Z"
        },
        {
            fill: "M4 0L48.5541 29.0521L53 41L7.17262 11.3779L4 0Z",
            stroke: "M47.9366 29.5444L51.5085 39.1429L7.81857 10.9025L5.25698 1.71519L47.9366 29.5444Z"
        }
    ];
</script>

<div class="relative flex items-center justify-center shrink-0 {className}" style="width: {size}px; height: {size}px;">
    <svg
        width={size}
        height={Math.round(size * (66 / 72))}
        viewBox="0 0 72 66"
        fill="none"
        class="transition-all duration-300"
    >
        {#each paths as p, i}
            {@const isActive = i < ascension}
            
            <g class="transition-all duration-300 {isActive ? 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.35)]' : ''}">
                <path 
                    d={p.fill} 
                    fill="white" 
                    class="transition-all duration-300" 
                    opacity={isActive ? "1" : "0.25"}
                />
                <path 
                    d={p.stroke} 
                    stroke="white" 
                    stroke-width="1.5" 
                    class="transition-all duration-300" 
                    opacity={isActive ? "1" : "0.45"}
                />
            </g>
        {/each}
    </svg>
</div>