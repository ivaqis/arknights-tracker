export interface ITabSelectEvent<T extends string> {
    readonly selectedTab: T;
    readonly previousTab: T;
}