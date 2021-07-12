
// A class of beings that are defined by their DNA
app.types.flower = class Flower {
	constructor(aof) {
        this.aof = aof
    }

	draw(p) {
		// Draw the rectangle
		p.fill(0)
	}
}


app.types.flower.labels = ["petalCount", "height", "leafSize", "leafAspect", "petalSize", "petalAspect"]