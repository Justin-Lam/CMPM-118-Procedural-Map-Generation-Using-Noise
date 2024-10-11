// debug with extreme prejudice
"use strict"

let config = {
	parent: 'phaser-game',
	type: Phaser.CANVAS,
	width: 16 * 70,
	height: 9 * 70,
	autoCenter: true,
	fps: { forceSetTimeOut: true, target: 60 },
	render: {
		pixelArt: true 		// prevent pixel art from getting blurred when scaled
	},
	scene: [Load, ProceduralMapGeneration]
}

const game = new Phaser.Game(config);