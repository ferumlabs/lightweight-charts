import { Coordinate } from '../model/coordinate';
import { SeriesMarkerRendererDataItem } from './series-markers-renderer';

const cellWidth = 72;
const cellHeight = 24;

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
        ctx.moveTo(x1 - r, y);
        ctx.lineTo(x + r, y);
        ctx.stroke();
    }
    ctx.clip();
}

export function drawLine(
	ctx: CanvasRenderingContext2D,
    item: SeriesMarkerRendererDataItem,
    hitId: number | undefined,
): void {    
    const isHovered = hitId === item.internalId;
    const somethingElseHovered = hitId !== undefined && !isHovered;

    const primaryColor = somethingElseHovered ? 'rgba(44, 49, 48, 0.5)' : '#A992E3';
    const centerX = item.x
    const centerY = item.y

    const cellCenterY = centerY - 20;

    const active = item.size > 0 && item.size < 10;
    
    ctx.save();
    drawPill(ctx, centerX - cellWidth/2, cellCenterY - cellHeight/2, cellWidth, cellHeight, 8, somethingElseHovered);
    
    ctx.fillStyle = somethingElseHovered ? 'rgba(97, 97, 97, 0.05)'  : '#181B1A';
	ctx.fillRect(centerX - cellWidth/2, cellCenterY - cellHeight/2, cellWidth, cellHeight);
    if (active) {
        ctx.fillStyle = primaryColor;
        ctx.fillRect(centerX - cellWidth/2, cellCenterY + 10, cellWidth * item.size, cellHeight);
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

export function hitTestLine(
	centerX: Coordinate,
	centerY: Coordinate,
	size: number,
	x: Coordinate,
	y: Coordinate
): boolean {
    const cellHalfWidth = 32;
    const cellHalfHeight = 8;

	const left = centerX - cellHalfWidth;
	const top = centerY - cellHalfHeight - 16;
    const right = left + cellWidth;
    const bottom = top + cellHeight;

    return x >= left && x <= right && y >= top && y <= bottom;
}
