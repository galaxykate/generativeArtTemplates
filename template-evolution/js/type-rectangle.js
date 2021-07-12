
// A class of beings that are defined by their DNA
class Rectangle extends Individual {
	

	draw(p) {
		
		let aof = this.value
		// Draw the rectangle
		// drawAOF(p, this.aof)

		let tilt = (this.value.tilt - .5)*.5
		let hue = (this.value.hue*360)%360
		let size = this.value.size*100 + 20
		let aspect = this.value.aspect + .5
		let w = size*aspect
		let h = -size/aspect

		p.push()
		p.rotate(tilt)

		p.noStroke()
		p.fill(hue, 100, 50)
		p.rect(-w/2, 0, w, h)

		p.pop()
		
		// p.text(this.value.size, 0, -160)
	}
}

Rectangle.labels =["size", "aspect", "tilt", "hue"]




app.types.rectangle = Rectangle