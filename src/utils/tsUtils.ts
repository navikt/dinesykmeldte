export function partition<T>(predicate: (val: T) => boolean, arr: T[]): [T[], T[]] {
    const partitioned: [T[], T[]] = [[], []]
    arr.forEach((val: T) => {
        partitioned[predicate(val) ? 0 : 1].push(val)
    })
    return partitioned
}

export function notNull<T>(value: T): value is NonNullable<T> {
    return value != null
}

export function range(count: number): number[] {
    return Array.from(new Array(count).keys())
}
