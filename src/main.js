// debug with extreme prejudice
"use strict"

const MAP_WIDTH = 20;
const TILE_WIDTH = 64;

let config = {
	parent: 'phaser-game',
	type: Phaser.CANVAS,
	width: MAP_WIDTH * TILE_WIDTH,
	height: MAP_WIDTH * TILE_WIDTH,
	zoom: 0.5,
	autoCenter: true,
	render: {
		pixelArt: true 		// prevent pixel art from getting blurred when scaled
	},
	scene: [ProceduralMapGeneration]
}

const game = new Phaser.Game(config);