<script>
    export let name;

    const iconMeta = {
    "contract": {
        "viewBox": "0 0 30 30",
        "width": "30",
        "height": "30",
        "fill": "none"
    },
    "contract2": {
        "viewBox": "0 0 28 30",
        "width": "28",
        "height": "30",
        "fill": "none"
    },
    "star": {
        "viewBox": "0 0 14 15",
        "width": "14",
        "height": "15",
        "fill": "none"
    },
    "strokeStar": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "guaranteed": {
        "viewBox": "0 0 17 18",
        "width": "17",
        "height": "18",
        "fill": "none"
    },
    "lost": {
        "viewBox": "0 0 19 18",
        "width": "19",
        "height": "18",
        "fill": "none"
    },
    "noData": {
        "viewBox": "0 0 18 18",
        "width": "18",
        "height": "18",
        "fill": "none"
    },
    "arsenalTicket": {
        "viewBox": "0 0 35 31",
        "width": "35",
        "height": "31",
        "fill": "none"
    },
    "import": {
        "viewBox": "0 0 24 24",
        "width": "30",
        "height": "30",
        "fill": "none"
    },
    "globe": {
        "viewBox": "0 0 24 24",
        "width": "30",
        "height": "30",
        "fill": "none"
    },
    "close": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "success": {
        "viewBox": "0 0 24 24",
        "width": "15",
        "height": "15",
        "fill": "none",
        "stroke": "currentColor",
        "strokeWidth": "3.5",
        "strokeLinecap": "round",
        "strokeLinejoin": "round"
    },
    "error": {
        "viewBox": "0 0 24 24",
        "width": "15",
        "height": "15",
        "fill": "none",
        "stroke": "currentColor",
        "strokeWidth": "3.5",
        "strokeLinecap": "round",
        "strokeLinejoin": "round"
    },
    "warning": {
        "viewBox": "0 0 24 24",
        "width": "15",
        "height": "15",
        "fill": "none"
    },
    "link": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "sendToLink": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "timeline": {
        "viewBox": "0 0 27 24",
        "width": "27",
        "height": "24",
        "fill": "none"
    },
    "history": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "mainPage": {
        "viewBox": "0 0 27 24",
        "width": "27",
        "height": "24",
        "fill": "none"
    },
    "records": {
        "viewBox": "0 0 25 29",
        "width": "25",
        "height": "29",
        "fill": "none"
    },
    "operators": {
        "viewBox": "0 0 23 26",
        "width": "23",
        "height": "26",
        "fill": "none"
    },
    "settings": {
        "viewBox": "0 0 25 24",
        "width": "25",
        "height": "24",
        "fill": "none"
    },
    "ru": {
        "viewBox": "0 0 20 14",
        "width": "20",
        "height": "14",
        "fill": "none"
    },
    "en": {
        "viewBox": "0 0 20 14",
        "width": "20",
        "height": "14",
        "fill": "none"
    },
    "zh-TW": {
        "viewBox": "0 0 20 14",
        "width": "20",
        "height": "14",
        "fill": "none"
    },
    "ja": {
        "viewBox": "0 0 21 15",
        "width": "21",
        "height": "15",
        "fill": "none"
    },
    "zh-CN": {
        "viewBox": "0 0 20 14",
        "width": "20",
        "height": "14",
        "fill": "none"
    },
    "de": {
        "viewBox": "0 0 21 15",
        "width": "21",
        "height": "15",
        "fill": "none"
    },
    "id": {
        "viewBox": "0 0 21 15",
        "width": "21",
        "height": "15",
        "fill": "none"
    },
    "pt": {
        "viewBox": "0 0 21 15",
        "width": "21",
        "height": "15",
        "fill": "none"
    },
    "ko": {
        "viewBox": "0 0 21 15",
        "width": "21",
        "height": "15",
        "fill": "none"
    },
    "fr": {
        "viewBox": "0 0 21 15",
        "width": "21",
        "height": "15",
        "fill": "none"
    },
    "vi": {
        "viewBox": "0 0 21 15",
        "width": "21",
        "height": "15",
        "fill": "none"
    },
    "es": {
        "viewBox": "0 0 21 15",
        "width": "21",
        "height": "15",
        "fill": "none"
    },
    "th": {
        "viewBox": "0 0 21 15",
        "width": "21",
        "height": "15",
        "fill": "none"
    },
    "it": {
        "viewBox": "0 0 21 15",
        "width": "21",
        "height": "15",
        "fill": "none"
    },
    "cryo": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "nature": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "electric": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "heat": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "physical": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "guard": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "vanguard": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "caster": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "defender": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "supporter": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "striker": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "desc": {
        "viewBox": "0 0 20 17",
        "width": "20",
        "height": "17",
        "fill": "none"
    },
    "asc": {
        "viewBox": "0 0 20 17",
        "width": "20",
        "height": "17",
        "fill": "none"
    },
    "filter": {
        "viewBox": "0 0 22 20",
        "width": "22",
        "height": "20",
        "fill": "none"
    },
    "polearm": {
        "viewBox": "0 0 27 27",
        "width": "27",
        "height": "27",
        "fill": "none"
    },
    "greatSword": {
        "viewBox": "0 0 26 28",
        "width": "26",
        "height": "28",
        "fill": "none"
    },
    "sword": {
        "viewBox": "0 0 25 28",
        "width": "25",
        "height": "28",
        "fill": "none"
    },
    "handcannon": {
        "viewBox": "0 0 21 30",
        "width": "21",
        "height": "30",
        "fill": "none"
    },
    "artsUnit": {
        "viewBox": "0 0 24 22",
        "width": "24",
        "height": "22",
        "fill": "none"
    },
    "str": {
        "viewBox": "0 0 21 23",
        "width": "21",
        "height": "23",
        "fill": "none"
    },
    "agi": {
        "viewBox": "0 0 23 22",
        "width": "23",
        "height": "22",
        "fill": "none"
    },
    "int": {
        "viewBox": "0 0 26 25",
        "width": "26",
        "height": "25",
        "fill": "none"
    },
    "will": {
        "viewBox": "0 0 20 24",
        "width": "20",
        "height": "24",
        "fill": "none"
    },
    "hp": {
        "viewBox": "0 0 23 24",
        "width": "23",
        "height": "24",
        "fill": "none"
    },
    "atk": {
        "viewBox": "0 0 22 22",
        "width": "22",
        "height": "22",
        "fill": "none"
    },
    "physicaldamageincrease": {
        "viewBox": "0 0 14 16",
        "width": "14",
        "height": "16",
        "fill": "none"
    },
    "attrdamagetobrokenunitincrease": {
        "viewBox": "0 0 13 13",
        "width": "13",
        "height": "13",
        "fill": "none"
    },
    "ultimateskillefficiency": {
        "viewBox": "0 0 40 40",
        "width": "40",
        "height": "40",
        "fill": "none"
    },
    "normalattackdamageincrease": {
        "viewBox": "0 0 47 47",
        "width": "47",
        "height": "47",
        "fill": "none"
    },
    "def": {
        "viewBox": "0 0 14 20",
        "width": "14",
        "height": "20",
        "fill": "none"
    },
    "telegram": {
        "viewBox": "0 0 26 26",
        "width": "26",
        "height": "26",
        "fill": "none"
    },
    "discord": {
        "viewBox": "0 0 19 14",
        "width": "30",
        "height": "20",
        "fill": "none"
    },
    "googleDrive": {
        "viewBox": "0 0 23 21",
        "width": "23",
        "height": "21",
        "fill": "none"
    },
    "patreon": {
        "viewBox": "0 0 26 26",
        "width": "26",
        "height": "26",
        "fill": "none"
    },
    "boosty": {
        "viewBox": "0 0 23 28",
        "width": "23",
        "height": "28",
        "fill": "none"
    },
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
    "copy": {
        "viewBox": "0 0 14 14",
        "width": "14",
        "height": "14",
        "fill": "none"
    },
    "arrowRight": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "arrowLeft": {
        "viewBox": "0 0 24 24",
        "width": "2",
        "height": "24",
        "fill": "none",
        "stroke": "currentColor",
        "strokeWidth": "2"
    },
    "info": {
        "viewBox": "0 0 24 24",
        "width": "17",
        "height": "17",
        "fill": "none"
    },
    "google": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24"
    },
    "headhunting": {
        "viewBox": "0 0 20 21",
        "width": "10",
        "height": "10",
        "fill": "none"
    },
    "event": {
        "viewBox": "0 0 16 16",
        "width": "16",
        "height": "16",
        "fill": "none"
    },
    "atkEvent": {
        "viewBox": "0 0 22 22",
        "width": "10",
        "height": "10",
        "fill": "none"
    },
    "save": {
        "viewBox": "0 0 48 48",
        "width": "18",
        "height": "18",
        "fill": "none"
    },
    "chevronRight": {
        "viewBox": "0 0 11 20",
        "width": "11",
        "height": "20",
        "fill": "none"
    },
    "chevronLeft": {
        "viewBox": "0 0 11 20",
        "width": "11",
        "height": "20",
        "fill": "none"
    },
    "cloud": {
        "viewBox": "0 0 24 24",
        "width": "28",
        "height": "28",
        "fill": "none"
    },
    "local": {
        "viewBox": "0 0 19 19",
        "width": "22",
        "height": "22",
        "fill": "none"
    },
    "export": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "check": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "trash": {
        "viewBox": "0 0 24 24",
        "width": "10",
        "height": "10",
        "fill": "none"
    },
    "loading": {
        "viewBox": "0 0 32 32",
        "width": "32",
        "height": "32",
        "fill": "none"
    },
    "pen": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "tribute": {
        "viewBox": "0 0 187 180",
        "width": "35",
        "height": "35",
        "fill": "none"
    },
    "protoPass": {
        "viewBox": "0 0 17 13",
        "width": "17",
        "height": "13",
        "fill": "none"
    },
    "mail": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "table": {
        "viewBox": "0 0 20 20",
        "width": "20",
        "height": "20",
        "fill": "none"
    },
    "refresh": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "weapons": {
        "viewBox": "0 0 52 48",
        "width": "40",
        "height": "48",
        "fill": "none"
    },
    "signIn": {
        "viewBox": "0 0 22 22",
        "width": "22",
        "height": "22",
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
    },
    "twitter": {
        "viewBox": "0 0 14 14",
        "width": "30",
        "height": "20",
        "fill": "none"
    },
    "skport": {
        "viewBox": "0 0 17 14",
        "width": "30",
        "height": "20",
        "fill": "none"
    },
    "youtube": {
        "viewBox": "0 0 30 21",
        "width": "30",
        "height": "21",
        "fill": "none"
    },
    "crirate": {
        "viewBox": "0 0 50 50",
        "width": "50",
        "height": "50",
        "fill": "none"
    },
    "usp": {
        "viewBox": "0 0 33 49",
        "width": "33",
        "height": "49",
        "fill": "none"
    },
    "comboskillefficiency": {
        "viewBox": "0 0 38 29",
        "width": "38",
        "height": "29",
        "fill": "none"
    },
    "alldamagetakenscalar": {
        "viewBox": "0 0 50 50",
        "width": "50",
        "height": "50",
        "fill": "none"
    },
    "normalskillefficiency": {
        "viewBox": "0 0 37 37",
        "width": "37",
        "height": "37",
        "fill": "none"
    },
    "heal": {
        "viewBox": "0 0 49 48",
        "width": "49",
        "height": "48",
        "fill": "none"
    },
    "magicdam": {
        "viewBox": "0 0 39 47",
        "width": "39",
        "height": "47",
        "fill": "none"
    },
    "essence": {
        "viewBox": "0 0 95 95",
        "width": "95",
        "height": "95",
        "fill": "none"
    },
    "wuling": {
        "viewBox": "0 0 42 33",
        "width": "42",
        "height": "33",
        "fill": "none"
    },
    "theBase": {
        "viewBox": "0 0 43 18",
        "width": "43",
        "height": "18",
        "fill": "none"
    },
    "favorite": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "currentColor"
    },
    "permanent": {
        "viewBox": "0 0 32 20",
        "width": "32",
        "height": "20",
        "fill": "none"
    },
    "body": {
        "viewBox": "0 0 50 53",
        "width": "50",
        "height": "53",
        "fill": "none"
    },
    "hand": {
        "viewBox": "0 0 56 54",
        "width": "56",
        "height": "54",
        "fill": "none"
    },
    "edc": {
        "viewBox": "0 0 55 54",
        "width": "55",
        "height": "54",
        "fill": "none"
    },
    "list": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "grid": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "changelog": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "angel": {
        "viewBox": "0 0 44 44",
        "width": "44",
        "height": "44",
        "fill": "none"
    },
    "landbreaker": {
        "viewBox": "0 0 45 42",
        "width": "45",
        "height": "42",
        "fill": "none"
    },
    "hongshan": {
        "viewBox": "0 0 45 42",
        "width": "45",
        "height": "42",
        "fill": "none"
    },
    "animal": {
        "viewBox": "0 0 41 35",
        "width": "41",
        "height": "35",
        "fill": "none"
    },
    "heatRez": {
        "viewBox": "0 0 23 32",
        "width": "23",
        "height": "32",
        "fill": "none"
    },
    "cryoRez": {
        "viewBox": "0 0 23 32",
        "width": "23",
        "height": "32",
        "fill": "none"
    },
    "narureRez": {
        "viewBox": "0 0 23 32",
        "width": "23",
        "height": "32",
        "fill": "none"
    },
    "physRez": {
        "viewBox": "0 0 23 32",
        "width": "23",
        "height": "32",
        "fill": "none"
    },
    "elecrtoRez": {
        "viewBox": "0 0 23 32",
        "width": "23",
        "height": "32",
        "fill": "none"
    },
    "doubleArrows": {
        "viewBox": "0 0 26 15",
        "width": "26",
        "height": "15",
        "fill": "none"
    },
    "recepies": {
        "viewBox": "0 0 44 38",
        "width": "44",
        "height": "38",
        "fill": "none"
    },
    "pba": {
        "viewBox": "0 0 47 46",
        "width": "47",
        "height": "46",
        "fill": "none"
    },
    "boxes": {
        "viewBox": "0 0 45 41",
        "width": "45",
        "height": "41",
        "fill": "none"
    },
    "liquid": {
        "viewBox": "0 0 30 50",
        "width": "30",
        "height": "50",
        "fill": "none"
    },
    "eventStar": {
        "viewBox": "0 0 36 42",
        "width": "36",
        "height": "42",
        "fill": "none"
    },
    "inbox": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "arrowDown": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "currentColor"
    },
    "toggleManu": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none",
        "stroke": "currentColor"
    },
    "doubleArrowsLeft": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "moon": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "currentColor",
        "stroke": "none"
    },
    "sun": {
        "viewBox": "0 0 24 24",
        "width": "2",
        "height": "24",
        "fill": "none",
        "stroke": "currentColor",
        "strokeWidth": "2"
    },
    "circle": {
        "viewBox": "0 0 12 12",
        "width": "12",
        "height": "12",
        "fill": "none"
    },
    "person": {
        "viewBox": "0 0 24 24",
        "width": "2",
        "height": "24",
        "fill": "none",
        "stroke": "currentColor",
        "strokeWidth": "2"
    },
    "code": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none",
        "stroke": "currentColor"
    },
    "search": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none",
        "stroke": "currentColor"
    },
    "dragDots": {
        "viewBox": "0 0 24 24",
        "width": "24",
        "height": "24",
        "fill": "none"
    },
    "eyeOpen": {
        "viewBox": "0 0 34 24",
        "width": "34",
        "height": "24",
        "fill": "none"
    },
    "ar": {
        "viewBox": "0 0 20 14",
        "width": "20",
        "height": "14",
        "fill": "none"
    },
    "ka": {
        "viewBox": "0 0 21 15",
        "width": "21",
        "height": "15",
        "fill": "none"
    },
    "kk": {
        "viewBox": "0 0 20 14",
        "width": "20",
        "height": "14",
        "fill": "none"
    },
    "pl": {
        "viewBox": "0 0 20 14",
        "width": "20",
        "height": "14",
        "fill": "none"
    },
    "uk": {
        "viewBox": "0 0 20 14",
        "width": "20",
        "height": "14",
        "fill": "none"
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

{#if name === "strokeStar"}
    <svg class={$$props.class} style={$$props.style} viewBox="0 0 20 20" fill="none">
        <path d="M17.4921 10.2948L15.4536 9.06602L15.4413 2.14844L7.98573 6.39475L8.02264 8.73229L2.07812 12.214L9.26155 16.5569L11.3161 15.3758L17.2215 18.8575L17.4921 10.2948Z" stroke="transparent" class="fill-white dark:fill-[#383838]"/>
        <path d="M6.00461 14.0892L8.48107 12.6187L6.91589 9.92188L3 12.1871L6.00461 14.0892Z" fill="currentColor" fill-opacity="0.6"/>
        <path d="M6.91406 9.92163L8.47924 12.6185V9.00781L6.91406 9.92163Z" fill="currentColor" fill-opacity="0.7"/>
        <path d="M11.1794 5.07031C11.1794 5.07031 11.2455 10.463 10.9977 10.8945C10.7499 11.326 8.48438 12.6213 8.48438 12.6213V6.63444L11.1794 5.07031Z" fill="currentColor" fill-opacity="0.8"/>
        <path d="M11.8125 4.66465L11.8412 7.55586L14.947 7.54166L14.9535 3L11.8125 4.66465Z" fill="currentColor" fill-opacity="0.6"/>
        <path d="M14.9496 7.53906L11.8438 7.55326L14.9543 9.35858L14.9496 7.53906Z" fill="currentColor" fill-opacity="0.7"/>
        <path d="M17.0017 13.6763C17.0017 13.6763 12.3228 11.0376 12.0749 10.6061C11.8271 10.1746 11.844 7.55469 11.844 7.55469L17.0017 10.5481V13.6763Z" fill="currentColor" fill-opacity="0.8"/>
        <path d="M16.9052 14.4363L14.4001 13.0156L12.8594 15.7266L16.7688 18.0031L16.9052 14.4363Z" fill="currentColor" fill-opacity="0.6"/>
        <path d="M12.8589 15.7266L14.3996 13.0156L11.2891 14.8209L12.8589 15.7266Z" fill="currentColor" fill-opacity="0.7"/>
        <path d="M6.54688 14.4415C6.54688 14.4415 11.1596 11.6875 11.6553 11.6875C12.1509 11.6875 14.3995 13.0122 14.3995 13.0122L9.24187 16.0056L6.54688 14.4415Z" fill="currentColor" fill-opacity="0.8"/>
        <path d="M17.4921 10.2948L15.4536 9.06602L15.4413 2.14844L7.98573 6.39475L8.02264 8.73229L2.07812 12.214L9.26155 16.5569L11.3161 15.3758L17.2215 18.8575L17.4921 10.2948Z" class="stroke-white dark:stroke-[#383838]/80" fill="transparent"/>
    </svg>
{:else}
<svg class={$$props.class} style={$$props.style} {viewBox} {width} {height} {fill} {stroke} stroke-width={strokeWidth} stroke-linecap={strokeLinecap} stroke-linejoin={strokeLinejoin} {opacity}>
    <use href="#{resolvedName}" {fill} {stroke} stroke-width={strokeWidth} stroke-linecap={strokeLinecap} stroke-linejoin={strokeLinejoin} />
</svg>
{/if}
