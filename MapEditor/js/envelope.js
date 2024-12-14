class Envelope {
	constructor (skeleton, width) {
		this.skeleton = skeleton;
		this.poly = Envelope.generatePoly(this, width);
	}

	static generatePoly (envelope, width) {
		const { a, b } = envelope.skeleton;
		const radius = width / 2;
		const angle = Math.atan2(a.y - b.y, a.x - b.x);
		const angle_cw = angle + Math.PI / 2;
		const angle_ccw = angle - Math.PI / 2;
		const a_cw = Point.translate(a, angle_cw, radius);
		const a_ccw = Point.translate(a, angle_ccw, radius);
		const b_cw = Point.translate(b, angle_cw, radius);
		const b_ccw = Point.translate(b, angle_ccw, radius);
	}
}
