/* 
 * display curves
 */

class CurveFollower {
	constructor(curve) {
		this.curve = curve
		this.pt = new Vector()
		this.tangent = new Vector()
		this.n = new Vector()
	}

	setToPct(pct) {
		this.pct = pct
		this.update()
	}

	update() {
		// Set the location
		let segment = this.pct*(this.curve.pts.length - 1)
		let segIndex = Math.floor(segment)
		let t = segment%1
	
		// calculate the bezier position and derivative
		let p0 = this.curve.pts[segIndex]
		let p1 = this.curve.pts[segIndex + 1]
		this.pt.setToAddMultiples(
			p0.pt, (1-t)**3,
			p0.cp1, 3*t*(1-t)**2,
			p1.cp0, 3*t**2*(1-t),
			p1.pt, t**3)

		this.tangent.setToAddMultiples(
			p0.pt, -3*(1-t)**2,
			p0.cp1, 3*(1-t)**2 - 6*t*(1-t),
			p1.cp0, -3*t**2 + 6*t*(1-t),
			p1.pt, 3*t**2)
		this.n.setToNormal(this.tangent)
	}

	drawDebug(p) {
		p.strokeWeight(1)
		p.stroke(0)

		p.fill(290, 100, 50)
		this.pt.draw(p, 6)
		this.tangent.drawArrow({
			p,
			multiple: .2,
			center: this.pt,

		})
		this.n.drawArrow({
			p,
			multiple: 40,
			center: this.pt,

		})

	
	}
}

 // Each curve point is a vector, and we add control points to it

let ptCount = 0
 class CurvePoint{
 	constructor(pt=new Vector(0,0), r0=50, theta0=0, r1=50, theta1) {
 		this.idNumber = ptCount++
 		this.pt = pt

 		this.n = new Vector(0, 0)
	 	this.d = new Vector(0, 0)
	 	
	 	this.isSmooth = false
	 	
	 	// Add curvepoint behaviors to the two curve points
	 	this.cp0 = new Vector(0,0)
	 	this.cp0.pt = this
 	 	this.cp0.r = r0
 	 	
 	 	this.cp1 = new Vector(0,0)
 	 	this.cp1.pt = this
 	 	this.cp1.r = r1

 	 	this.update()
 	}

 	get theta() {
 		return this.d.angle
 		let angle = this.n.angle + Math.PI/2
 		// console.log(angle, this.n)
 		return angle
 	}

 	cpNext(dir=1) {
 		return dir < 0?this.cp0:this.cp1
 	}

 	cpPrev(dir=1) {
 		return dir < 0?this.cp1:this.cp0
 	}


 	update() {
 		
 		this.cp0.setToPolarOffset(this.pt, this.cp0.r, this.theta)
 		this.cp1.setToPolarOffset(this.pt, this.cp1.r, this.theta + Math.PI)
 		
 	}

 	drawDebug(p) {
 		p.strokeWeight(.2)
 		p.stroke(0)
 		
 		Vector.drawLineBetween({p:p, v0:this.pt, v1:this.cp0})
 		Vector.drawLineBetween({p:p, v0:this.pt, v1:this.cp1})
 		p.fill(100, 100, 50)
 		this.cp0.draw(p, 3)
 		p.fill(200, 100, 50)
 		this.cp1.draw(p, 3)
 		p.fill(100)
 		p.strokeWeight(2)
 		p.stroke(0)
 		this.pt.draw(p, 8)

 		this.d.drawArrow({
 			p, 
			center:this.pt, 
			multiple:40,
			color:[0,0,0]
		})
		this.n.drawArrow({
 			p, 
			center:this.pt, 
			multiple:40,
			color:[0,100,30]
		})
 	}
 }


// A collection of points
 class Curve {
 	constructor() {
 		this.pts = []
 	}	

 	update() {
 		// Is this rooted to another curve?
 		this.pts.forEach()
 	}

 	// Make a curve dependent on this one
 	createOffsetCurve() {
 		let c = new Curve()
 		c.source = this
 		for (var i = 0; i < this.pts.length; i++) {
 			c.addPoint().root = this.pts[i]
 		}
 		return c
 	}

 	addPoint() {
 		let pt = new CurvePoint(...arguments)
 		this.pts.push(pt)
 		return pt
 	}

 	smooth(roundness = .4) {

 		let d0 = new Vector()
 		let d1 = new Vector()
 		let d2 = new Vector()
 		
 		for (var i = 0; i < this.pts.length; i++) {
 			let pt0 = this.pts[i-1]
 			let pt1 = this.pts[i]
 			let pt2 = this.pts[i+1]

 			pt1.n.mult(0)
 			pt1.d.mult(0)
 			d0.mult(0)
 			d1.mult(0)
 			if (pt0) {
 				d0.setToDifference(pt1.pt, pt0.pt)
 				if (d0.magnitude) {
 					pt1.d.addMultiples(d0, -1/d0.magnitude)
 					pt1.n.addMultiples(d0, 1/d0.magnitude)

 				}
 			}
 			if (pt2) {

 				d1.setToDifference(pt1.pt, pt2.pt)

 				if (d1.magnitude) {
 					pt1.d.addMultiples(d1, 1/d1.magnitude)
 					pt1.n.addMultiples(d1, 1/d1.magnitude)
 				}
 			}
			
	
 			

			// // Set the radius
			if (d0.magnitude) {
				pt1.cp0.r = .4*d0.magnitude*Math.cos(d0.angle - pt1.theta + Math.PI)**roundness || 0
			
			}
			if (d1.magnitude) {
				pt1.cp1.r = .4*d1.magnitude*Math.cos(d1.angle - pt1.theta)**roundness || 0
			}

			pt1.update()
			
 		}
 	}

 	drawDebug(p) {
 		p.strokeWeight(1)
 		p.stroke(0, 0, 0, 1)
 		p.noFill()
 		p.beginShape()

 		let pt0 = this.pts[0]
 		p.vertex(...pt0.pt)
 		for (var i = 1; i < this.pts.length; i++) {
 			let pt1 = this.pts[i]
 			p.bezierVertex(...pt0.cpNext(),...pt1.cpPrev(), ...pt1.pt)
 			pt0 = pt1
 		}
 		p.endShape()


 		this.pts.forEach(pt => {

 			pt.drawDebug(p)
 		})
 	}

 	traverseSegments({start=0, end, fxn}) {
 		// end = end||this.pts.length - 1
 		let dir = end > start?1:-1
 		let count = Math.abs(end - start) 
 		for (var i = 0; i < count; i++) {
 			let index0 = start + i*dir
 			let index1 = start + (i + 1)*dir
 			
			let p0 = this.pts[index0]
 			let p1 = this.pts[index1]

			let cp0 = p0.cpNext(dir)
 			let cp1 = p1.cpPrev(dir)

 			fxn({cp0,cp1,p0,p1, index0,index1, segmentIndex:i})
 		}
 	}

 	drawRibbon({p, fxn0, fxn1, start=0,end}) {
 		if (fxn1 == undefined)
 			fxn1 = fxn0

 		let dir = end > start?1:-1
 		let count = Math.abs(end - start)

 		p.beginShape()

 		let drawSide = (fxn, start, end) => {
 			this.traverseSegments({start, end, fxn:({cp0,cp1,p0,p1, index0,index1, segmentIndex}) => {
	 			// console.log(cp0, cp1)
	 			let pct0 = index0/(this.pts.length -1)
	 			let pct1 = index1/(this.pts.length -1)
	 			let r0 = fxn(pct0)
				let r1 = fxn(pct1)
	 		
	 			if (segmentIndex === 0) {
	 				p.vertex(...Vector.offset(p0.pt, p0.n, r0))
	 			}

	 			p.bezierVertex(...Vector.offset(p0.pt, p0.n, r0),
	 				...Vector.offset(cp1, p1.n, r1),
	 				...Vector.offset(p1.pt, p1.n, r1))
	 		}})


 		}

 		drawSide(fxn0, start, end)
		drawSide(fxn1, end, start)

 		p.endShape()
 	}
 }