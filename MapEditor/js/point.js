class Point {
	constructor (x, y) {
		this.x = x;
		this.y = y;
	}

	static equals (a, b) {
		return Math.abs(a.x - b.x) < GRAPH_SETTINGS.POINT_OVERLAP_THRASHOLD && Math.abs(a.y - b.y) < GRAPH_SETTINGS.POINT_OVERLAP_THRASHOLD;
	}

	static translate (point, angle, radius) {
		return new Point(point.x + Math.cos(angle) * radius, point.y + Math.sin(angle) * radius);
	}

	static draw (point, ctx, color, size) {
		ctx.strokeStyle = color;
		ctx.lineWidth = size;
		ctx.lineCap = 'round';

		ctx.beginPath();
		ctx.moveTo(point.x, point.y);
		ctx.lineTo(point.x, point.y);
		ctx.stroke();
	}
}
