export enum CrafterModeName {
    NORMAL = "normal",
    LIQUID = "liquid",
    GAS = "gas",
    GAS_LIQUID = "gasliquid",
    GAS_TRANS = "gastrans",
    LIQUID_TRANS = "liquidtrans",
    SOLID_TRANS = "solidtrans",
}

export namespace CrafterModeName {
    export const ORDER: readonly CrafterModeName[] = [
        CrafterModeName.NORMAL,
        CrafterModeName.LIQUID,
        CrafterModeName.GAS,
        CrafterModeName.GAS_LIQUID,
        CrafterModeName.SOLID_TRANS,
        CrafterModeName.LIQUID_TRANS,
        CrafterModeName.GAS_TRANS
    ] as const;
}