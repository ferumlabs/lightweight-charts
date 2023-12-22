import { CanvasRenderingTarget2D } from 'fancy-canvas';

import { HoveredObject, HoveredSource } from '../model/chart-model';
import { Coordinate } from '../model/coordinate';

export interface IPaneRenderer {
	draw(target: CanvasRenderingTarget2D, isHovered: boolean, hitTestData?: unknown): void;
	drawBackground?(target: CanvasRenderingTarget2D, isHovered: boolean, hitTestData?: unknown): void;
	hitTest?(x: Coordinate, y: Coordinate, hoveredSource?: HoveredSource | null): HoveredObject | null;
}
