import { MediaCoordinatesRenderingScope } from 'fancy-canvas';

import { ensureNever } from '../helpers/assertions';
import { makeFont } from '../helpers/make-font';

import { HoveredObject, HoveredSource } from '../model/chart-model';
import { Coordinate } from '../model/coordinate';
import { SeriesMarkerShape } from '../model/series-markers';
import { TextWidthCache } from '../model/text-width-cache';
import { SeriesItemsIndexesRange, TimedValue } from '../model/time-data';

import { MediaCoordinatesPaneRenderer } from './media-coordinates-pane-renderer';
import { drawArrow, hitTestArrow } from './series-markers-arrow';
import { drawCircle, hitTestCircle } from './series-markers-circle';
import { drawPnl, hitTestPnl } from './series-markers-pnl';
import { drawSquare, hitTestSquare } from './series-markers-square';
import { drawText } from './series-markers-text';

export interface SeriesMarkerText {
	content: string;
	x: Coordinate;
	y: Coordinate;
	width: number;
	height: number;
}

export interface SeriesMarkerRendererDataItem extends TimedValue {
	y: Coordinate;
	size: number;
	shape: SeriesMarkerShape;
	color: string;
	internalId: number;
	externalId?: string;
	text?: SeriesMarkerText;
	endCoord?: number;
}

export interface SeriesMarkerRendererData {
	items: SeriesMarkerRendererDataItem[];
	visibleRange: SeriesItemsIndexesRange | null;
	hoveredSource: HoveredSource | null;
}

export class SeriesMarkersRenderer extends MediaCoordinatesPaneRenderer {
	private _data: SeriesMarkerRendererData | null = null;
	private _textWidthCache: TextWidthCache = new TextWidthCache();
	private _fontSize: number = -1;
	private _fontFamily: string = '';
	private _font: string = '';

	public setData(data: SeriesMarkerRendererData): void {
		this._data = data;
	}

	public setParams(fontSize: number, fontFamily: string): void {
		if (this._fontSize !== fontSize || this._fontFamily !== fontFamily) {
			this._fontSize = fontSize;
			this._fontFamily = fontFamily;
			this._font = makeFont(fontSize, fontFamily);
			this._textWidthCache.reset();
		}
	}

	public hitTest(x: Coordinate, y: Coordinate): HoveredObject | null {
		if (this._data === null || this._data.visibleRange === null) {
			return null;
		}

		for (let i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
			const item = this._data.items[i];
			if (hitTestItem(item, x, y)) {
				return {
					hitTestData: item.internalId,
					externalId: item.externalId,
				};
			}
		}

		return null;
	}

	protected _drawImpl({ context: ctx }: MediaCoordinatesRenderingScope, isHovered: boolean, hitTestData?: unknown): void {
		if (this._data === null || this._data.visibleRange === null) {
			return;
		}

		ctx.textBaseline = 'middle';
		ctx.font = this._font;

		ctx.fillStyle = '#ece028';
		for (let i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
			const item = this._data.items[i];
			ctx.beginPath();
			ctx.arc(item.x, item.y, 3, 0, 2 * Math.PI, false);
			ctx.fill();
		}

		for (let i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
			const item = this._data.items[i];
			if (item.text !== undefined) {
				item.text.width = this._textWidthCache.measureText(ctx, item.text.content);
				item.text.height = this._fontSize;
				item.text.x = item.x - item.text.width / 2 as Coordinate;
			}
			const hitId = hitTestData;
			drawItem(item, ctx, typeof hitId === 'number' ? hitId : undefined);
		}
	}
}

function drawItem(item: SeriesMarkerRendererDataItem, ctx: CanvasRenderingContext2D, hitId?: number): void {
	ctx.fillStyle = item.color;

	if (item.text !== undefined && item.shape !== 'pnl') {
		drawText(ctx, item.text.content, item.text.x, item.text.y);
	}

	drawShape(item, ctx, hitId);
}

function drawShape(item: SeriesMarkerRendererDataItem, ctx: CanvasRenderingContext2D, hitId?: number): void {
	if (item.size === 0) {
		return;
	}

	switch (item.shape) {
		case 'arrowDown':
			drawArrow(false, ctx, item.x, item.y, item.size);
			return;
		case 'arrowUp':
			drawArrow(true, ctx, item.x, item.y, item.size);
			return;
		case 'circle':
			drawCircle(ctx, item.x, item.y, item.size);
			return;
		case 'square':
			drawSquare(ctx, item.x, item.y, item.size);
			return;
		case 'pnl': {
			drawPnl(ctx, item, hitId);
			return;
		}
	}

	ensureNever(item.shape);
}

function hitTestItem(item: SeriesMarkerRendererDataItem, x: Coordinate, y: Coordinate): boolean {
	return hitTestShape(item, x, y);
}

function hitTestShape(item: SeriesMarkerRendererDataItem, x: Coordinate, y: Coordinate): boolean {
	if (item.size === 0) {
		return false;
	}

	switch (item.shape) {
		case 'arrowDown':
			return hitTestArrow(true, item.x, item.y, item.size, x, y);
		case 'arrowUp':
			return hitTestArrow(false, item.x, item.y, item.size, x, y);
		case 'circle':
			return hitTestCircle(item.x, item.y, item.size, x, y);
		case 'square':
			return hitTestSquare(item.x, item.y, item.size, x, y);
		case 'pnl':
			return hitTestPnl(item.x, item.y, item.size, x, y);
	}
}
