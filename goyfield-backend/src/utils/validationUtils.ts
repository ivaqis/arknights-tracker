export function isNullOrUndefined(field: any): boolean {
    return field === null || field === undefined;
}

export function isString(field: any): boolean {
    return field && typeof field === "string";
}

export function isOptionalString(field: any): boolean {
    return isString(field) || isNullOrUndefined(field);
}

export function isValidList<T extends any>(list: T[], validationFunc: (item: T) => boolean): boolean {
    return list.every(validationFunc);
}

export const JWT_REGEX: RegExp = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;