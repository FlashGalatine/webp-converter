/**
 * Distinct border colors for crop zones.
 * Each zone gets a color from this palette, cycling when zones exceed the palette size.
 * Colors chosen for visual contrast against typical photo backgrounds and the dark canvas.
 */
export const CROP_ZONE_COLORS = [
    '#fbbf24', // amber (matches existing single-crop border)
    '#34d399', // emerald
    '#60a5fa', // blue
    '#f472b6', // pink
    '#a78bfa', // violet
    '#fb923c', // orange
    '#2dd4bf', // teal
    '#e879f9', // fuchsia
    '#facc15', // yellow
    '#4ade80', // green
] as const;

/**
 * Get the border color for a zone at a given index.
 * Cycles through the palette if index exceeds palette size.
 */
export function getZoneColor(index: number): string {
    return CROP_ZONE_COLORS[index % CROP_ZONE_COLORS.length];
}

/** Border width for non-selected zones */
export const ZONE_BORDER_WIDTH = 2;

/** Border width for the selected/active zone */
export const ZONE_SELECTED_BORDER_WIDTH = 3;

/** Font size for zone labels rendered on canvas */
export const ZONE_LABEL_FONT_SIZE = 14;
