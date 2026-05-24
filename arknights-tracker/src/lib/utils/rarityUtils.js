export function getRarityColor(rarity) {
    switch (rarity) {
        case 6: return "#F4700C";
        case 5: return "#F9B90C";
        case 4: return "#9253F1";
        case 3: return "#25B9F9";
        case 2: return "#A5B100";
        default: return "#8F8F8F";
    }
}