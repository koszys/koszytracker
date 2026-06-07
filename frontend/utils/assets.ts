export function getItemIconPath(gameId: string, itemName: string): string {
    const name = itemName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `/assets/${gameId}/${name}-icon.png`;
}
