// debug with extreme prejudice
"use strict"

let config = {
	parent: 'phaser-game',
	type: Phaser.CANVAS,
	width: 256,
	height: 256,
	autoCenter: true,
	render: {
		pixelArt: true 		// prevent pixel art from getting blurred when scaled
	},
	scene: [ProceduralMapGeneration]
}

const game = new Phaser.Game(config);