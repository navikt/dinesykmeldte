export function overrideWindowLocation(path: string): void {
    const mockLocation = new URL(`http://localhost${path}`);
    Object.defineProperty(window, 'location', {
        get() {
            return mockLocation;
        },
    });
}
