app.modes.voronoi = class {
	constructor() {
		this.sliders = ["voronoiLerp", "background", "circleSize"]

		this.particles = []
		this.edges = []

		for (var j = 0; j < 2; j++) {
			for (var i = 0; i < 5; i++) {
				let pt = new Vector()
				pt.id = `hand-${j}-${i}`
				pt.radius = 10 + Math.random()*10
				pt.idNumber = j*5 + i
				pt.velocity =  new Vector()
				pt.force =  new Vector()
				pt.color = [Math.random()*360, 100, 50]
				pt.attachPoint = [j,i,3]
				this.particles.push(pt)
			}
		}

		this.ringPoints = []
		let count = 40
		for (var i = 0; i < count; i++) {
			let theta  = i*Math.PI*2/count
			this.ringPoints.push(Vector.polar(200 + (i%2)*20, theta))
			this.ringPoints.push(Vector.polar(300 + (i%2)*20, theta))
			this.ringPoints.push(Vector.polar(400 + (i%2)*20, theta))
		}
		
	}

	
	draw(p) {
		this.voronoiPoints = face.points.concat(this.ringPoints).concat(face.hands[0].points).concat(face.hands[1].points)
		

		let t = p.millis()*.001
		let dt = p.deltaTime *.001
		console.log("update")
		this.particles.forEach(pt => {

			let attach =face.hands[pt.attachPoint[0]].fingers[pt.attachPoint[1]][pt.attachPoint[2]]
				
			pt.addMultiples(pt.velocity, dt)
			pt.setToLerp(pt, attach, .1)
		})

		p.background(100, 100, 100, SLIDER.background**2*.4)
		
		
		
	
		// Convert to a simpler array of vectors 
		let pts = this.voronoiPoints.map(p => p)
		

		// Create the diagram
		const delaunay = Delaunator.from(pts);
		// if (Math.random() > .98)
		// 	console.log(delaunay)

		p.stroke(0)
		p.strokeWeight(.1)

		let vpct = SLIDER.voronoiLerp*.4 + .6

		forEachVoronoiCell(pts, delaunay, (centerIndex, verts) => {

			if (centerIndex%1 == 0) {
				let pt = this.voronoiPoints[centerIndex]
				p.noStroke()
				p.fill(centerIndex%360, 100, 50, .3)
				// pt.draw(p, 1)
				p.beginShape()
				// verts.forEach(vert => p.vertex(...vert))
				verts.forEach(vert => Vector.lerpVertex(p, pt, vert, vpct))
				p.endShape(p.CLOSE)

				p.fill((centerIndex + 50)%360, 100, 50, .3)
				p.beginShape()
				// verts.forEach(vert => p.vertex(...vert))
				verts.forEach(vert => Vector.lerpVertex(p, pt, vert, vpct-.2))
				p.endShape(p.CLOSE)
			}
			
		})

		this.particles.forEach(pt => {
			p.noStroke()
			p.fill(...pt.color, .3)
			p.strokeWeight(4)
			p.stroke(...pt.color, 1)
			pt.draw(p, pt.radius*(.2 + 3*SLIDER.circleSize))
		})



	}
}