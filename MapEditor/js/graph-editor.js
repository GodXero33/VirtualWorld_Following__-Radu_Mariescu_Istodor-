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
		this.activeX = true;
		this.activeY = true;
		this.history = [];

		this.newHistory();
		//this.loadHistory('{"points":[{"x":0.5,"y":-135.5},{"x":-222.5,"y":26.5},{"x":192.5,"y":245.5}],"segments":[{"a":1,"b":0},{"a":2,"b":1},{"a":0,"b":2}]}');
	}

	addEventListeners (canvas) {
		canvas.addEventListener('mousedown', this.#mousedown.bind(this));
		canvas.addEventListener('mouseup', this.#mouseup.bind(this));
		canvas.addEventListener('mousemove', this.#mousemove.bind(this));
		canvas.addEventListener('wheel', this.#mousewheel.bind(this));
		canvas.addEventListener('mouseout', this.#mouseout.bind(this));
		canvas.addEventListener('contextmenu', event => event.preventDefault());
		window.addEventListener('keydown', this.#keydown.bind(this));
		window.addEventListener('keyup', this.#keyup.bind(this));

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
		if (this.grabStart == null) this.newHistory();

		this.panStart = null;
		this.grabStart = null;
		this.activeX = true;
		this.activeY = true;
	}

	#mousemove (event) {
		const canvas = event.target;
		const rect =canvas.getBoundingClientRect();
		const x = (event.x - rect.x - canvas.width / 2) * this.viewport.zoom - this.viewport.translate.x;
		const y = (event.y - rect.y - canvas.height / 2) * this.viewport.zoom - this.viewport.translate.y;

		if (this.panStart) {
			this.viewport.translate.x = this.activeX ? (event.x - this.panStart.x) * this.viewport.zoom : this.viewport.translate.x;
			this.viewport.translate.y = this.activeY ? (event.y - this.panStart.y) * this.viewport.zoom : this.viewport.translate.y;
			return;
		}

		if (this.grabStart) {
			this.hoverPoint.x = this.activeX ? (event.x - this.grabStart.x) * this.viewport.zoom : this.hoverPoint.x;
			this.hoverPoint.y = this.activeY ? (event.y - this.grabStart.y) * this.viewport.zoom : this.hoverPoint.y;
			
			this.graph.segments.filter(segment => segment.a == this.hoverPoint || segment.b == this.hoverPoint).forEach(segment => Segment.update(segment));
			return;
		}

		this.hoverPoint = this.graph.getNearestPoint(x, y, this.viewport.zoom);

		if (this.selectedPoint) {
			this.futurePoint = new Point(this.activeX ? x : this.selectedPoint.x, this.activeY ? y : this.selectedPoint.y);
			this.futureSegment = new Segment(this.futurePoint, this.selectedPoint);
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

	#keydown (event) {
		// 
	}

	#keyup (event) {
		if (event.code == 'KeyX') {
			this.activeX = true;
			this.activeY = false;
		} else if (event.code == 'KeyY') {
			this.activeX = false;
			this.activeY = true;
		} else if (event.code == 'KeyU') {
			if (this.history.length == 0) return;

			const historyStr = this.history.splice(this.history.length - 1, 1);
			this.loadHistory(historyStr);
		}
	}

	newHistory () {
		const points = this.graph.points;
		const segments = this.graph.segments.map(segment => {
			let a = points.findIndex(point => point == segment.a);
			let b = points.findIndex(point => point == segment.b);
			return { a, b };
		});

		const historyStr = JSON.stringify({ points, segments });
		this.history.push(historyStr);

		if (this.history.length > 100) this.history.splice(0, 1);
	}

	loadHistory (historyStr) {
		const history = JSON.parse(historyStr);
		const points = history.points.map(point => new Point(point.x, point.y));
		const segments = history.segments.map(segment => new Segment(points[segment.a], points[segment.b]));

		this.graph.points = points;
		this.graph.segments = segments;
	}

	resize (w, h) {
		this.width = w;
		this.height = h;
	}

	drawGrid (ctx) {
		const step = GRAPH_SETTINGS.GRAPH_GRID_STEP_SIZE;
		let indSizeX = GRAPH_SETTINGS.GRAPH_GRID_INDICATERS_SIZE * this.viewport.zoom;
		let indSizeY = GRAPH_SETTINGS.GRAPH_GRID_INDICATERS_SIZE * this.viewport.zoom;
		let x1 = 0;
		let y1 = -this.height * this.viewport.zoom / 2 - this.viewport.translate.y;
		let x2 = 0;
		let y2 = this.height * this.viewport.zoom / 2 - this.viewport.translate.y;
		let x3 = -this.width * this.viewport.zoom / 2 - this.viewport.translate.x;
		let y3 = 0;
		let x4 = this.width * this.viewport.zoom / 2 - this.viewport.translate.x;
		let y4 = 0;

		if (y1 >= 0) y3 = y4 = y1;
		if (y2 <= 0) y3 = y4 = y2;
		if (x3 >= 0) x1 = x2 = x3;
		if (x4 <= 0) x1 = x2 = x4;

		if (y2 - indSizeY <= 0) indSizeY = -indSizeY;
		if (x3 + indSizeX >= 0) indSizeX = -indSizeX;

		ctx.strokeStyle = GRAPH_SETTINGS.GRPAH_GRID_INDICATERS_COLOR;
		ctx.lineWidth = 1 * this.viewport.zoom;
		ctx.beginPath();

		for (let x = x1 - x1 % step; x < x4; x += step) {
			ctx.moveTo(x, y3);
			ctx.lineTo(x, y3 + indSizeY);
		}

		for (let x = x2 - x2 % step; x > x3; x -= step) {
			ctx.moveTo(x, y3);
			ctx.lineTo(x, y3 + indSizeY);
		}

		for (let y = y3 - y3 % step; y < y2; y += step) {
			ctx.moveTo(x1, y);
			ctx.lineTo(x1 - indSizeX, y);
		}

		for (let y = y4 - y4 % step; y > y1; y -= step) {
			ctx.moveTo(x1, y);
			ctx.lineTo(x1 - indSizeX, y);
		}

		ctx.stroke();

		ctx.strokeStyle = GRAPH_SETTINGS.GRPAH_GRID_AXIS_COLOR;
		ctx.lineWidth = 2 * this.viewport.zoom;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.moveTo(x3, y3);
		ctx.lineTo(x4, y4);
		ctx.stroke();
	}

	draw (ctx) {
		const pointDrawSize = GRAPH_SETTINGS.POINT_DRAW_SIZE * this.viewport.zoom;
		this.drawGrid(ctx);
		this.graph.draw(ctx, this.viewport.zoom);

		if (this.futureSegment) Segment.draw(this.futureSegment, ctx, GRAPH_SETTINGS.SEGMENT_FUTURE_COLOR, GRAPH_SETTINGS.SEGEMENT_WIDTH * this.viewport.zoom);
		if (this.futurePoint) Point.draw(this.futurePoint, ctx, GRAPH_SETTINGS.POINT_FUTURE_COLOR, pointDrawSize);
		if (this.hoverPoint) Point.draw(this.hoverPoint, ctx, GRAPH_SETTINGS.POINT_HOVER_COLOR, pointDrawSize / 2);
		if (this.selectedPoint) Point.draw(this.selectedPoint, ctx, GRAPH_SETTINGS.POINT_SELECT_COLOR, pointDrawSize / 2);
	}

	update () {

	}
}
