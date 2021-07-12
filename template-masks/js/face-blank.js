
app.modes.blankMask = class BlankMask {

	draw(p, face) {
		// Make a white background
		p.background(160, 70, 70,1)


		

		// // You can draw things in the background
		// p.stroke(0)
		// p.noFill()
		// p.circle(0, 0, 300)

		// // You can also draw things that are attached to the face
		// p.circle(...face.center, 20)
		
		p.fill(0, 100, 50)
		p.circle(...face.noseTip, 20)


		
		// // Get the two side contours of the face
		face.sideOrder.forEach(side => {
			let ring = joinSides(side.faceRings[0], face.centerLine)
			drawSmoothContour(p, ring, true)
		})
		
		
		// face.points.forEach(pt => {
		// 	p.fill(0)
		// 	p.circle(...pt, 3)
		// 	// console.log(pt)
		// })

		// face.hands.forEach(hand => hand.points.forEach(pt => {

		// 	p.fill(0)
		// 	p.circle(...pt, 3)
		
		// }))


		// // Drawing contours is your most basic tool
		// // A contour is an array of vectors (usually face points)
		// // You can draw it smooth or normal, closed or open
		

		// // Each face has a single center line
		drawContour(p, face.centerLine, false)

		face.sides.forEach(side => {
			let earPosition = side.ear[0]
			p.circle(...earPosition, 20)
			p.textAlign(p.CENTER)

			// p.textSize(200)
			// p.text("🙃",...earPosition)
			
			// For each side
			
			// We can take slices of the contours to only draw part of them
			// drawContour(p, side.nose[0].slice(-8), false)

			side.faceRings.forEach((ring,index) => {
				p.fill(160 + 20*index, 70, 50)
				drawContour(p, ring)
			})
			let faceOutline = side.faceRings[0]
			// side.faceRings[0].forEach((point, index) => {
			// 	p.textSize(40 + 10*Math.sin(index))
			// 	p.text("🎮",...point)
			// })

			p.stroke(0)
			p.strokeWeight(2)
			drawContour(p, side.eyeRings[1].slice(2,8), false)
			drawContour(p, side.eyeRings[4], true)


			
		})

		p.fill(0)

		drawSmoothContour(p, face.mouth[4], true)
		

		
		// drawContour(p, face.mouth[4], true)

		// // Draw the test hand and 
		// drawTestFacePoints(p)
		// drawTestHandPoints(p)
	}
}
