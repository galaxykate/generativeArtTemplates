

// A class of beings that are defined by their DNA
app.types.face = class Face {
	constructor(aof) {
		this.aof = aof
	}

	draw(p) {
		// Draw the rectangle
		p.fill(0)
	}
}

app.types.face.labels = ["eyeWidth", "eyeHue", "aspect", "size"]