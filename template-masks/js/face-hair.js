

class HairMask {
	constructor() {
		this.hairParticles = new SpringGraph()
		face.sideOrder.forEach(side => {
				
			let verts = side.faceRings[0].slice(0, 11)
						

			verts.forEach((follicle, follicleIndex) => {
				for (var i = 0; i < 4; i++) {
					let pt = this.hairParticles.addParticle()
					pt.follicle0 =follicle
					pt.follicle1 =verts[Math.min(follicleIndex + 1, verts.length - 1)]

					this.hairParticles.addEdge(pt,follicle )
				}
				
			})
		})
			
	}

	draw(p) {
		let t = p.millis()*.001
		p.background(100, 100, 100, .3)

		let count = (noise(t)*7) + 1
		for (var i = 0; i < count; i++) {
			p.push()
			p.rotate(Math.PI*2*i/count)
			p.translate(0, -100)
			p.scale(.8)
			face.sideOrder.forEach(side => {

				// Draw the face side
				p.strokeWeight(5)
				p.stroke(320, 100, 20,  .4)
				p.fill(12, 50, 90)
		
				drawContour(p, side.faceRings[0])

				p.stroke(350, 40, 70)
				p.strokeWeight(3)
				drawContour(p, face.centerLine.slice(0, 15))


				for (var i = 0; i < 2; i++) {
						let verts0 = side.faceRings[i].slice(0, 10)
						let verts1 = side.faceRings[i + 1].slice(0, 10)

						// p.strokeWeight(100)
						p.noStroke()
						p.fill(320, 100, 50 + i*17)
						drawStrip(p, verts0, verts1)
				}

				// Eyelid
				p.fill(0, 0, 100)
				p.stroke(340, 50, 30)
				drawContour(p, side.eyeRings[4])
				p.noStroke()
				p.fill(190, 40, 30)
				side.eye.draw(p, 8)
				p.noStroke()
				p.fill(190, 40, 40)
				side.eye.draw(p, 5)

				// Eyebrow
				p.stroke(12, 30, 20)
				p.noFill(0)
				drawContour(p, side.eyeRings[3].slice(3,7))
				// console.log(side.eyeRings[4].map(p => p.toFixed(2)))

				// Glasses
				p.stroke(40, 20, 80, .5)
				p.strokeWeight(4)
				p.fill(0, 0, 100, .4)
				drawContour(p, side.eyeRings[1].slice(6).concat(side.eyeRings[1].slice(0, 2)), true)

					
			})

			// Mouth
			p.fill(0, 0, 0, .3)
			drawContour(p, face.mouth[3])

			p.noStroke()
			p.fill(340, 40, 50)
			drawStrip(p, face.mouth[3], face.mouth[4])
			p.fill(340, 40, 70)
			drawStrip(p, face.mouth[2], face.mouth[3])
			
			// Draw hair
			this.hairParticles.edges.forEach(e => {
				p.strokeWeight(5)
			
				 p.fill(320, 100, 50 + 20*Math.sin(e.start.idNumber), .8)
				p.beginShape()
				e.start.vertex(p)
				e.start.follicle0.vertex(p)
				e.start.follicle1.vertex(p)
				p.endShape()

			})
			p.pop()
		}

	}

	update(t, dt, frameCount) {
		// console.log("update")
		this.hairParticles.update(t,dt)
	}
}


masks.hair = HairMask