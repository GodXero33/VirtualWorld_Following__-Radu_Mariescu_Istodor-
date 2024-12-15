class Envelope {
	constructor (skeleton, width) {
		this.poly = Envelope.generatePoly(this, skeleton, width);
	}

	static generatePoly (envelope, skeleton, width) {
		const poly = [];
		const { a, b } = skeleton;
		const radius = width / 2;
		const angle = Math.atan2(a.y - b.y, a.x - b.x);
		const quality = GRAPH_SETTINGS.ENVELOPE_QUALITY;
		const delta_angle = Math.PI / quality;

		for (let g = 0; g <= Math.PI; g += delta_angle) poly.push(Point.translate(a, angle + g - Math.PI / 2, radius));
		for (let g = Math.PI; g >= 0; g -= delta_angle) poly.push(Point.translate(b, angle - g - Math.PI / 2, radius));

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
