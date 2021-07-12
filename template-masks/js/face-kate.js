
class Eye {
	constructor(side) {
		
		this.side = side
		this.center = new Vector(0,0)

		this.inner = new Vector(0,0)
		this.outer = new Vector(0,0)
		this.lid = [
			[new CurvePoint(this.inner, 0, 10, 30), new CurvePoint(this.outer, 30, 10, 0)],
			// [new CurvePoint(this.inner, 0, 10, 30), new CurvePoint(this.outer, 30, 10, 0)]
			]

	}


	draw(p, blink) {
		let t = p.millis()*.001
		let id = 10
		// Get eye angle things
		let eyeSize = 10
		let eyeAngle = -.1
		let eyeColor = [0,0,0]

		this.inner.setToPolar(eyeSize, eyeAngle)
		this.outer.setToPolar(eyeSize, eyeAngle + Math.PI)


		
		this.inner[0]*= this.side
		this.outer[0]*= this.side

		let centerAngle = this.side*Math.PI/2 + Math.PI/2 + this.side*eyeAngle
		let lidAngle = centerAngle + Math.PI/2*this.side

		// let blink = Math.abs(Math.sin(t*4))
		// console.log(blink)
		// let lidAngle1 = 2*this.side*noise(id + t*.5 + 100*this.side)*blink
		// let lidAngle2 = 2*this.side*noise(id + t*.5 + 100*this.side)*blink
		let lidAngle1 = 2*blink*this.side
		let lidAngle2 = 2*blink*this.side
		

		// console.log(id, t, this.side, blink, lidAngle1, lidAngle2)
		this.lid[0][0].setTo(eyeSize*.8, centerAngle + lidAngle1,  
							 eyeSize*1.4, lidAngle)
		this.lid[0][1].setTo(eyeSize*1.4, lidAngle, 
							 eyeSize*.8, centerAngle + Math.PI  + -lidAngle2)

		let skin = [20, 100, 90]
		p.push()
		p.translate(...this.center)
		
		p.noStroke()
		p.fill(skin[0], skin[1], skin[2] *.7 )
		p.ellipse(0, 0, eyeSize*1.2, eyeSize*1.4)


		p.fill(100)
		p.circle(0, 0, eyeSize)


		// Iris
		p.push()
		p.translate((p.noise(t*.7 + id, this.side*10) - .5)*eyeSize, 0)
		let irisCount = 4
		for (var i = 0; i < irisCount; i++) {
			let pct = 1 - i/irisCount
			p.fill(eyeColor*360, 100, 80 - pct*50)
			p.circle(0, 0, eyeSize*.8*(pct**.3))
		}

		p.fill(0)
		p.circle(0, 0, eyeSize*.4)

		p.fill(100, 0, 100, .5)
		p.circle(0, -eyeSize*.3, eyeSize*.3)
		p.circle(0, -eyeSize*.3, eyeSize*.2)

		p.pop()

		p.beginShape()
		p.noStroke()
		p.fill(skin[0], skin[1], skin[2] *.7 )
		bezierCurve(p, this.lid[0], true)
		bezierCurve(p, [this.lid[0][1], this.lid[0][0]], true)
		
		p.endShape()

		p.stroke(0)
		p.strokeWeight(3)
		p.noFill()
		p.beginShape()
		bezierCurve(p, [this.lid[0][1], this.lid[0][0]], true)
		
		p.endShape()
			
			// Debug draw 
		// this.lid[0].forEach(pt => pt.draw(p))
		p.pop()


	}
}


class KateMask {
	constructor() {

		this.particles = []

		for (var i = 0; i < 20; i++) {
			let pt = Vector.polar(40*i, i**.7)
			pt.velocity = Vector.polar(10, i)
			pt.force = new Vector(0,0)
			this.particles.push(pt)
		}

	}

	update(t, dt, p) {
		// console.log(face)
		// Move the particles

		this.particles.forEach((pt, index) => {
			// Set to gravity
			pt.force.setTo(0, 50)

			let springForce = new Vector(0,0)
			springForce.setToDifference(pt, face.noseTip)
			springForce.mult(-10)
			pt.force.add(springForce)

			let wander = new Vector(0,0)
			wander.setToPolar(100, 20*noise(index, t*.3))
			
			pt.force.add(wander)

			// Drag???
			pt.velocity.mult(.92)

			// Apply force to velocity
			pt.velocity.addMultiples(pt.force, dt)
			// Apply velocity to position
			pt.addMultiples(pt.velocity, dt)
		})
	}

	draw(p) {
			// // Make a white background
	p.background(210, 100, 80)

	// // You can draw things in the background
	p.stroke(0)
	p.noFill()
	p.circle(0, 0, 300)

	p.strokeWeight(1)


	face.points.forEach(pt => p.circle(...pt, 3))

	let blinkTotal = 0
	face.sideOrder.forEach(side => {

		let eyeRing = side.eyeRings[4]
		
		let inner = eyeRing[0]
		let outer = eyeRing[8]
		
		let top = eyeRing[4]
		let bottom = eyeRing[12]

		let eyeVec = Vector.getDifference(top, bottom)
		eyeVec.drawArrow({p:p, 
			multiple: 5,
				center:bottom})

		let eyeHeight = eyeVec.magnitude
		
		blinkTotal += (eyeHeight*.4 - .5)
		
	})
	let blink = blinkTotal/2


	face.sideOrder.forEach(side => {
		p.strokeWeight(1)
		// console.log(side)


		side.faceRings.forEach((ring, ringIndex) => {
			p.fill(40 + 50*ringIndex + 40*side.index, 100, 50)


			ring.forEach(pt => p.circle(...pt, 3))

			drawContour(p, joinSides(ring, face.centerLine), true)

		})

		side.eyeRings.forEach((ring, ringIndex) => {
			p.fill(50*ringIndex, 100, 50)
			// ring.forEach(pt => p.circle(...pt, 3))

			drawSmoothContour(p, ring, true)
		})

		

		// Eyebrow
		// p.noFill()
		// p.stroke(0)
		// p.strokeWeight(10*SLIDER.katesUniqueEyebrow)

		p.fill(0)
		let eyebrowBottom = side.eyeRings[1].slice(2, 8)
		let eyebrowTop = side.faceRings[0].slice(2 ,8)
		drawContour(p, joinSides(eyebrowBottom, eyebrowTop), false)

		//console.log(face)



		// Draw eyes
		let eye = new Eye(side.index)
		p.push()

		p.translate(...side.eye)
		// p.translate(-side.index*100, 0)
		p.scale(2)
		// p.scale(eyeHeight*.1)

		
		eye.draw(p, blink)
		p.pop()

		// Draw a circle for the eye
		// p.fill(100)
		// p.circle(...side.eye, 30)
	})

	// Weird particle nose
	let forehead = face.centerLine[2]
	let noseBottom = face.centerLine[14]
	this.particles.forEach((pt, index) => {
		p.fill((index*28)%360, 100, 50)
		p.beginShape()
		p.vertex(...forehead)
		p.vertex(...pt)
		p.vertex(...noseBottom)
		p.endShape()

	})
	
		

	p.noStroke()

	drawSmoothContour(p, face.mouth[3], true)
	p.fill(0)
	drawSmoothContour(p, face.mouth[4], true)

	hand.forEach(h => {
		// console.log(h)
		h.fingers.forEach((finger, fingerIndex) => {
			let fingerHue =(60*fingerIndex)%360 
			p.noStroke()
			p.fill(0)
			// finger.forEach(joint => {
			// 	p.circle(...joint, 10)
			// })
			// console.log(fingerIndex)

			
			p.stroke(fingerHue, 100, 60)
			p.fill(fingerHue, 100, 30)
			p.strokeWeight(1)

			p.beginShape()
			// p.vertex(0, 500)

			drawRibbonVertices(p, finger, (pct, sideIndex) => {
				return 6*(1 - pct)
			}, false)

			// p.vertex(100, 500)
			p.endShape()
		})
	})


	// p.noFill()
	// p.stroke(0)
	// p.strokeWeight(10)
	// drawContour(p, face.centerLine, false)
	

	// // You can also draw things that are attached to the face
	// p.circle(...face.center, 200)
	
	
	// // Get the two side contours of the face
	// let sideContours = face.sides.map(side => {
	// 	return side.faceRings[0]
	// })
	
	// // Join them together into a single continous contour
	// let faceContour = joinSides(...sideContours)
	// let weight = SLIDER.b*10 + 1
	// let lightness = SLIDER.a*60 + 20
	// let hue = SLIDER.c*360
	// p.stroke(hue, 100, lightness)

	// p.strokeWeight(weight)
	// p.fill(100)

	// // Drawing contours is your most basic tool
	// // A contour is an array of vectors (usually face points)
	// // You can draw it smooth or normal, closed or open
	// drawSmoothContour(p, faceContour, true)

	// // Each face has a single center line
	// drawContour(p, face.centerLine, false)

	// face.sides.forEach(side => {
	// 	// For each side
		
	// 	// We can take slices of the contours to only draw part of them
	// 	drawContour(p, side.nose[0].slice(-8), false)

	// 	drawContour(p, side.eyeRings[1].slice(2,8), false)
	// 	drawContour(p, side.eyeRings[4], true)
	// })
	

	
	// drawContour(p, face.mouth[4], true)

	// // Draw the test hand and 
	// drawTestFacePoints(p)
	// drawTestHandPoints(p)
	
	}


}


masks.kate = KateMask



