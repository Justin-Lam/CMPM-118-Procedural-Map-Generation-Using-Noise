class ProceduralMapGeneration extends Phaser.Scene
{
	constructor() {
		super("proceduralMapGenerationScene");
	}

	preload()
	{

	}

	create()
	{
		const xOffset = 0;
		const yOffset = 0;
		const frequency = 0.1;

		const textureWidth = 256;
		const perlinValues = [];
		for (let y = 0; y < textureWidth; y++) {
			perlinValues[y] = [];
		}
		const texture = [];
		for (let y = 0; y < textureWidth; y++) {
			texture[y] = [];
			for (let x = 0; x < textureWidth; x++) {
				texture[y][x] = this.add.rectangle(x, y, 1, 1, 0xff0000);		// 0xff0000 = red
			}
		}

		noise.seed(Math.random());

		for (let y = 0; y < textureWidth; y++) {
			for (let x = 0; x < textureWidth; x++) {
				// All noise functions return values in the range of -1 to 1.
				const value = noise.perlin2((x + xOffset) * frequency, (y + yOffset) * frequency);
				perlinValues[y][x] = value;
			}
		}

		for (let y = 0; y < textureWidth; y++) {
			for (let x = 0; x < textureWidth; x++) {
				let value = perlinValues[y][x];
				value = Math.floor(((value + 1) / 2) * 255);
				texture[y][x].fillColor = Phaser.Display.Color.GetColor(value, value, value);
			}
		}

		const textureColors = [];
		for (let y = 0; y < textureWidth; y++) {
			textureColors[y] = [];
		}
		for (let y = 0; y < textureWidth; y++) {
			for (let x = 0; x < textureWidth; x++) {
				let value = perlinValues[y][x];
				value = Math.floor(((value + 1) / 2) * 255);
				textureColors[y][x] = value;
			}
		}
		console.log(textureColors);

		let min = perlinValues[0][0];
		let max = min;
		for (let y = 0; y < textureWidth; y++) {
			for (let x = 0; x < textureWidth; x++) {
				const value = perlinValues[y][x];
				if (value < min) {
					min = value;
				}
				else if (value > max) {
					max = value;
				}
			}
		}
		console.log(`min: ${min}, max: ${max}`);

		console.log(`[0][0] = ${textureColors[0][0]}`)
	}

	update()
	{

	}
}