export function filterCheck(filterParamSet, value) {
    if (!filterParamSet || filterParamSet.size === 0) {
        return true;
    }

    return filterParamSet.has(value);
}

export function filterCheckLowerCase(filterParamSet, value) {
    if (!filterParamSet || filterParamSet.size === 0) {
        return true;
    }

    const valueLowerCase = value.toLowerCase();

    for (let param of filterParamSet) {
        if (param.toLowerCase() === valueLowerCase) {
            return true;
        }
    }

    return false;
}

export function getBaseSkillMappedFilter(opId, skillName) {
    if (!opId || !skillName) return null;
    
    if (skillName === "facskill_spaceship_manufacture_power_consume") {
        return "moodDropHour_manufacturingCabin";
    }
    if (skillName === "facskill_spaceship_guestroom_power_consume") {
        return "moodDropHour_receptionRoom";
    }
    if (skillName === "facskill_spaceship_plant_power_consume") {
        return "moodDropHour_growthChamber";
    }
    if (skillName === "facskill_spaceship_physical_power") {
        return "moodRegen";
    }
    if (skillName === "facskill_spaceship_guestroom_clue") {
        return "clueEfficiencyBoost";
    }
    if (skillName === "facskill_spaceship_guestroom_efficiency") {
        return "operatorClueCollectingEfficiency";
    }
    if (skillName === "facskill_spaceship_plant_fungus") {
        return "fungiGrowthEfficiency";
    }
    if (skillName === "facskill_spaceship_plant_flower") {
        return "vitrosGrowthEfficiency";
    }
    if (skillName === "facskill_spaceship_plant_mineral") {
        return "mineralGrowthEfficiency";
    }
    
    if (skillName === "facskill_spaceship_manufacture_efficiency") {
        const weaponOps = ["antal", "arclight", "chenQianyu", "gilberta", "perlica", "pogranichnik"];
        return weaponOps.includes(opId) ? "weaponMaterialEfficiency" : "operatorMaterialEfficiency";
    }
    
    return null;
}

export function getBaseSkillLocale(opId, skillName, t) {
    const filterKey = getBaseSkillMappedFilter(opId, skillName);
    if (!filterKey) return "";
    
    if (filterKey.startsWith("moodDropHour_")) {
        const roomKey = filterKey.substring("moodDropHour_".length);
        const moodDropText = t("baseSkillsFilters.moodDropHour") || "Падение настроения";
        const roomText = t(`baseSkillsPositions.${roomKey}`) || roomKey;
        return `${moodDropText} (${roomText})`;
    }
    
    return t(`baseSkillsFilters.${filterKey}`) || filterKey;
}