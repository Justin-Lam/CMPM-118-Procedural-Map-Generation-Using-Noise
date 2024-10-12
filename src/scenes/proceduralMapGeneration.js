class ProceduralMapGeneration extends Phaser.Scene
{
	// Parameters:
	xOffset = 0;		// less = left, more = right
	yOffset = 0;		// less = down, more = up
	frequency = 0.105;	// less = less diversity/zoom in, more = more diversity/zoom out
	
	// Methods:
	constructor() {
		super("proceduralMapGenerationScene");
	}

	preload()
	{

	}

	create()
	{
		// Initialize things
		this.initializeTexture();
		this.initializeControls();

		// Set seed
		noise.seed(Math.random());

		// Generate initial texture
		this.generateTexture();
	}

	update()
	{

	}

	initializeTexture()
	{
		// Initialize variables
		// notice that these variables are attributes of this scene class
		// we do this because we want them to persist past this function call and also have other functions be able to access them
		// i didn't put them along with the parameter variables at the top of this script because i only wanted variables whose values i'd be changing up there
		this.textureWidth = game.config.width;
		this.texture = [];

		// Fill in texture with red squares (pixels)
		// the squares' colors will be changed later when we generate the texture
		// we set the squares to red initially because then they'll show if something went wrong with the texture generation
		for (let y = 0; y < this.textureWidth; y++) {
			this.texture[y] = [];
			for (let x = 0; x < this.textureWidth; x++) {
				this.texture[y][x] = this.add.rectangle(x, y, 1, 1, 0xff0000).setOrigin(0, 0);		// 0xff0000 = red
			}
		}
	}

	generateTexture()
	{
		// Use the perlin noise function to get the color value for each square in texture

		for (let y = 0; y < this.textureWidth; y++) {
			for (let x = 0; x < this.textureWidth; x++) {
				
				// Get a perlin value thats between [-1, 1]
				let value = noise.perlin2((x + this.xOffset) * this.frequency, (y - this.yOffset) * this.frequency);

				// Transform the value to be between [0, 1]
				value = (value + 1) / 2;
				//value = Math.floor(Math.abs(value) * 255);		// different way of changing the range to [0, 1] that produces a different looking type of texture

				// Transform the value to be a whole number between [0, 255]
				value = Math.floor(value * 255);

				// Change the square's color
				this.texture[y][x].fillColor = Phaser.Display.Color.GetColor(value, value, value);
				
			}
		}

		// Get debug info on the texture
		this.debug();
	}

	initializeControls()
	{
		// Parameters:
		const largeOffsetChange = 10;
		const smallOffsetChange = 1;
		const largeFrequencyChange = 0.1;
		const smallFrequencyChange = 0.01;
		const largeTextureWidthChange = 10;
		const smallTextureWidthChange = 1;

		// Variables:
		this.startingXOffset = this.xOffset;
		this.startingYOffset = this.yOffset;
		this.startingFrequency = this.frequency;
		this.moveUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		this.moveDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		this.moveLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.moveRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		this.IncreaseFrequencyKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
		this.DecreaseFrequencyKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
		this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
		this.changeSeedKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
		this.resetKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		// Events:
		this.moveUpKey.on("down", (key, event) => {						// move up
			if (this.shiftKey.isDown) {
				this.yOffset += largeOffsetChange;
			}
			else {
				this.yOffset += smallOffsetChange;
			}
			this.generateTexture();
			console.log(`moved to (${this.xOffset}, ${this.yOffset})`)
		});
		this.moveDownKey.on("down", (key, event) => {					// move down
			if (this.shiftKey.isDown) {
				this.yOffset -= largeOffsetChange;
			}
			else {
				this.yOffset -= smallOffsetChange;
			}
			this.generateTexture();
			console.log(`moved to (${this.xOffset}, ${this.yOffset})`)
		});
		this.moveLeftKey.on("down", (key, event) => {					// move left
			if (this.shiftKey.isDown) {
				this.xOffset -= largeOffsetChange;
			}
			else {
				this.xOffset -= smallOffsetChange;
			}
			this.generateTexture();
			console.log(`moved to (${this.xOffset}, ${this.yOffset})`)
		});
		this.moveRightKey.on("down", (key, event) => {					// move right
			if (this.shiftKey.isDown) {
				this.xOffset += largeOffsetChange;
			}
			else {
				this.xOffset += smallOffsetChange;
			}
			this.generateTexture();
			console.log(`moved to (${this.xOffset}, ${this.yOffset})`)
		});
		this.IncreaseFrequencyKey.on("down", (key, event) => {			// increase frequency
			if (this.shiftKey.isDown) {
				this.frequency += largeFrequencyChange;
			}
			else {
				this.frequency += smallFrequencyChange;
			}
			this.generateTexture();
			console.log(`frequency = ${this.frequency}`)
		});
		this.DecreaseFrequencyKey.on("down", (key, event) => {			// decrease frequency
			if (this.shiftKey.isDown) {
				this.frequency -= largeFrequencyChange;
			}
			else {
				this.frequency -= smallFrequencyChange;
			}
			this.generateTexture();
			console.log(`frequency = ${this.frequency}`)
		});
		this.changeSeedKey.on("down", (key, event) => {					// change seed
			noise.seed(Math.random());
			this.generateTexture();
			console.log("changed seed");
		})
		this.resetKey.on("down", (key, event) => {						// reset
			this.xOffset = this.startingXOffset;
			this.yOffset = this.startingYOffset;
			this.frequency = this.startingFrequency;
			this.generateTexture();
			console.log("reset");
		})
	}

	debug()
	{
		// Display each pixel's color of texture
		const textureColors = [];
		for (let y = 0; y < this.textureWidth; y++) {
			textureColors[y] = [];
		}
		for (let y = 0; y < this.textureWidth; y++) {
			for (let x = 0; x < this.textureWidth; x++) {
				const colorInt = this.texture[y][x].fillColor;
				const rgb = Phaser.Display.Color.IntegerToRGB(colorInt);
				textureColors[y][x] = rgb.r;
			}
		}
		console.log(textureColors);

		// Display the minimum, maximum, and average color of texture
		let min = textureColors[0][0];
		let max = min;
		let total = 0;
		for (let y = 0; y < this.textureWidth; y++) {
			for (let x = 0; x < this.textureWidth; x++) {
				const value = textureColors[y][x];
				if (value < min) {
					min = value;
				}
				else if (value > max) {
					max = value;
				}
				total += value;
			}
		}
		const avg = total / (this.textureWidth*this.textureWidth);
		console.log(`min: ${min}, max: ${max}, avg: ${avg}`);

		// Display the color of the first pixel of texture
		console.log(`[0][0] = ${textureColors[0][0]}`)
	}
}