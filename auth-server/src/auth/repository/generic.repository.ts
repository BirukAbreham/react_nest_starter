export abstract class GenericRepository<T> {
    abstract get(id: number): Promise<any>;

    abstract create(item: any): Promise<any>;

    abstract update(id: number, item: any);

    abstract remove(id: number);
}
