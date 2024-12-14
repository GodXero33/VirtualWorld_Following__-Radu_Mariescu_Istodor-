class Envelope {
	constructor (skeleton, width) {
		this.skeleton = skeleton;
		this.poly = Envelope.generatePoly(this, width);
	}

	static generatePoly (envelope, width) {
		const poly = [];
		const { a, b } = envelope.skeleton;
		const radius = width / 2;
		const angle = Math.atan2(a.y - b.y, a.x - b.x);
		const angle_cw = angle + Math.PI / 2;
		const angle_ccw = angle - Math.PI / 2;

		poly.push(Point.translate(a, angle_cw, radius));
		poly.push(Point.translate(a, angle_ccw, radius));
		poly.push(Point.translate(b, angle_ccw, radius));
		poly.push(Point.translate(b, angle_cw, radius));
		return poly;
	}

	static draw (envelope, ctx, zoom) {
		ctx.strokeStyle = GRAPH_SETTINGS.ENVELOPE_LINE_COLOR;
		ctx.fillStyle = GRAPH_SETTINGS.ENVELOPE_FILL_COLOR;
		ctx.lineWidth = GRAPH_SETTINGS.ENVELOPE_LINE_WIDTH * zoom;

		ctx.beginPath();
		ctx.moveTo(envelope.poly[0].x, envelope.poly[0].y);

		for (let g = 1; g < envelope.poly.length; g++) ctx.lineTo(envelope.poly[g].x, envelope.poly[g].y);

		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
}
