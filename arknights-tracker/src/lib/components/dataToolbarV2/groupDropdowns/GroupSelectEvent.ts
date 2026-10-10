export interface GroupSelectEvent<T extends string | number> {
    previousOption: T;
    newOption: T;
    isGroupSortActive: boolean | null;
}