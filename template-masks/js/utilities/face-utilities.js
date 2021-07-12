


//=================================================================================
//=================================================================================
// Demo masks



//=================================================================================
//  Utilities

function joinSides(contour0, contour1) {
	return contour0.concat(contour1.slice().reverse())
}

function drawNeonContour(p, contour, color, width, close) {
		p.noFill()
		p.strokeWeight(width*2)
		p.stroke(color[0], color[1], color[2], .3)
		drawContour(p, contour, close)
		p.strokeWeight(width)
		p.stroke(color[0], color[1], color[2] + 10, .3)
		drawContour(p, contour, close)
		p.strokeWeight(width*.6)
		p.stroke(color[0], color[1], color[2] + 30, 1)
		drawContour(p, contour, close)
}


// Add to a trail if 
function addToTrail(trail, pos, maxLength) {
	if (trail.length == 0 || Vector.getDistance(pos, trail[trail.length - 1])> 10)
		trail.push(pos.clone())
	
	while (trail.length > maxLength)
		trail.shift()

}


// The function is (pct, index)
function drawRibbonVertices(p, contour, fxn, smooth) {
	let verts = contour.slice()

	// Draw each side of a ribbon
	for (var j = 0; j < 2; j++) {

	// verts[0].vertex(p)

		for (var i = 0; i < verts.length; i++) {
			let pct = i/(verts.length - 1)
			if (j == 1)
				pct = 1 - pct

			let p0 = verts[i - 1]||verts[i]
			let p1 = verts[i]
			let p2 = verts[i + 1]||verts[i]
	 
			let angle = p0.angleTo(p2)
			// let angle = 0
			let r = fxn(pct, j)
			if (i == 0 || !smooth)
				p1.polarOffsetVertex(p, r, angle + Math.PI/2)
			else 
				p1.polarOffsetCurveVertex(p, r, angle + Math.PI/2)
		}
		verts.reverse()
	}
	
}


function drawRibbon(p, contour, fxn, smooth) {
	let verts = contour.slice()

	// verts.forEach(pt=> pt.draw(p, 2))
	p.beginShape()
	// Draw each side of a ribbon
	for (var j = 0; j < 2; j++) {

	// verts[0].vertex(p)

		for (var i = 0; i < verts.length; i++) {
			let pct = i/(verts.length - 1)
			if (j == 1)
				pct = 1 - pct

			let p0 = verts[i - 1]||verts[i]
			let p1 = verts[i]
			let p2 = verts[i + 1]||verts[i]
	 
			let angle = p0.angleTo(p2)
			// let angle = 0
			let r = fxn(pct, j)
			if (i == 0 || !smooth)
				p1.polarOffsetVertex(p, r, angle + Math.PI/2)
			else 
				p1.polarOffsetCurveVertex(p, r, angle + Math.PI/2)
		}
		verts.reverse()
	}
	p.endShape()
}

function drawSmoothContour(p, contour, close) {
	p.beginShape()
	p.vertex(...contour[0])
	
	for (var i = 0; i < contour.length; i++) {
		p.curveVertex(...contour[i])
	}
	
	p.endShape(close?p.CLOSE:undefined)
}
function drawContour(p, contour, close) {
	p.beginShape()
	
	for (var i = 0; i < contour.length; i++) {
		p.vertex(...contour[i])
	}
	
	p.endShape(close?p.CLOSE:undefined)
}


function drawFaceDirection() {

	p.strokeWeight(3)
	face.direction.drawArrow({p:p, 
		center:face.noseTip, 
		color: [0,0,0]
	})
}

function drawEarArrows() {
	// Draw the arrow to the ears

	side.noseToEar.drawArrow({p:p, 
		center:face.noseTip, 
		color: [100 + 90*side.index, 100, 50]
	})
}

function drawStrip(p, contour0, contour1) {
	p.beginShape(p.TRIANGLE_STRIP)
	for (var i = 0; i < contour0.length; i++) {
		p.vertex(...contour0[i])
		let index2 = Math.min(i, contour1.length - 1)
		p.vertex(...contour1[index2])
	}
	
	p.endShape()
}

// Draw all the face points
function drawTestFacePoints(p) {
	p.noStroke()
	p.fill(0)
	let radius =  1/controls.zoom + .1

	p.textSize(radius*6)
	face.points.forEach((pt,i) => {
		pt.draw(p, radius)
		
		p.text(pt.index, pt[0], pt[1])
	})
}


function drawTestHandPoints(p) {

	let radius =  1/controls.zoom + .1



	p.textSize(radius*6)
	hand.forEach(h => {
		

		h.fingers.forEach((finger, fingerIndex) => {
			p.noFill()
			p.strokeWeight(16)
			p.stroke(fingerIndex*40, 100, 50)
			drawContour(p, finger)
		})

		// Draw labeled points
		p.noStroke()
		p.fill(0)
		h.points.forEach((pt,i) => {
			pt.draw(p, radius)
			p.text(pt.index, pt[0], pt[1])
		})

		// Draw arrows
		p.strokeWeight(3)
		h.handDir.drawArrow({
			p:p, 
			center:h.wrist, 
			color: [100,100,50]
		})

		h.pointDir.forEach((dir,index) => dir.drawArrow({
			p:p, 
			center: h.fingers[index][3],
			color: [100 + 30*index,100,50]
		}))



	})


}

//====================================




function drawEyeContours(p, t) {
	p.fill(0, 100, 50)
	p.stroke(0)
	p.strokeWeight(.2)
	face.sides.forEach((side, index) => {
		side.eyeRings.slice().reverse().forEach((ring, ringIndex) => {
			if (ringIndex == 4) {
				p.fill(0, 100, 100)
				
			} else {
				p.fill(0, 100, 50)
			}
			drawContour(p, ring)
			
		})

		let eye2 = new Vector()
		let eyePos = noise(t*5)
		if (index === 0)
			eyePos = 1 - eyePos
		let inner = side.eyeRings[0]
		eye2.setToLerp(inner[0], inner[8], eyePos)
		p.fill(0, 0, 0)
		eye2.draw(p, 8)
		p.fill(0, 0, 100)
		eye2.draw(p, 2)
	})
}





function drawSpotlight(p, color=[100,100,100]) {
	p.noStroke()
	let count = 20
	for (var i = 0; i < count; i++) {
		let pct = i/count
		let r = 200*(1 - pct) + 30

		p.fill(...color, .3/count)
		p.circle(face.center[0] + 9*Math.cos(i *.2),face.center[1] + 9*Math.sin(i), r)
	}

}