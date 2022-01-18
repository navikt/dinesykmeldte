export function cleanId(title: string): string {
    return title.replace(/\W/g, '_');
}
