class Graph {
	constructor () {
		this.points = new Array(0);
		this.segments = new Array(0);
	}

	containsPoint (point) {
		return this.points.findIndex(currentPoint => Point.equals(currentPoint, point)) != -1;
	}

	containsSegment (segment) {
		return this.segments.findIndex(currentSegment => Segment.equals(currentSegment, segment)) != -1;
	}

	addPoint (point) {
		if (this.containsPoint(point)) {
			console.warn('Invalid Point: Point already exists.', point);
			return this;
		}

		this.points.push(point);
		return this;
	}

	addSegment (segment) {
		if (this.containsSegment(segment)) {
			console.warn('Invalid Segment: Segment already exists.', segment);
			return this;
		}

		this.segments.push(segment);
		return this;
	}

	removePoint (point) {
		if (this.points.length == 0) {
			console.warn('No points to remove.');
			return this;
		}

		const index = this.points.indexOf(point);

		if (index == -1) {
			console.warn('Point is not in this graph.');
			return this;
		}

		this.segments = this.segments.filter(segment => !Segment.includesActual(segment, point));
		this.points.splice(index, 1);
		return this;
	}

	removeSegment (segment) {
		if (this.segments.length == 0) {
			console.warn('No segments to remove.');
			return;
		}

		const index = this.segments.indexOf(segment);

		if (index == -1) {
			console.warn('Segment is not in this graph.');
			return this;
		}

		this.segments.splice(index, 1);
		return this;
	}

	getNearestPoint (x, y, zoom) {
		return this.points.find(point => (x - point.x) * (x - point.x) + (y - point.y) * (y - point.y) < (GRAPH_SETTINGS.MINIMUM_POINT_SNAP_DISTANCE * zoom) ** 2);
	}

	dispose () {
		this.points = new Array(0);
		this.segments = new Array(0);
		this.envelopes = new Array(0);
		return this;
	}

	draw (ctx, zoom) {
		this.segments.forEach(segment => Segment.drawEnvelope(segment, ctx, zoom));
		this.segments.forEach(segment => Segment.draw(segment, ctx, GRAPH_SETTINGS.SEGEMENT_COLOR, GRAPH_SETTINGS.SEGEMENT_WIDTH * zoom));
		this.points.forEach(point => Point.draw(point, ctx, GRAPH_SETTINGS.POINT_DRAW_COLOR, GRAPH_SETTINGS.POINT_DRAW_SIZE * zoom));
	}
}
