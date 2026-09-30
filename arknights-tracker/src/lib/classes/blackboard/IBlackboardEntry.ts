export interface IBlackboardEntry<T = number> {
    get key(): string;
    get value(): T;
}