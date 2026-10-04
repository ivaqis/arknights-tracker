export enum UsableTargetType {
    USER = "user",
    TEAM = "team",
}

export namespace UsableTargetType {
    export function getI18nKey(targetType: UsableTargetType): string {
        return `usableTargetTypes.${targetType}`;
    }
}