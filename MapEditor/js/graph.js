const GRAPH_SETTINGS = Object.freeze({
	POINT_SNAP_THRASHOLD: 10,
	POINT_OVERLAP_THRASHOLD: 1e-4,
	POINT_DRAW_SIZE: 10,
	SEGEMENT_WIDTH: 1,
	POINT_DRAW_COLOR: '#000000',
	POINT_SELECT_COLOR: '#ffff00',
	POINT_HOVER_COLOR: '#ff00ff',
	POINT_FUTURE_COLOR: '#565656',
	SEGMENT_FUTURE_COLOR: '#565656',
	SEGEMENT_COLOR: '#000000',
	GRAPH_COLOR: '#669944',
	MINIMUM_POINT_SNAP_DISTANCE: 20
});

(function (exports) {
	class Point {
		constructor (x, y) {
			this.x = x;
			this.y = y;
		}
	
		static equals (a, b) {
			return Math.abs(a.x - b.x) < GRAPH_SETTINGS.POINT_OVERLAP_THRASHOLD && Math.abs(a.y - b.y) < GRAPH_SETTINGS.POINT_OVERLAP_THRASHOLD;
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
			if (!(point instanceof Point)) {
				console.warn('Invalid Type: Expected a Point object.');
				return this;
			}

			if (this.containsPoint(point)) {
				console.warn('Invalid Point: Point already exists.', point);
				return this;
			}
	
			this.points.push(point);
			return this;
		}
	
		addSegment (segment) {
			if (!(segment instanceof Segment)) {
				console.warn('Invalid Type: Expected a Segment object.');
				return this;
			}

			if (this.containsSegment(segment)) {
				console.warn('Invalid Segment: Segment already exists.', segment);
				return this;
			}

			this.segments.push(segment);
			return this;
		}

		removePoint (point) {
			if (!(point instanceof Point)) {
				console.warn('Invalid Type: Expected a Point object.');
				return this;
			}

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
			if (!(segment instanceof Segment)) {
				console.warn('Invalid Type: Expected a Segment object.');
				return this;
			}

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

		getNearestPoint (x, y) {
			return this.points.find(point => (x - point.x) * (x - point.x) + (y - point.y) * (y - point.y) < GRAPH_SETTINGS.MINIMUM_POINT_SNAP_DISTANCE ** 2);
		}

		dispose () {
			this.points = new Array(0);
			this.segments = new Array(0);
			return this;
		}
	
		draw (ctx, zoom) {
			this.segments.forEach(segment => Segment.draw(segment, ctx, GRAPH_SETTINGS.SEGEMENT_COLOR, GRAPH_SETTINGS.SEGEMENT_WIDTH * zoom));
			this.points.forEach(point => Point.draw(point, ctx, GRAPH_SETTINGS.POINT_DRAW_COLOR, GRAPH_SETTINGS.POINT_DRAW_SIZE * zoom));
		}
	}

	class GraphEditor {
		constructor (graph, viewport) {
			this.graph = graph;
			this.viewport = viewport;

			this.width = 0;
			this.height = 0;
			this.selectedPoint = null;
			this.hoverPoint = null;
			this.panStart = null;
			this.grabStart = null;
			this.futurePoint = null;
			this.futureSegment = null;
		}

		addEventListeners (canvas) {
			canvas.addEventListener('mousedown', this.#mousedown.bind(this));
			canvas.addEventListener('mouseup', this.#mouseup.bind(this));
			canvas.addEventListener('mousemove', this.#mousemove.bind(this));
			canvas.addEventListener('wheel', this.#mousewheel.bind(this));
			canvas.addEventListener('mouseout', this.#mouseout.bind(this));
			canvas.addEventListener('contextmenu', event => event.preventDefault());

			return this;
		}

		#mousedown (event) {
			const canvas = event.target;
			const rect =canvas.getBoundingClientRect();
			const x = (event.x - rect.x - canvas.width / 2) * this.viewport.zoom - this.viewport.translate.x;
			const y = (event.y - rect.y - canvas.height / 2) * this.viewport.zoom - this.viewport.translate.y;

			if (event.button == 0) {
				if (this.hoverPoint) {
					if (this.futurePoint) {
						const joinSegement = new Segment(this.hoverPoint, this.selectedPoint);
						this.graph.addSegment(joinSegement);
						this.futurePoint = null;
						this.futureSegment = null;
						this.selectedPoint = this.hoverPoint;
						return;
					}

					this.selectedPoint = this.hoverPoint;
					return;
				}

				if (this.futurePoint) {
					this.graph.addPoint(this.futurePoint);
					this.graph.addSegment(this.futureSegment);
					this.selectedPoint = this.futurePoint;
					this.futurePoint = null;
					this.futureSegment = null;
				} else {
					const point = new Point(x, y);
					this.selectedPoint = point;
					this.graph.addPoint(point);
				}
			} else if (event.button == 1) {
				if (this.hoverPoint) {
					this.grabStart= {
						x: event.x - this.hoverPoint.x / this.viewport.zoom,
						y: event.y - this.hoverPoint.y / this.viewport.zoom
					};
					return;
				}

				this.panStart = {
					x: event.x - this.viewport.translate.x / this.viewport.zoom,
					y: event.y - this.viewport.translate.y / this.viewport.zoom
				};
			} else if (event.button == 2) {
				if (this.hoverPoint) {
					this.graph.removePoint(this.hoverPoint);
					this.hoverPoint = null;
					this.selectedPoint = null;
				}

				if (this.futurePoint) {
					this.futurePoint = null;
					this.futureSegment = null;
					this.selectedPoint = null;
				}
			}
		}

		#mouseup () {
			this.panStart = null;
			this.grabStart = null;
		}

		#mousemove (event) {
			const canvas = event.target;
			const rect =canvas.getBoundingClientRect();
			const x = (event.x - rect.x - canvas.width / 2) * this.viewport.zoom - this.viewport.translate.x;
			const y = (event.y - rect.y - canvas.height / 2) * this.viewport.zoom - this.viewport.translate.y;

			if (this.panStart) {
				this.viewport.translate.x = (event.x - this.panStart.x) * this.viewport.zoom;
				this.viewport.translate.y = (event.y - this.panStart.y) * this.viewport.zoom;
				return;
			}

			if (this.grabStart) {
				this.hoverPoint.x = (event.x - this.grabStart.x) * this.viewport.zoom;
				this.hoverPoint.y = (event.y - this.grabStart.y) * this.viewport.zoom;
				return;
			}

			this.hoverPoint = this.graph.getNearestPoint(x, y);

			if (this.selectedPoint) {
				this.futurePoint = new Point(x, y);
				this.futureSegment = new Segment(this.futurePoint, this.selectedPoint);
				// this.hoverPoint = null;
			}
		}

		#mousewheel (event) {
			const dir = Math.sign(event.deltaY);
			const step = 0.1;
	
			this.viewport.zoom += dir * step;
			this.viewport.zoom = Math.max(this.viewport.minZoom, Math.min(this.viewport.maxZoom, this.viewport.zoom));
		}

		#mouseout () {
			this.panStart = null;
			this.grabStart = null;
		}

		resize (w, h) {
			this.width = w;
			this.height = h;
		}

		draw (ctx) {
			const pointDrawSize = GRAPH_SETTINGS.POINT_DRAW_SIZE * this.viewport.zoom;
			this.graph.draw(ctx, this.viewport.zoom);

			if (this.futureSegment) Segment.draw(this.futureSegment, ctx, GRAPH_SETTINGS.SEGMENT_FUTURE_COLOR, GRAPH_SETTINGS.SEGEMENT_WIDTH * this.viewport.zoom);
			if (this.futurePoint) Point.draw(this.futurePoint, ctx, GRAPH_SETTINGS.POINT_FUTURE_COLOR, pointDrawSize);
			if (this.hoverPoint) Point.draw(this.hoverPoint, ctx, GRAPH_SETTINGS.POINT_HOVER_COLOR, pointDrawSize / 2);
			if (this.selectedPoint) Point.draw(this.selectedPoint, ctx, GRAPH_SETTINGS.POINT_SELECT_COLOR, pointDrawSize / 2);
		}

		update () {

		}
	}

	function createPoint (x, y) {
		if (typeof x !== 'number' || typeof y !== 'number') {
			console.warn('Invalid type: x and y must be numbers.');
			return null;
		}

		return new Point(x, y);
	}

	function createSegment (a, b) {
		if (!(a instanceof Point) || !(b instanceof Point)) {
			console.warn('Invalid type: Both arguments must be Point objects.');
			return null;
		}

		if (Point.equals(a, b)) {
			console.warn('Invalid Segment: Segment endpoints cannot be the same.', a, b);
			return null;
		}

		return new Segment(a, b);
	}

	function createGraph () {
		return new Graph();
	}

	function createEditor (canvas, graph) {
		return new GraphEditor(canvas, graph);
	}

	exports.createPoint = createPoint;
	exports.createSegment = createSegment;
	exports.createGraph = createGraph;
	exports.createEditor = createEditor;
})(GRAPH = {});
