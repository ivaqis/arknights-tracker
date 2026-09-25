export enum ElementType {
    PHYSICAL = "physical",
    ELECTRIC = "electric",
    NATURE = "nature",
    HEAT = "heat",
    CRYO = "cryo"
}

export namespace ElementType {
    export function isElementType(str: string): str is ElementType {
        return getList().some(item => item === str);
    }

    export function getList(): ElementType[] {
        return Object.values(ElementType)
            .filter(item => typeof item === "string");
    }
}