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
					this.graph.envelopes.push(new Envelope(joinSegement, 100));
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
				this.graph.envelopes.push(new Envelope(this.futureSegment, 100));
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
