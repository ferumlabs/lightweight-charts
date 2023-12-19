import { Coordinate } from '../model/coordinate';
import { SeriesMarkerRendererDataItem } from './series-markers-renderer';

const cellWidth = 72;
const cellHeight = 24;
const tooltipOffset = 20;
const cellHalfWidth = cellWidth/2;
const cellHalfHeight = cellHeight/2;

function drawPill(
	ctx: CanvasRenderingContext2D,
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    r: number,
    hideBorder: boolean
    ): void{
    if (r > width/2) r = width/2;
    if (r > height/2) r = height/2;
    const x1 = x + width;
    const y1 = y + height;
    ctx.beginPath();
    ctx.moveTo(x1 - r, y);
    ctx.quadraticCurveTo(x1, y, x1, y + r);
    ctx.lineTo(x1, y1-r);
    ctx.quadraticCurveTo(x1, y1, x1 - r, y1);
    ctx.lineTo(x + r, y1);
    ctx.quadraticCurveTo(x, y1, x, y1 - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.fillStyle = '#0E0E0F'
    if (!hideBorder) {
        ctx.strokeStyle = '0E0E0F'
        ctx.lineWidth = 2;
        ctx.moveTo(x1 - r, y);
        ctx.lineTo(x + r, y);
        ctx.stroke();
    }
    ctx.clip();
}

export function drawPnl(
	ctx: CanvasRenderingContext2D,
    item: SeriesMarkerRendererDataItem,
    hitId: number | undefined,
): void {
    const isHovered = hitId === item.internalId;
    const somethingElseHovered = hitId !== undefined && !isHovered;
    const loadingColor = somethingElseHovered ? 'rgba(44, 49, 48, 0.2)' : '#2C3130';
    const bgColor = somethingElseHovered ? 'rgba(24, 27, 26, 0.4)'  : '#181B1A';

    const centerX = item.x
    const centerY = item.y
    const cellCenterY = centerY - tooltipOffset;

    // Size is an argument being used to specify the percentage of remaining time in the trade.
    // When this percentage ticks to 0, this library provides a default of 10 so we check that.
    const active = item.size > 0 && item.size < 10;

    ctx.save();
    drawPill(ctx, centerX - cellWidth/2, cellCenterY - cellHeight/2, cellWidth, cellHeight, 8, somethingElseHovered);
    ctx.fillStyle = bgColor
	ctx.fillRect(centerX - cellWidth/2, cellCenterY - cellHeight/2, cellWidth, cellHeight);
    if (active) {
        ctx.fillStyle = loadingColor;
        ctx.fillRect(centerX - cellWidth/2, cellCenterY - cellHeight/2, cellWidth * item.size, cellHeight);
    }
	ctx.restore();

    if (!somethingElseHovered) {
        ctx.fillStyle = item.color
        ctx.textAlign = "center";
        if (item.text) {
            ctx.fillText(item.text.content, centerX, cellCenterY);
        }
    }
}

export function hitTestPnl(
	centerX: Coordinate,
	centerY: Coordinate,
	size: number,
	x: Coordinate,
	y: Coordinate
): boolean {
	const left = centerX - cellHalfWidth;
	const top = centerY - cellHalfHeight - tooltipOffset;
    const right = left + cellWidth;
    const bottom = top + cellHeight;

    return x >= left && x <= right && y >= top && y <= bottom;
}
