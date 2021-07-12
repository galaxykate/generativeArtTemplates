let canvasW = 600
let canvasH = 500


let app = {
	types: {},
		
	settings: {
		type: undefined,
		wander: false,
		selectedIndex: 0,
		selectedAOF:undefined, 
		mutation: .5,
		count: 15,
		seed: 0,
	},
	
	population: [],
	

	

	init() {
		

		this.settings.type = localStorage.getItem("aof_lastType")||  Object.keys(app.types)[0]
		this.setPopulation()
	},

	// Which Array of Floats is selected?
	setSelectedAOF() {
		app.settings.selectedAOF = app.population[app.settings.selectedIndex].aof
		
	},
	
	setType() {
		// What type of thing are we making?
		Vue.set(this, "population", [])
		this.setPopulation()
	},

	setPopulation() {

		let count = app.settings.count
		console.log(`set pop ${this.type} ${this.population.length}=>${count}`)
		let Type = app.types[app.settings.type]
		app.population.splice(app.count, app.population.length - count)

		for (var i = app.population.length; i < count; i++) {
			let seed = app.settings.seed + i
			let aof = createAOF(Type.labels.length, seed)
			let individual = new Type(aof)
			
			app.population.push(individual);	
		}

		//

		this.setSelectedAOF()
		
	},

	updatePopulation(p) {
		let t = p.millis()*.001
		if (app.settings.wander) {
			app.population.forEach((ind, indIndex) => {
				let aof = ind.aof
				// Set the aof to a noise value
				for (var i = 0; i < aof.length; i++) {
					Vue.set(aof, i, p.noise(i + indIndex*100, t))
				
				}
			})
		}
	},


	repopulateWith(parent) {
		console.log("Repopulate", parent)
		let Type = app.types[app.settings.type]
		console.log("repop")
		let offspring = []
		for (var i = 0; i < app.settings.count; i++) {
			let aof = createMutant(parent, app.settings.mutation)
			offspring.push(new Type(aof));	
		}
		app.population = offspring
		this.setSelectedAOF()
	}
}


let noise = () => 0


// Setup and Vue things, ignore this, probably
document.addEventListener("DOMContentLoaded", function(){
	
	Vue.component("aof-view", {
		template: `<div  class="section">
			<table>
				<tr v-for="(val,index) in aof">
					<td class="label">{{labels[index]}}</td>
					<td class="value">
						<input max=1 min=0 step=".02" type="range" v-model="aof[index]">
					</td>
				</tr>

			</table>
		</div>`,

		computed: {
			labels() {
				if (this.typeID)
					return app.types[this.typeID].labels
			}
		},
		props: ["aof", "typeID"]
	})

	// P5
	new Vue({
		el : "#app",
		template: `<div id="app">
			
			<div class="p5-holder" ref="p5"></div>
			<div class="controls">
				<div>
					<table>
						<tr>
							<td class="label">type:</td>
							<td>
								<select v-model="settings.type">
									<option v-for="typeID in types">{{typeID}}</option>
								</select>
							</td>
						</tr>
						<tr>
							<td class="label">count:</td>
							<td>
								<select v-model="settings.count">
									<option v-for="popSize in popSizes">{{popSize}}</option>
								</select>
							</td>
						</tr>
						<tr>
							<td class="label">mutation:</td>
							<td class="slider-holder">
								<input max=1 min=0 step=".02" type="range" v-model="settings.mutation" />
								<div class="slider-label">{{settings.mutation}}</div>
							</td>
						</tr>
						<tr>
							<td class="label">animate:</td>
							<td class="slider-holder">
								<input type="checkbox" v-model="settings.wander" />
							</td>
						</tr>
					</table>
					
				</div>
				<aof-view :aof="settings.selectedAOF" :typeID="settings.type" />
				

			</div>
			
		</div>`,

		watch: {
			"settings.count": function() {
				app.setPopulation()
			},
			"settings.selectedIndex": function() {
				app.setSelectedAOF()
			},
			"settings.type": function() {
				app.setType()
			}
		},

		computed: {
			labels() {
				return app.types[app.settings.type]
			},
			types() {
				return Object.keys(app.types)
			},
			
		},
		methods: {
			
		},

		mounted() {

			let positions = []
			let hoveredPosition = 0;

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

				p.mouseClicked = () => {
					if (hoveredPosition >= 0)
						app.settings.selectedIndex = hoveredPosition
				}

				p.doubleClicked = () => {
					app.repopulateWith(this.settings.selectedAOF)
				}

				p.mouseDragged = () => {
					
					
				}

				p.mouseReleased = () => {

				}

				p.draw = () => {
					let scale = 50 / (app.population.length + 50)
						
					let mousePos = new Vector(p.mouseX - p.width/2, p.mouseY - p.height/2)

					hoveredPosition = mousePos.getClosestIndex(positions, 50)
					
					// console.log(closest)

					// Animate
					if (!app.paused) {
						// Update everyone?
						app.updatePopulation(p)

					}


					// Set the population positions
					if (positions.length !== app.population.length) {
						console.log("recreate", app.population.length + " positions")
						positions = []

						let count = Math.floor(app.population.length/2) + 1
						
						for (var i = 0; i < app.population.length; i++) {
							let xPct = 0
							let row = Math.floor(i/count)
							if (count > 1) {

								xPct = (i%count)/(count - 1) - .5
								xPct += (row%2)*.5/(count -1)
							}
							// xPct += ro
							
							let y = (40 + 10*count)*row + 120*scale
							let x = (p.width - 100)*xPct

							// positions
							// let pct = app.population.length===1?0:(i/(app.population.length - 1) - .5)
							// let x = pct*(p.width - 100)
							// let y = p.height/2 - 80 + 30*(i%2)
							positions[i] = new Vector(x, y)
						}
					}

					let t = p.millis()*.001
					// let aof = this.selectedAOF
					
					p.background(100)
					// Center the mask in the middle (scale and pan as necessary)
					p.push()
					p.translate(p.width/2, p.height/2)



					for (var i = 0; i < app.population.length; i++) {
						p.push()
						p.translate(...positions[i])
						p.scale(scale)


						p.fill(0, 0, 0, .4)
						p.noStroke()
						if (i == hoveredPosition) {
							p.stroke(0)
							p.strokeWeight(10)
						} 

						if (i == app.settings.selectedIndex) {
							p.fill(200, 50, 50)
						} 
						let r = 400/(app.population.length + 10)
						p.ellipse(0,0, r*2, r)

						let individual = app.population[i]

						individual.draw(p)

						p.pop()
						
					
					}

				
					p.pop()
				}

			}, this.$refs.p5)

		
		},
		
		data() {
			return {
				popSizes: [1, 3, 7, 15],
				settings: app.settings,
				
			}
		}
		
	}) 
})


//===========================
// Handle key events
document.addEventListener('keyup', function(e){
	
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

