/**
 *
 * @param {string} itemId
 * @param {MachineCraft|ManualCraft|HubCraft|MiningFormula|PumpingFormula} formula
 * @returns {string|null}
 */
export function getRecipeTreeLinkParameters(itemId, formula = null) {
    if (!formula) {
        return `itemId=${itemId}`;
    }

    let formulaType = formula.formulaType;

    if (formulaType === "machineCraft" || formulaType === "manualCraft" || formulaType === "hubCraft") {
        return `itemId=${itemId}&type=${formulaType}&formulaId=${formula.id}`;
    }
    if (formulaType === "miningFormula") {
        return `itemId=${itemId}&type=${formulaType}&buildingId=${formula.minerId}`;
    }
    if (formulaType === "pumpingFormula") {
        return `itemId=${itemId}&type=${formulaType}&buildingId=${formula.pumpId}`;
    }

    return null;
}