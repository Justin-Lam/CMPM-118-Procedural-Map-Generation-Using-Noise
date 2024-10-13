// debug with extreme prejudice
"use strict"

let config = {
	parent: 'phaser-game',
	type: Phaser.CANVAS,
	width: 640,
	height: 640,
	zoom: 1,
	autoCenter: true,
	render: {
		pixelArt: true 		// prevent pixel art from getting blurred when scaled
	},
	scene: [ProceduralMapGeneration]
}

const game = new Phaser.Game(config);