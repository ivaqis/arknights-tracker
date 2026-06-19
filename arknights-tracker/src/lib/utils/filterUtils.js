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