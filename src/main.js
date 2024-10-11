// debug with extreme prejudice
"use strict"

const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;
const TILE_WIDTH = 64;

let config = {
	parent: 'phaser-game',
	type: Phaser.CANVAS,
	width: 256 * TILE_WIDTH,
	height: 256 * TILE_WIDTH,
	zoom: 0.05,
	autoCenter: true,
	fps: { forceSetTimeOut: true, target: 60 },
	render: {
		pixelArt: true 		// prevent pixel art from getting blurred when scaled
	},
	scene: [ProceduralMapGeneration]
}

const game = new Phaser.Game(config);