<script>
    export let name;

    const iconMeta = {
        "siteLogo": {
            "viewBox": "0 0 126 55",
            "width": "200",
            "height": "100",
            "fill": "none"
        },
        "siteLogo2": {
            "viewBox": "0 0 263 32",
            "width": "263",
            "height": "32",
            "fill": "none"
        },
        "discrodBig": {
            "viewBox": "0 0 81 12",
            "width": "90",
            "height": "20",
            "fill": "none"
        },
        "gitHubBig": {
            "viewBox": "0 0 62 14",
            "width": "80",
            "height": "20",
            "fill": "currentColor"
        }
    };

    const aliases = {
        "wisd": "int",
        "criticalrate": "crirate",
        "ultimatespgainscalar": "usp",
        "crystandpulsedamageincrease": "alldamagetakenscalar",
        "spelldamageincrease": "alldamagetakenscalar",
        "allskilldamageincrease": "alldamagetakenscalar",
        "sub": "alldamagetakenscalar",
        "main": "alldamagetakenscalar",
        "fireandnaturaldamageincrease": "alldamagetakenscalar",
        "healoutputincrease": "heal",
        "originiumarts": "magicdam"
    };

    $: resolvedName = aliases[name] || name;
    $: meta = iconMeta[resolvedName] || { viewBox: "0 0 24 24", fill: "none" };
    $: viewBox = meta.viewBox;
    $: width = meta.width || null;
    $: height = meta.height || null;
    $: fill = meta.fill || "none";
    $: stroke = meta.stroke || null;
    $: strokeWidth = meta.strokeWidth || null;
    $: strokeLinecap = meta.strokeLinecap || null;
    $: strokeLinejoin = meta.strokeLinejoin || null;
    $: opacity = meta.opacity || null;
</script>

<svg class={$$props.class} style={$$props.style} {viewBox} {width} {height} {fill} {stroke} stroke-width={strokeWidth} stroke-linecap={strokeLinecap} stroke-linejoin={strokeLinejoin} {opacity}>
    <use href="#{resolvedName}" {fill} {stroke} stroke-width={strokeWidth} stroke-linecap={strokeLinecap} stroke-linejoin={strokeLinejoin} />
</svg>
