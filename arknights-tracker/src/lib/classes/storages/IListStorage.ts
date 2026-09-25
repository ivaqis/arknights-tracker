export interface IListStorage<T> {
    get list(): readonly T[];
}