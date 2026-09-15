export interface IComparator<T> {
    compare(a: T, b: T): number;
}