let canvasW = 800
let canvasH = 500

let hfFace = new Face()
let puppetFace = new Face()
let face = new Face()

let SLIDER = {
	animationSpeed: .5,
	animationBlend: 0,
} 

let mask = undefined

let app = {

	init() {
		let mode = localStorage.getItem("mask_lastMode") || Object.keys(app.modes)[0]
		app.setMode(mode)
		
		
		
	},

	setMode(modeID) {
		console.log("set to mode", modeID)
		localStorage.setItem("mask_lastMode", modeID)
		app.mode = modeID
		mask = new app.modes[app.mode]()

		// Set all the sliders
		for (var key in SLIDER){
			if (SLIDER.hasOwnProperty(key) && !key.startsWith("animation")){
				delete SLIDER[key];
			}
		}

		if (mask.sliders)
			mask.sliders.forEach(sliderID => {
				Vue.set(SLIDER, sliderID, .5)
			})
		// Add all the keys for this mode

	},

	startHandsfree() {
		console.log('start handsfree')
		initHandsFree(face)
	},



	handsfreeActive: false,
	paused: false,
	clearBackground: false,

	animate: true,
	
	mode: undefined,
	modes: {

	},




	
}


let noise = () => 0


// Setup and Vue things, ignore this, probably
document.addEventListener("DOMContentLoaded", function(){
	

	// P5
	new Vue({
		el : "#app",
		template: `<div id="app">
			<div class="handsfree-debugger"> </div>
				
			<div class="p5-holder" ref="p5"></div>
			<div class="controls">
				<button @click="app.startHandsfree()">📷</button>

				<table>
					<tr>
						<td class="label">mask:</td>
						<td>
							<select v-model="app.mode">
								<option v-for="(maskID) in Object.keys(app.modes)">{{maskID}}</option>
							</select>
						</td>
					</tr>
					<tr v-for="(slider,sliderID) in SLIDER" >
						<td class="label">{{sliderID}}</td>

						<td class="slider-holder">
							<input type="range" min="0" max="1" step=".02" v-model="SLIDER[sliderID]" />
							<div class="slider-label">{{SLIDER[sliderID]}}</div>
						</td>
						
							
					</td>
					</tr>
				</table>


			</div>
			
		</div>`,
		methods: {
			
		},

		watch: {
			"app.mode": () => {
				console.log("mode")
				app.setMode(app.mode)
			}
		},

		mounted() {

			let totalTime = 0
			app.init()

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



				p.mouseDragged = () => {
					
					
				}

				p.mouseReleased = () => {

				}

				p.draw = () => {
					// Center the mask in the middle (scale and pan as necessary)
					p.push()
					p.translate(p.width/2, p.height/2)

					if (!app.paused) {
						// console.log(app.sliders.animationSpeed)
						let speedMult = 4*SLIDER.animationSpeed**.7
						
						totalTime += speedMult*p.deltaTime

						puppetFace.setToTestData(p.millis(), totalTime)

						face.setToBlend(puppetFace, hfFace, SLIDER.animationBlend)
						face.calculateMetaTrackingData()
					}

					// Draw the face
					if (mask) {
						if (app.clearBackground)
							p.background(100)


						// hfFace.testDraw(p, 190)
						// face.testDraw(p, 320)
						// puppetFace.testDraw(p, 50)
						mask.draw(p, face)
					}
					else 
						p.circle(0, 0, 200)
					p.pop()
				}

			}, this.$refs.p5)

		
		},
		
		data() {
			return {
				SLIDER: SLIDER,
				app: app,
				
			}
		}
		
	}) 
})


//===========================
// Handle key events
document.addEventListener('keyup', function(e){
	
	console.log(e)
	if (e.key === "Shift") {
		// Clear all the shift-selected
		app.shiftDown = false
		// Vue.set(app, "shiftSelected", [])
	}

	if (e.code === "Space") {
		app.paused = !app.paused
		console.log("paused", app.paused)
	}
});  

document.addEventListener('keydown', function(e){
	if (e.key === "Shift") {
		app.shiftDown = true
		Vue.set(app, "shiftSelected", [])
	}
	
});

