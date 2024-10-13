class ProceduralMapGeneration extends Phaser.Scene
{
	// Texture Parameters:
	xOffset = 0;			// less = left, more = right
	yOffset = 0;			// less = down, more = up
	frequency = 0.105;		// less = less diversity/zoom in, more = more diversity/zoom out
	fbmEnabled = true;		// "Fractional Brownian Motion"
	numOctaves = 4;			// less = simpler, more = more complicated

	// Map Parameters:
	waterWeight = 2;
	grassWeight = 1;
	dirtWeight = 1;

	// Control Parameters:
	largeOffsetChange = 5;
	smallOffsetChange = 1;
	largeFrequencyChange = 0.1;
	smallFrequencyChange = 0.01;

	// Methods:
	constructor() {
		super("proceduralMapGenerationScene");
	}

	preload()
	{
		// Set load path and load map pack
		this.load.path = './assets/';
		this.load.image("map pack", "mapPack_spritesheet.png");
	}

	create()
	{
		// Initialize things
		this.initializeMapVariables();
		this.initializeControls();

		// Set noise seed
		noise.seed(Math.random());

		// Generate initial map
		this.generateMap();
	}

	initializeMapVariables()
	{
		this.map = null;
		this.mapData = [];
		for (let y = 0; y < MAP_WIDTH; y++) {
			this.mapData[y] = [];
		}
	}

	initializeControls()
	{
		// Initialize variables
		this.startingXOffset = this.xOffset;
		this.startingYOffset = this.yOffset;
		this.startingFrequency = this.frequency;
		this.startingFBMEnabled = this.fbmEnabled;
		this.startingNumOctaves = this.numOctaves;

		// Initialize input keys
		this.moveUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		this.moveDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		this.moveLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.moveRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		this.increaseFrequencyKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD);
		this.decreaseFrequencyKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA);
		this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
		this.toggleFBMKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
		this.increaseOctavesKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.decreaseOctavesKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.randomizeSeedKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
		this.resetChangesKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

		// Display controls
		const controls = `
		<h2>Controls</h2>
		Move: WASD | SHIFT + WASD <br>
		Zoom (change frequency): COMMA/PERIOD | SHIFT + COMMA/PERIOD <br>
		<br>
		FBM (default enabled): F <br>
		Change Octaves: UP/DOWN <br>
		<br>
		Randomize Seed: R <br>
		Reset Changes: C
		`;
		document.getElementById("description").innerHTML = controls;

		// Create events
		this.moveUpKey.on("down", (key, event) => {						// move up
			if (this.shiftKey.isDown) {
				this.yOffset += this.largeOffsetChange;
			}
			else {
				this.yOffset += this.smallOffsetChange;
			}
			this.generateMap();
			console.log(`moved to (${this.xOffset}, ${this.yOffset})`)
		});
		this.moveDownKey.on("down", (key, event) => {					// move down
			if (this.shiftKey.isDown) {
				this.yOffset -= this.largeOffsetChange;
			}
			else {
				this.yOffset -= this.smallOffsetChange;
			}
			this.generateMap();
			console.log(`moved to (${this.xOffset}, ${this.yOffset})`)
		});
		this.moveLeftKey.on("down", (key, event) => {					// move left
			if (this.shiftKey.isDown) {
				this.xOffset -= this.largeOffsetChange;
			}
			else {
				this.xOffset -= this.smallOffsetChange;
			}
			this.generateMap();
			console.log(`moved to (${this.xOffset}, ${this.yOffset})`)
		});
		this.moveRightKey.on("down", (key, event) => {					// move right
			if (this.shiftKey.isDown) {
				this.xOffset += this.largeOffsetChange;
			}
			else {
				this.xOffset += this.smallOffsetChange;
			}
			this.generateMap();
			console.log(`moved to (${this.xOffset}, ${this.yOffset})`)
		});
		this.increaseFrequencyKey.on("down", (key, event) => {			// increase frequency
			if (this.shiftKey.isDown) {
				this.frequency += this.largeFrequencyChange;
			}
			else {
				this.frequency += this.smallFrequencyChange;
			}
			this.generateMap();
			console.log(`frequency = ${this.frequency}`)
		});
		this.decreaseFrequencyKey.on("down", (key, event) => {			// decrease frequency
			if (this.shiftKey.isDown) {
				this.frequency -= this.largeFrequencyChange;
			}
			else {
				this.frequency -= this.smallFrequencyChange;
			}
			this.generateMap();
			console.log(`frequency = ${this.frequency}`)
		});
		this.toggleFBMKey.on("down", (key, event) => {					// toggle FBM
			this.fbmEnabled = !this.fbmEnabled;
			this.generateMap();
			if (this.fbmEnabled) {
				console.log("FBM enabled");
			}
			else {
				console.log("FBM disabled");
			}
		});
		this.increaseOctavesKey.on("down", (key, event) => {			// increase octaves
			this.numOctaves++;
			this.generateMap();
			console.log(`octaves = ${this.numOctaves}`);
		});
		this.decreaseOctavesKey.on("down", (key, event) => {			// decrease octaves
			this.numOctaves--;
			this.generateMap();
			console.log(`octaves = ${this.numOctaves}`);
		});
		this.randomizeSeedKey.on("down", (key, event) => {					// change seed
			noise.seed(Math.random());
			this.generateMap();
			console.log("changed seed");
		});
		this.resetChangesKey.on("down", (key, event) => {						// reset
			this.xOffset = this.startingXOffset;
			this.yOffset = this.startingYOffset;
			this.frequency = this.startingFrequency;
			this.fbmEnabled = this.startingFBMEnabled;
			this.numOctaves = this.startingNumOctaves;
			this.generateMap();
			console.log("reset changes");
		});
	}

	generateMap()
	{
		// Use the perlin noise function to get each tile in mapData
		for (let y = 0; y < MAP_WIDTH; y++) {
			for (let x = 0; x < MAP_WIDTH; x++) {

				let result = 0;
				if (this.fbmEnabled) {		// FBM enabled
					
					// Stack octaves of the same position to get a perlin value thats usually between [-1, 1]
					let amplitude = 1;
					let frequency = this.frequency;
					for (let octave = 0; octave < this.numOctaves; octave++) {
						const octaveResult = amplitude * noise.perlin2((x + this.xOffset) * frequency, (y - this.yOffset) * frequency);
						result += octaveResult;
						amplitude *= 0.5;
						frequency *= 2;
					}

					// Clamp result so it's between [-1, 1]
					result = Phaser.Math.Clamp(result, -1, 1);

				}
				else {						// FBM disabled

					// Get a perlin value thats between [-1, 1]
					result = noise.perlin2((x + this.xOffset) * this.frequency, (y - this.yOffset) * this.frequency);

				}
				
				// Transform the value to be between [0, 1]
				result = (result + 1) / 2;
				//value = Math.floor(Math.abs(value) * 255);		// different way of changing the range to [0, 1] that produces a different looking type of texture

				// Use result to set the tile type
				const waterTileID = 56;
				const grassTileID = 40;
				const dirtTileID = 105;
				const totalWeight = this.waterWeight + this.grassWeight + this.dirtWeight;
				if (result < this.waterWeight/totalWeight) {								// water
					this.mapData[y][x] = waterTileID;
				}
				else if (result < (this.waterWeight+this.grassWeight)/totalWeight) {		// grass
					this.mapData[y][x] = grassTileID;
				}
				else {																		// dirt
					this.mapData[y][x] = dirtTileID;
				}

			}
		}

		// Use mapData to create the map
		if (this.map != null) {
			this.map.destroy();		// also destroy any layers
		}
		this.map = this.make.tilemap({
			data: this.mapData,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_WIDTH
		});
		const tileset = this.map.addTilesetImage("map pack");
		const layer = this.map.createLayer(0, tileset, 0, 0);
	}
}