import { CROP_HANDLE_SIZE } from '../../constants/canvas';
import { getZoneColor, ZONE_BORDER_WIDTH, ZONE_SELECTED_BORDER_WIDTH, ZONE_LABEL_FONT_SIZE } from '../../constants/cropZoneColors';
import type { CropZone } from '../../types';

export interface MultiCropRenderParams {
    canvas: HTMLCanvasElement;
    image: HTMLImageElement;
    zoomLevel: number;
    panX: number;
    panY: number;
    zones: CropZone[];
    activeZoneId: string | null;
}

interface DisplayRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Compute the display-space rect for a zone's crop region.
 */
function zoneToDisplayRect(
    zone: CropZone,
    image: HTMLImageElement,
    zoomLevel: number,
    panX: number,
    panY: number,
    canvas: HTMLCanvasElement
): DisplayRect {
    const displayWidth = image.width * zoomLevel;
    const displayHeight = image.height * zoomLevel;
    const imgX = (canvas.width - displayWidth) / 2 + panX;
    const imgY = (canvas.height - displayHeight) / 2 + panY;

    return {
        x: imgX + zone.rect.x * zoomLevel,
        y: imgY + zone.rect.y * zoomLevel,
        width: zone.rect.width * zoomLevel,
        height: zone.rect.height * zoomLevel,
    };
}

/**
 * Draw a label badge on a zone.
 */
function drawZoneLabel(ctx: CanvasRenderingContext2D, label: string, rect: DisplayRect, color: string) {
    ctx.font = `${ZONE_LABEL_FONT_SIZE}px sans-serif`;
    const textMetrics = ctx.measureText(label);
    const padding = 4;
    const badgeWidth = textMetrics.width + padding * 2;
    const badgeHeight = ZONE_LABEL_FONT_SIZE + padding * 2;

    // Draw badge background
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(rect.x, rect.y - badgeHeight, badgeWidth, badgeHeight);
    ctx.globalAlpha = 1.0;

    // Draw text
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'top';
    ctx.fillText(label, rect.x + padding, rect.y - badgeHeight + padding);
}

/**
 * Draw resize handles for the active zone.
 */
function drawHandles(ctx: CanvasRenderingContext2D, rect: DisplayRect) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    const handles = [
        { x: rect.x, y: rect.y }, // NW
        { x: rect.x + rect.width / 2, y: rect.y }, // N
        { x: rect.x + rect.width, y: rect.y }, // NE
        { x: rect.x + rect.width, y: rect.y + rect.height / 2 }, // E
        { x: rect.x + rect.width, y: rect.y + rect.height }, // SE
        { x: rect.x + rect.width / 2, y: rect.y + rect.height }, // S
        { x: rect.x, y: rect.y + rect.height }, // SW
        { x: rect.x, y: rect.y + rect.height / 2 }, // W
    ];

    handles.forEach(handle => {
        ctx.fillRect(handle.x - CROP_HANDLE_SIZE / 2, handle.y - CROP_HANDLE_SIZE / 2, CROP_HANDLE_SIZE, CROP_HANDLE_SIZE);
        ctx.strokeRect(handle.x - CROP_HANDLE_SIZE / 2, handle.y - CROP_HANDLE_SIZE / 2, CROP_HANDLE_SIZE, CROP_HANDLE_SIZE);
    });
}

/**
 * Draw rule-of-thirds grid inside a rect.
 */
function drawRuleOfThirds(ctx: CanvasRenderingContext2D, rect: DisplayRect, color: string) {
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;

    // Vertical lines
    const third1X = rect.x + rect.width / 3;
    const third2X = rect.x + (2 * rect.width) / 3;
    ctx.beginPath();
    ctx.moveTo(third1X, rect.y);
    ctx.lineTo(third1X, rect.y + rect.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(third2X, rect.y);
    ctx.lineTo(third2X, rect.y + rect.height);
    ctx.stroke();

    // Horizontal lines
    const third1Y = rect.y + rect.height / 3;
    const third2Y = rect.y + (2 * rect.height) / 3;
    ctx.beginPath();
    ctx.moveTo(rect.x, third1Y);
    ctx.lineTo(rect.x + rect.width, third1Y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rect.x, third2Y);
    ctx.lineTo(rect.x + rect.width, third2Y);
    ctx.stroke();

    ctx.globalAlpha = 1.0;
}

/**
 * Render image and multiple crop zone overlays on canvas.
 */
export function renderCanvasMultiCrop(params: MultiCropRenderParams): void {
    const { canvas, image, zoomLevel, panX, panY, zones, activeZoneId } = params;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D canvas context');
        return;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate display dimensions
    const displayWidth = image.width * zoomLevel;
    const displayHeight = image.height * zoomLevel;
    const imgX = (canvasWidth - displayWidth) / 2 + panX;
    const imgY = (canvasHeight - displayHeight) / 2 + panY;

    // Draw image
    ctx.drawImage(image, imgX, imgY, displayWidth, displayHeight);

    if (zones.length === 0) return;

    // Compute display rects for all zones
    const zoneDisplayData = zones.map((zone, index) => ({
        zone,
        rect: zoneToDisplayRect(zone, image, zoomLevel, panX, panY, canvas),
        color: getZoneColor(index),
        isActive: zone.id === activeZoneId,
    }));

    // Draw darkened overlay outside all zones
    // Use compositing: draw a full dark overlay, then clear the zone areas
    ctx.save();

    // Dark overlay across entire canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Cut out zone areas using destination-out compositing
    ctx.globalCompositeOperation = 'destination-out';
    for (const { rect } of zoneDisplayData) {
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();

    // Re-draw image inside zone areas (since they were cut out)
    for (const { rect } of zoneDisplayData) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.clip();
        ctx.drawImage(image, imgX, imgY, displayWidth, displayHeight);
        ctx.restore();
    }

    // Draw non-selected zones first (borders + labels, no handles)
    for (const { zone, rect, color, isActive } of zoneDisplayData) {
        if (isActive) continue;

        ctx.strokeStyle = color;
        ctx.lineWidth = ZONE_BORDER_WIDTH;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

        drawZoneLabel(ctx, zone.label, rect, color);
    }

    // Draw selected zone last (on top)
    const activeData = zoneDisplayData.find(d => d.isActive);
    if (activeData) {
        const { zone, rect, color } = activeData;

        // Brighter/thicker border
        ctx.strokeStyle = color;
        ctx.lineWidth = ZONE_SELECTED_BORDER_WIDTH;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

        // Rule of thirds
        drawRuleOfThirds(ctx, rect, color);

        // Resize handles
        drawHandles(ctx, rect);

        // Label
        drawZoneLabel(ctx, zone.label, rect, color);
    }
}
