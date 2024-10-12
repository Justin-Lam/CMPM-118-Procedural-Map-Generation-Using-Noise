// debug with extreme prejudice
"use strict"

let config = {
	parent: 'phaser-game',
	type: Phaser.CANVAS,
	width: 50,
	height: 50,
	zoom: 10,
	autoCenter: true,
	render: {
		pixelArt: true 		// prevent pixel art from getting blurred when scaled
	},
	scene: [ProceduralMapGeneration]
}

const game = new Phaser.Game(config);