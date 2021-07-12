let canvasW = 600
let canvasH = 500


let app = {
	colors: [],
	cursors: {},
	tool: {
		drawCount: 0,
		mode: "lines",
		pos: [0,0],
		lastPos: undefined,
		color: [0,0,0],
		size: 1,
	},

	autodraw: false,

	init() {
		io.init()

		
  		// Select some random colors for the palette for asymmetrical drawing (who has green?)
  		for (var i = 0; i < 5; i++) {
  			app.colors.push([Math.random()*360, 100, Math.random()*100])
  		}
	},


	setPeerHandlers(room) {
		room.on("draw", (data, from) => {
			this.drawOnCanvas(data)

		})

		// room.on("cursor", (data, from) => {
		// 	cursors[from.slice(0,4)] = data
		// })
	},


	localDraw() {
		let drawData = app.tool

		this.drawOnCanvas(drawData)

		if (io.room) {
			io.room.broadcast("draw", drawData)
		} 
		
	},

	drawOnCanvas({pos, lastPos, mode, size, color, drawCount}) {
		app.tool.drawCount++

		let tool = tools[mode]
		if (tool) {
			tool.draw(app.p, {pos, lastPos, mode, size, color, drawCount})
		} else {
			console.warn(`No tool called '${mode}'`)
		}
		
		

		
	}

}


let noise = () => 0


// Setup and Vue things, ignore this, probably
document.addEventListener("DOMContentLoaded", function(){
	app.init()

	Vue.component("color-button", {
		template: `<button class="colorswatch" :class="{selected:selected}" @click="setColor" :style="style" ></button>`,
		computed: {
			style() {
				return {
					backgroundColor: `hsla(${this.color[0]},${this.color[1]}%,${this.color[2]}% )`
				}
			},

			selected() {
				return app.tool.color === this.color
			}
		},


		methods: {
			setColor() {

				app.tool.color = this.color
			}
		},
		props: ["color"]
	})

	

	// P5
	new Vue({
		el : "#app",
		template: `<div id="app">

			<div class="p5-holder" ref="p5"></div>
			<div class="drawingcontrols">
				<input type="range" v-model="app.tool.size" />
				<div>
					<button :class="{selected:app.tool.mode===toolName}" v-for="(tool,toolName) in tools" @click="setTool(toolName)">{{tool.icon}}</button>
				</div>
				<div>
					<color-button v-for="color in app.colors" :color="color" />
				</div>
			</div>

			<peerroom-widget />

			<div>
				<div class="message-log" v-for="msg in io.log">{{msg}}</div>
			</div>
			
		</div>`,
		methods: {
			setTool(toolName) {
				app.tool.mode=toolName
				localStorage.setItem(io.prefix + "_tool", toolName)
			}
		},

		mounted() {

			// Initialize the P5 canvas and handlers
			// You can ignore this
			app.p5 = new p5((p) => {
			 	app.p = p

				noise = p.noise

				// Basic P5 setup and handlers
				p.setup = () => {
					p.createCanvas(canvasW, canvasH)
					p.colorMode(p.HSL)
					p.ellipseMode(p.RADIUS)
				}


				// p.mouseMoved = () => {
				// 	io.room.broadcast("cursor", app.tool)
				// }

				p.mouseDragged = () => {
					// Did the user draw?
					app.tool.pos = [p.mouseX , p.mouseY]
					
					if (app.tool.lastPos ) {
						app.localDraw()
					}
					app.tool.lastPos = app.tool.pos.slice()
					
				}

				p.mouseReleased = () => {

					app.tool.lastPos = undefined
					app.tool.pos = undefined
					console.log("mouseup")
				}

				p.draw = () => {
					
				}

			}, this.$refs.p5)

			app.tool.mode = localStorage.getItem(io.prefix + "_tool") || "pencil"
			
			app.tool.color = app.colors[0]
		},
		
		data() {
			return {
				tools: tools,
				io: io,
				app: app,
				
			}
		}
		
	}) 
})



function createRandomDrawer(hue, onDraw) {
	let pt = Vector.polar(Math.random()*300, Math.random()*100)
	pt.id = Math.floor(Math.random()*9999)
	let color = [hue,100,50]
	setInterval(() => {
		if (app.p5 && app.autodraw) {

			let p = app.p5
		
			let t = p.millis()*.001
			
			let size = 20*p.noise(t)
			
			// Randomly walk this point around to test
			pt.addPolar(size, 20*p.noise(t, pt.id))
			
				pt.mult(.96)

			// Change color
			// color[0] = (500*p.noise(t*.1, pt.id + 100))%360
			// color[2] = 100*p.noise(t*.1, pt.id + 300)
			
			// Center the drawing
			onDraw(pt, {color:color,size: size})
		}
	}, 30)

}
