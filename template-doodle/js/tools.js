/*
 * Edit things in here!
 *
 */

let tools = {

	// To make your own tools, copy from HERE.....⬇
	pencil: {
		icon: "✏️",
		draw(p, {pos, lastPos, mode, size, color, drawCount}) {

			// "p" is the P5 object, so p.fill, p.stroke will set the colors 
			// p.line, p.rect, and p.circle are all ways of drawing stuff
			p.strokeWeight(size**.7 + 1)
			p.stroke(...color)
			p.line(...pos, ...lastPos)
		}
	},

	// ⬆.....to HERE, and change out the icon, the word "pencil", 
	// and the stuff inside of "draw"


	splatter: {
		icon: "🟢",
		draw(p, {pos, lastPos, mode, size, color, drawCount}) {

			// This number goes up the faster you draw
			let distance = Vector.getDifference(pos, lastPos).magnitude

			for (var i = 0; i < 4; i++) {
				// Hue is the color (red, green, purple, orange, teal...)
				let hue = (color[0] + p.noise(drawCount)%360)
				let pastel = 30 + 50*p.noise(drawCount + 50)
				p.fill(hue, color[1],  pastel - 20, .3)
				p.stroke(hue, color[1], pastel + 20, 1)
	
				let x = pos[0]
				let y = pos[1]
				x += (Math.random() - .5)*size*distance
				y += (Math.random() - .5)*size*distance
				let radius = (Math.random() + .3)*size*distance
				p.circle(x, y, radius)
			}
		}
	},


	lines: {
		icon: "🧵",
		draw(p, {pos, lastPos, mode, size, color, drawCount}) {
			let t = p.millis()*.001
			let offset = Vector.getDifference(pos, lastPos)
			let distance = offset.magnitude
			p.strokeWeight(size**.2 + 1)
			
			p.noFill()
				
			
			for (var j = 0; j < 4; j++ ) {
				p.beginShape()
				
				// Make a copy of the current point
				let v = new Vector(...pos)

				let theta = offset.angle
				p.vertex(...v)
				let count = Math.random()*25


				// Draw a single hair
				let hue = (color[0] + Math.random()*50)%360
				p.stroke(hue, color[1], Math.random()*50 + 20, Math.random())

				for (var i = 0; i < count; i++) {
					// v.addMultiples(offset, .4)
					v.addPolar(distance**.4*(size + 3)**.3, theta)
					p.curveVertex(...v)
					theta += .7*(p.noise(i*.14, t + .1*j) - .5)
					
				}
				p.endShape()
			}
			
			
		}
	},


	emoji: {
		icon: "😁",
		draw(p, {pos, lastPos, mode, size, color, drawCount}) {
			p.fill(0)
			// How far have we moved since the last time we drew?
			let distance = Vector.getDifference(pos, lastPos).magnitude
			
			// TODO: Could these be different emoji?
			const emoji = ["😀", "😐", "😥", "🥺", "😍", "😌", "🙃", "😃", "🙄", "😵", "😡", "🥶"]

			// Make the emoji get bigger the faster you draw
			let selectedEmoji = emoji[Math.floor(Math.random() * emoji.length)]
			p.textSize(size**.4*distance + 3)
			p.text(selectedEmoji, ...pos)
		}
	},

	
	eraser: {
		icon: "🧼",
		draw(p, {pos, lastPos, mode, size, color, drawCount}) {
			p.fill(...color)
			p.rect(0, 0, p.width, p.height)
		}
	}
}