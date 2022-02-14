export function partition<T>(predicate: (val: T) => boolean, arr: T[]): [T[], T[]] {
    const partitioned: [T[], T[]] = [[], []];
    arr.forEach((val: T) => {
        partitioned[predicate(val) ? 0 : 1].push(val);
    });
    return partitioned;
}
