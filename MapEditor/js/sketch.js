(function () {
	let canvas, ctx, viewPort, graph, editor;
	let width = 0, height = 0;
	let isAnimating = false;

	function draw () {
		const transform = ctx.getTransform();

		ctx.fillStyle = GRAPH_SETTINGS.GRAPH_COLOR;
		ctx.fillRect(0, 0, width, height);
		viewPort.update();

		editor.draw(ctx);

		ctx.setTransform(transform);
	}

	function update () {
		editor.update();
	}

	function animate () {
		if (!isAnimating) return;
		
		draw();
		update();
		window.requestAnimationFrame(animate);
	}

	function play () {
		isAnimating = true;
		animate();
	}

	function pause () {
		isAnimating = false;
	}

	function resize () {
		canvas.width = canvas.parentElement.clientWidth;
		canvas.height = canvas.parentElement.clientHeight;

		width = canvas.width;
		height = canvas.height;

		editor.resize(width, height);
	}

	window.addEventListener('load', () => {
		canvas = document.getElementById('canvas');
		ctx = canvas.getContext('2d');
		viewPort = new ViewPort(canvas);
		graph = new Graph();
		editor = new GraphEditor(graph, viewPort).addEventListeners(canvas);

		console.log(viewPort, graph, editor);

		resize();
		play();
	});

	window.addEventListener('resize', resize);

	window.addEventListener('keyup', (event) => {
		if (event.code == 'Space') (isAnimating ? pause : play)();
	});
})();
