export function cleanId(title: string): string {
    return title.replace(/\W/g, '_')
}

export function capitalizeFirstLetterOnly(verdi: string): string {
    return verdi.charAt(0) + verdi.slice(1).toLowerCase()
}
