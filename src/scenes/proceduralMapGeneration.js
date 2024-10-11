class ProceduralMapGeneration extends Phaser.Scene
{
	constructor() {
		super("proceduralMapGenerationScene");
	}

	preload()
	{
		// Set load path
		this.load.path = './assets/';

		//this.load.image("smb_tiles", "smb_tiles_simple.png")

		// Load spritesheet
		this.load.image("mapPackSpriteSheet", "mapPack_spritesheet.png")
		/*
		this.load.spritesheet("mapPackSpriteSheet", "mapPack_spritesheet.png", {
			frameWidth: TILE_WIDTH,
			frameHeight: TILE_HEIGHT
		});
		*/
	}

	create()
	{
		// Define constants
		const width = 256;
		const height = 256;
		const xOffset = 0;
		const yOffset = 0;
		const frequency = 0.1;

		const grassTileID = 40;
		const dirtTileID = 105;
		const waterTileID = 56;

		// Initialize texture
		const texture = [];
		for (let y = 0; y < width; y++) {
			// Create rows
			texture[y] = [];
		}

		// Initialize mapData
		// this represents the game's map
		// it's a 2D array where each element at a position represents the map's tileID at that position);
		// orientation is [row/y][col/x], size is [MAP_HEIGHT][MAP_WIDTH]
		const mapData = [];
		for (let y = 0; y < MAP_HEIGHT; y++) {
			// Create rows
			mapData[y] = [];
		}
		
		// Set seed
		noise.seed(Math.random());

		// Fill in texture
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				// all noise functions return values in the range [-1, 1]
				let value = noise.perlin2((x + xOffset) * frequency, (y + yOffset) * frequency);
				// we want to convert that range to [0, 1] so we apply this formula
				value = (value + 1) / 2;
				// add value to texture
				//texture[y][x] = value;
				if (value < 0.33) {
					texture[y - yOffset][x - xOffset] = grassTileID;
				}
				else if (value < 0.66) {
					texture[y - yOffset][x - xOffset] = dirtTileID;
				}
				else {
					texture[y - yOffset][x - xOffset] = waterTileID;
				}
			}
		}
		console.log(texture);

		// Fill in mapData
		for (let y = yOffset; y < yOffset + MAP_HEIGHT; y++) {
			for (let x = xOffset; x < xOffset + MAP_WIDTH; x++) {
				let value = texture[y][x];
				if (value < 0.33) {
					mapData[y - yOffset][x - xOffset] = grassTileID;
				}
				else if (value < 0.66) {
					mapData[y - yOffset][x - xOffset] = dirtTileID;
				}
				else {
					mapData[y - yOffset][x - xOffset] = waterTileID;
				}
			}
		}

		const map = this.make.tilemap({
			data: texture,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_WIDTH
		});
		const tileSheet = map.addTilesetImage("mapPackSpriteSheet");
		const layer = map.createLayer(0, tileSheet, 0, 0);
	}

	update()
	{

	}
}