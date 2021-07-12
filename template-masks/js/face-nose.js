

// let fingerTrails = [[[],[],[],[],[]], [[],[],[],[],[]]]

masks.noseFace = function(p) {
	
	let t = p.millis()*.001

	
	p.clear()

	for (var i = 0; i < 3; i++) {
		p.fill(0, 0, 0, .2)
		p.noStroke(0)
		p.beginShape()
		let count = 50
		let pt = new Vector()
		
		for (var j = 0; j < count; j++) {
			let theta = j*Math.PI*2/count
			
			pt.setToPolar(200 + (40+i*50)*p.noise(j, t*.6 + i*.2), theta)
			pt[0] *= 1.5
			if (j === 0) {
				p.vertex(...pt)
			} else 
				p.curveVertex(...pt)
		}
		p.endShape(p.CLOSE)
	}

	// Draw more face things
	drawTestFacePoints(p)

	p.noFill()
	drawContour(p,face.centerLine)
	face.sideOrder.forEach(side => {

		p.strokeWeight(.2)
		side.eyeRings.forEach((ring,ringIndex) => {
			p.stroke(ringIndex*50, 100, 50)
			drawContour(p, ring)
		})


		let brow = side.eyeRings[0].slice(2, 8).map(pt => {
			let pt1 = new Vector(0,0)
			pt1.setToLerp(side.eye, pt, SLIDER.eyebrow*2)
			return pt1

		})
		p.strokeWeight(2)
		drawContour(p, brow)

			p.strokeWeight(1)
			p.fill(side.index*20 + 150, 100, 70, .8)
			drawStrip(p,side.nose[0],side.nose[1])
			p.fill(side.index*20 + 150, 100, 90, .7)
			drawStrip(p,face.centerLine.slice(0,12),side.nose[1])
			drawContour(p,side.nose[1])
			drawContour(p, side.eyeRings[0])
			drawContour(p, side.eyeRings[3])
			p.fill(0)
			drawContour(p, side.eyeRings[4])
		
	})
	let m = face.mouth[3]
	p.fill(150, 100, 90, .7)
	drawContour(p, face.mouth[3], true)
	drawContour(p, face.mouth[2], true)
	p.stroke(0)
	drawContour(p, [m[0], m[m.length/2]])

	

	hand.forEach((h,handIndex) => {


		h.fingers.forEach((finger,fingerIndex) => {
			let fingerHue = (fingerIndex*20 + 150 + t*100) %360

			// Leave a trail? Make an 8-point trail
			let trail = fingerTrails[handIndex][fingerIndex]
			if (!app.paused)
				addToTrail(trail, finger[3], 12)

			
			p.noStroke()
			p.fill(fingerHue, 100, 50, .3)
			drawRibbon(p, trail, (pct, side) => {

				return 10*pct
			}, true)

			// Draw each bone of the finger
			for (var i = 0; i < finger.length - 1; i++) {
				let hue = (fingerHue + i*10)%360
				p.fill(hue, 100, 50)
				p.noStroke()

				// What angle is this finger bone?
				let joint0 = finger[i]
				let joint1 = finger[i + 1]
				let radius0 = getFingerSize(fingerIndex, i)
				let radius1 = getFingerSize(fingerIndex, i)
				let boneAngle = joint0.angleTo(joint1) 

				
				p.beginShape(p.TRIANGLE_MESH)
				joint0.polarOffsetVertex(p, radius0, boneAngle + Math.PI/2)
				joint0.polarOffsetVertex(p, radius0, boneAngle - Math.PI/2)
				joint1.polarOffsetVertex(p, radius1, boneAngle - Math.PI/2)
				joint1.polarOffsetVertex(p, radius1, boneAngle + Math.PI/2)
				p.endShape()

				p.fill(hue, 100, 70)
				p.beginShape(p.TRIANGLE_MESH)
				joint0.polarOffsetVertex(p, radius0*.3, boneAngle + Math.PI/2)
				joint0.polarOffsetVertex(p, radius0*.7, boneAngle - Math.PI/2)
				joint1.polarOffsetVertex(p, radius1*.7, boneAngle - Math.PI/2)
				joint1.polarOffsetVertex(p, radius1*.3, boneAngle + Math.PI/2)
				p.endShape()


				p.fill(hue, 100, 40)
				joint1.draw(p, radius1)
				p.fill(hue, 100, 70)
				joint1.draw(p, radius1*.8)
			}
		})
	})

}


function getFingerSize(fingerIndex, index) {
	let r = 1 + .3*Math.sin(1*fingerIndex - .5)
	// Make the thumb bigger
	if (fingerIndex == 0)
		r *= 1.6
	r *= 12
	// Taper the fingers a bit
	r *= (1 - .06*index)
	return r
}