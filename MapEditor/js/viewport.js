class ViewPort {
	constructor (canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		this.minZoom = 1;
		this.maxZoom = 10;
		this.zoom = this.minZoom;
		this.translate = { x: 0, y: 0 };
	}

	update () {
		const scale = 1 / this.zoom;

		this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
		this.ctx.scale(scale, scale);
		this.ctx.translate(this.translate.x, this.translate.y);
	}
}
