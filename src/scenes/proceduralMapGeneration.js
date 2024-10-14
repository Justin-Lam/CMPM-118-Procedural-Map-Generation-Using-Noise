class ProceduralMapGeneration extends Phaser.Scene
{
	// Texture Parameters:
	xOffset = 0;				// less = left, more = right
	yOffset = 0;				// less = down, more = up
	frequency = 0.105;			// less = less diversity/zoom in, more = more diversity/zoom out
	fbmEnabled = true;			// "Fractional Brownian Motion"
	numOctaves = 4;				// less = simpler, more = more complicated
	rtf = 1;					// "range transformation formula"; 1 = (n+1)/2, 2 = |n|
	textureEnabled = false;		// refers to the perlin noise texture behind the tile-based map

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
		this.initializeVariables();
		this.initializeControls();

		// Set noise seed
		noise.seed(Math.random());

		// Generate initial map/texture
		this.generate();
	}

	initializeVariables()
	{
		// contains the values returned by the perlin noise function
		this.perlinData = [];
		for (let y = 0; y < MAP_WIDTH; y++) {
			this.perlinData[y] = [];
		}

		// contains the tileIDs derived from the perlin data
		this.mapData = [];
		for (let y = 0; y < MAP_WIDTH; y++) {
			this.mapData[y] = [];
		}
		this.map = null;

		// contains colored squares whose colors are derived from the perlin data
		this.texture = [];
		for (let y = 0; y < MAP_WIDTH; y++) {
			this.texture[y] = [];
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
		this.startingRTF
		this.startingTextureEnabled = this.textureEnabled;

		// Initialize input keys
		this.moveUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		this.moveDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		this.moveLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.moveRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		this.increaseFrequencyKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD);
		this.decreaseFrequencyKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA);
		this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
		this.toggleFBMKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
		this.increaseOctavesKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
		this.decreaseOctavesKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
		this.switchRTFKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
		this.toggleTextureKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
		this.resetChangesKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
		this.randomizeSeedKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

		// Display controls
		const controls = `
		<h2>Controls (open console recommended)</h2>
		Move: WASD | SHIFT + WASD <br>
		Zoom (change frequency): COMMA/PERIOD | SHIFT + COMMA/PERIOD <br>
		<br>
		Toggle FBM: F <br>
		Change Octaves: Q/E <br>
		<br>
		Toggle Texture: T <br>
		Switch Range Transformation Formula: G <br>
		<br>
		Reset Changes: C <br>
		Randomize Seed: R
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
			this.generate();
			console.log(`moved to (${this.xOffset}, ${this.yOffset})`)
		});
		this.moveDownKey.on("down", (key, event) => {					// move down
			if (this.shiftKey.isDown) {
				this.yOffset -= this.largeOffsetChange;
			}
			else {
				this.yOffset -= this.smallOffsetChange;
			}
			this.generate();
			console.log(`moved to (${this.xOffset}, ${this.yOffset})`)
		});
		this.moveLeftKey.on("down", (key, event) => {					// move left
			if (this.shiftKey.isDown) {
				this.xOffset -= this.largeOffsetChange;
			}
			else {
				this.xOffset -= this.smallOffsetChange;
			}
			this.generate();
			console.log(`moved to (${this.xOffset}, ${this.yOffset})`)
		});
		this.moveRightKey.on("down", (key, event) => {					// move right
			if (this.shiftKey.isDown) {
				this.xOffset += this.largeOffsetChange;
			}
			else {
				this.xOffset += this.smallOffsetChange;
			}
			this.generate();
			console.log(`moved to (${this.xOffset}, ${this.yOffset})`)
		});
		this.increaseFrequencyKey.on("down", (key, event) => {			// increase frequency

			const mapCenterXY = MAP_WIDTH / 2;
			const centerXBefore = (mapCenterXY + this.xOffset) * this.frequency;
			const centerYBefore = (mapCenterXY - this.yOffset) * this.frequency;

			if (this.shiftKey.isDown) {
				this.frequency += this.largeFrequencyChange;
			}
			else {
				this.frequency += this.smallFrequencyChange;
			}

			this.xOffset = centerXBefore / this.frequency - mapCenterXY;
			this.yOffset = -(centerYBefore / this.frequency - mapCenterXY);

			this.generate();
			console.log(`frequency = ${this.frequency}`)

		});
		this.decreaseFrequencyKey.on("down", (key, event) => {			// decrease frequency

			const mapCenterXY = MAP_WIDTH / 2;
			const centerXBefore = (mapCenterXY + this.xOffset) * this.frequency;
			const centerYBefore = (mapCenterXY - this.yOffset) * this.frequency;

			if (this.shiftKey.isDown) {
				this.frequency -= this.largeFrequencyChange;
			}
			else {
				this.frequency -= this.smallFrequencyChange;
			}

			this.xOffset = centerXBefore / this.frequency - mapCenterXY;
			this.yOffset = -(centerYBefore / this.frequency - mapCenterXY);

			this.generate();
			console.log(`frequency = ${this.frequency}`)
		});
		this.toggleFBMKey.on("down", (key, event) => {					// toggle FBM
			this.fbmEnabled = !this.fbmEnabled;
			this.generate();
			if (this.fbmEnabled) {
				console.log("FBM enabled");
			}
			else {
				console.log("FBM disabled");
			}
		});
		this.increaseOctavesKey.on("down", (key, event) => {			// increase octaves
			this.numOctaves++;
			this.generate();
			console.log(`octaves = ${this.numOctaves}`);
		});
		this.decreaseOctavesKey.on("down", (key, event) => {			// decrease octaves
			this.numOctaves--;
			this.generate();
			console.log(`octaves = ${this.numOctaves}`);
		});
		this.switchRTFKey.on("down", (key, event) => {					// switch RTF
			if (this.rtf == 1) {
				this.rtf = 2;
				console.log("transforming [-1, 1] to [0, 1] via |n|")
			}
			else {
				this.rtf = 1;
				console.log("transforming [-1, 1] to [0, 1] via (n-1)/2")
			}
			this.generate();
		});
		this.toggleTextureKey.on("down", (key, event) => {				// toggle texture
			this.textureEnabled = !this.textureEnabled;
			this.generate();
			if (this.textureEnabled) {
				console.log("showing texture");
			}
			else {
				console.log("showing map");
			}
		});
		this.resetChangesKey.on("down", (key, event) => {				// reset changes
			this.xOffset = this.startingXOffset;
			this.yOffset = this.startingYOffset;
			this.frequency = this.startingFrequency;
			this.fbmEnabled = this.startingFBMEnabled;
			this.numOctaves = this.startingNumOctaves;
			this.textureEnabled = this.startingTextureEnabled;
			this.generate();
			console.log("reset changes");
		});
		this.randomizeSeedKey.on("down", (key, event) => {				// randomize seed
			noise.seed(Math.random());
			this.generate();
			console.log("changed seed");
		});
	}

	generate()
	{
		// Generate perlin data
		this.generatePerlinData();

		// Destroy map & texture
		this.destroyMapAndTexture();

		// Generate map/texture
		if (this.textureEnabled)		// generate texture
		{
			this.generateTexture();
		}
		else							// generate map
		{
			this.generateMapData();
			this.createMap();
		}
	}

	generatePerlinData()
	{
		// Use the perlin noise function to fill perlinData
		for (let y = 0; y < MAP_WIDTH; y++) {
			for (let x = 0; x < MAP_WIDTH; x++) {

				// Stack octaves of the same position to get a perlin value thats usually between [-1, 1]
				let result = 0;
				let amplitude = 1;
				let frequency = this.frequency;
				let numOctaves = this.numOctaves;
				if (!this.fbmEnabled) {
					numOctaves = 1;
				}
				for (let octave = 0; octave < numOctaves; octave++) {
					const octaveResult = amplitude * noise.perlin2((x + this.xOffset) * frequency, (y - this.yOffset) * frequency);
					result += octaveResult;
					amplitude *= 0.5;
					frequency *= 2;
				}

				// Clamp result so it's between [-1, 1]
				result = Phaser.Math.Clamp(result, -1, 1);
				
				// Transform the value to be between [0, 1]
				result = this.transformRange(result);

				// Set the element
				this.perlinData[y][x] = result;
			}
		}
	}
	transformRange(value)
	{
		if (this.rtf == 1) {
			return (value + 1) / 2;
		}
		else {
			return Math.abs(value);
		}
	}

	destroyMapAndTexture()
	{
		// Destroy map
		if (this.map != null) {
			this.map.destroy();		// also destroys any layers
		}

		// Destroy texture
		for (let y = 0; y < MAP_WIDTH; y++) {
			for (let x = 0; x < MAP_WIDTH; x++) {
				if (this.texture[y][x] != null) {
					this.texture[y][x].destroy();
				}	
			}
		}
	}

	generateTexture()
	{
		// Generate the texture by creating the squares and use the perlin data to determine their color
		for (let y = 0; y < MAP_WIDTH; y++) {
			for (let x = 0; x < MAP_WIDTH; x++) {

				const value = this.perlinData[y][x];
				const colorValue = Math.floor(value * 255)
				const color = Phaser.Display.Color.GetColor(colorValue, colorValue, colorValue);
				this.texture[y][x] = this.add.rectangle(x*TILE_WIDTH, y*TILE_WIDTH, TILE_WIDTH, TILE_WIDTH, color).setOrigin(0);
			}
		}
	}

	generateMapData()
	{
		// Set constants
		const waterTileID = 56;
		const grassTileID = 40;
		const dirtTileID = 105;
		const totalWeight = this.waterWeight + this.grassWeight + this.dirtWeight;

		// Use the perlin data to set the tile type
		for (let y = 0; y < MAP_WIDTH; y++) {
			for (let x = 0; x < MAP_WIDTH; x++) {

				const value = this.perlinData[y][x];
				if (value < this.waterWeight/totalWeight) {								// water
					this.mapData[y][x] = waterTileID;
				}
				else if (value < (this.waterWeight+this.grassWeight)/totalWeight) {		// grass
					this.mapData[y][x] = grassTileID;
				}
				else {																	// dirt
					this.mapData[y][x] = dirtTileID;
				}

			}
		}
	}
	createMap()
	{
		// Use mapData to create the map
		this.map = this.make.tilemap({
			data: this.mapData,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_WIDTH
		});
		const tileset = this.map.addTilesetImage("map pack");
		const layer = this.map.createLayer(0, tileset, 0, 0);
	}
}