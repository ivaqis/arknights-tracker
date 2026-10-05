export interface IFilter<TEntity> {
    satisfies(entity: TEntity): boolean;
}