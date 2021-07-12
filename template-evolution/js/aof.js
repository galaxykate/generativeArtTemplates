// A vector encoding for a genetic algorithm, etc

class Individual {
	constructor(aof) {
		this.aof = aof

		// Set up a label index for this class, if we don't have one already
		// This is used to look up the values
		if (this.constructor.labelIndex === undefined) {
			let type = this.constructor
			if (!type.labels)
				console.warn("Did you forget to add labels to your class?")
			type.labelIndex = {}
			for (var i = 0; i < type.labels.length; i++) {
				type.labelIndex[type.labels[i]] = i
			}
		}

		// Create a proxy so we can look up the values 
		// like "this.value.hue" "this.value.petalSize"

		this.value = new Proxy(this.aof, {
			get: (target, name, receiver) => {
				let index = this.constructor.labelIndex[name]
				if (index !== undefined)
					return target[index]*1.0
			}
		});

	}
}

Individual.labels =  ["a", "b", "c"]

class AOF {
	constructor(size) {
		this.values = []
		for (var i = 0; i < size; i++) {
			this.values[i] = Math.random()
		}
	}


	// A combination of small moves and big moves

}

function createAOF(length, seed) {
	let rng = Math.random
	if (seed !== undefined)
		rng = new Math.seedrandom(seed).quick;

	let aof = []
	for (var i = 0; i < length; i++) {
		aof[i] = rng()
	}
	return aof
}
function createMutant(aof, mutation=1, sigmoidRange) {
	let aof2 = []
	for (var i = 0; i < aof.length; i++) {
		let delta = (2*Math.random() - 1)*Math.random()*mutation
		
		// Couple big changes
		if (Math.random()<.1)
			delta *= 2

		let val = aof[i] + delta
		// sigmoids are centered around 0 and return [0,1]:
		//  ...so scootch the initial value [0,1] down by .5 
		aof2[i] = sigmoid(val - .5, .2)
	}
	return aof2
}

function sigmoid(t,k=1) {
	return 1/(1+Math.pow(Math.E, -t/k));
}

function drawAOF(p, aof) {
	// Draw graph
	let w = 10

	p.translate(-.5*(w*aof.length), 0)
	p.noStroke()
	// console.log(aof)
	p.fill(0)
	p.rect(0, 0, w*aof.length, -100)
	for (var j = 0; j < aof.length; j++) {
		p.fill(j*30, 100, 50)
		p.rect(j*w, 0, w, -aof[j]*100)
	}
}