class World {
	constructor (graph) {
		this.graph = graph;
		this.polys = [];
	}

	update () {
		
	}

	drawPoly (ctx) {
		
	}

	draw (ctx) {
		this.polys.forEach(poly => this.drawPoly(poly, ctx));
	}
}
