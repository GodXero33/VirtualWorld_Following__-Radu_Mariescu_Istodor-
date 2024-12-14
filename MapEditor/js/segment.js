class Segment {
	constructor (a, b) {
		this.a = a;
		this.b = b;
	}

	static includes (segment, point) {
		return Point.equals(segment.a, point) || Point.equals(segment.b, point);
	}

	static includesActual (segment, point) {
		return segment.a == point || segment.b == point;
	}

	static equals (a, b) {
		return Segment.includes(a, b.a) && Segment.includes(a, b.b);
	}

	static draw (segment, ctx, color, width) {
		ctx.strokeStyle = color;
		ctx.lineWidth = width;

		ctx.beginPath();
		ctx.moveTo(segment.a.x, segment.a.y);
		ctx.lineTo(segment.b.x, segment.b.y);
		ctx.stroke();
	}
}
