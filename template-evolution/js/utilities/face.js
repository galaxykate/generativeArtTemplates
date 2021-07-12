// Handsfree code
// Do various kinds of tracking
let handsfree

const faceVertCount = 468

const faceIndexes = {
	fingers:  [[1, 2, 3, 4], [5, 6, 7, 8],[9,10,11,12],[13, 14, 15, 16], [17, 18 , 19, 20]],
	centerLine: [10, 151, 9, 8, 168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 164, 0, 11, 12, 13, 14, 15, 16, 17, 18, 200, 199, 175, 152],
	mouth: [
		[287, 436, 426, 327, 326,   2,  97,  98, 206, 216,  57,  43, 106, 182,  83,  18, 313, 406, 335, 273],
		[291, 410, 322, 391, 393, 164, 167, 165,  92, 186,  61, 146,  91, 181,  84,  17, 314, 405, 321, 375],
		[306, 409, 270, 269, 267,   0,  37,  39,  40, 185,  76,  77,  90, 180,  85,  16, 315, 404, 320, 307],
		[292, 408, 304, 303, 302,  11,  72,  73,  74, 184,  62,  96,  89, 179,  86,  15, 316, 403, 319, 325],
		[308, 407, 310, 311, 312,  13,  82,  81,  80, 183,  78,  95,  88, 178,  87,  14, 317, 402, 318, 324],
	],
		
	sides:[

	// RIGHT
	{
		nose:   [[ 67,  69,  66,  65, 221, 189, 245, 188, 174, 236, 134, 220, 239, 20, 242, 141, 94],
				 [109, 108, 107,  55, 193, 122, 196,   3,  51,  45,  44, 125,  19]],
		
		faceRings: [
			[ 10, 109,  67, 103,  54,  21, 162, 127, 234,  93, 132,  58, 172, 136, 150, 149, 176, 148, 152],
			[151, 108,  69, 104,  68,  71, 139,  34, 227, 137, 177, 215, 138, 135, 169, 170, 140, 171, 175],
			[  9, 107,  66,  105,  63,  70, 156, 143, 116, 123, 147, 213, 192, 214, 210, 211,  32, 208, 199]
		],
		eyeRings: [
			[122, 168, 107,  66, 105,  63,  70, 156, 143, 116, 123,  50, 101, 100,  47, 114, 188],
			[245, 193,  55,  65,  52,  53,  46, 124,  35, 111, 117, 118, 119, 120, 121, 128],
			[244, 189, 221, 222, 223, 224, 225, 113, 226,  31, 228, 229, 230, 231, 232, 233],
			[243, 190,  56,  28,  27,  29,  30, 247, 130,  25, 110,  24,  23,  22,  26, 112],
			[133, 173, 157, 158, 159, 160, 161, 246,  33,   7, 163, 144, 145, 153, 154, 155],
		],

	}, 
	// LEFT
	{
		nose:   [[297, 299, 296, 295, 441, 413, 412, 399, 456, 363, 440, 459, 250, 462, 370, 94],
			[338, 337, 336, 285, 417, 351, 419, 248, 281, 275, 274, 354, 19]],
		faceRings: [
			[ 10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152],
			[151, 337, 299, 333, 298, 301, 368, 264, 447, 366, 401, 435, 367, 364, 394, 395, 369, 396, 175], 
			[  9, 336, 296, 334, 293, 300, 383, 372, 345, 352, 376, 433, 416, 434, 430, 431, 262, 428, 199]],
		eyeRings: [
			[351, 168, 336, 296, 334, 293, 300, 383, 372, 345, 352, 280, 330, 329, 277, 343, 412],
			[465, 417, 285, 295, 282, 283, 276, 353, 265, 340, 346, 347, 348, 349, 350, 357],
			[464, 413, 441, 442, 443, 444, 445, 342, 446, 261, 448, 449, 450, 451, 452, 453],
			[463, 414, 286, 258, 257, 259, 260, 467, 359, 255, 339, 254, 253, 252, 256, 341], 
			[362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382],
		]
	}]

	// [10 109 87 103]
}

// A place to store all the face data
class Face {
	constructor() {

		this.animationFrame = 0

		console.log("CREATE FACE")
		// Create all the vertices
		this.points = []
		this.sides = []

		this.hands = []
		this.center = new Vector()
		this.width = 100
		this.length = 150
		this.size = 100
		this.scale = 100

		// Create vertices for all the face verts
		for (var i = 0; i < faceVertCount; i++) {
			let v = Vector.polar(5*i**.7, 1.7*i**.7)
			
			v.visible = true
			v.index = i
			this.points[i] = v
		}



		// Create both sides of the face (and both hands)
		for (var i = 0; i < 2; i++) {

			//------------------------------------
			// Make hands
			let hand = {
				index: (2*(i - .5)),
				pinch: 0,
				pointDir: [new Vector(),new Vector(), new Vector(), new Vector(), new Vector()],
				handDir: new Vector(),
				points: [],
				fingers: [],
			}
			this.hands[i] = hand

			// Initialize the hand points
			for (var j = 0; j < 22; j++) {
				let v = new Vector(0, 0)
				v.visible = true
				v.index = j
				hand.points[j] = v
			}

			hand.wrist = hand.points[0]
			hand.center = hand.points[21]
			hand.fingers = faceIndexes.fingers.map(finger => finger.map(index =>  hand.points[index]))


			//------------------------------------
			// Make face sides
			let side =  {
				blink: .3,
				index: (2*(i - .5)),
				eye: new Vector(Math.random(), Math.random()),
				eyeRings: faceIndexes.sides[i].eyeRings.map(ring => ring.map(index => {
					return this.points[index]
				})),

				nose: faceIndexes.sides[i].nose.map(ring => ring.map(index => {
					return this.points[index]
				})),
				faceRings: faceIndexes.sides[i].faceRings.map(ring => ring.map(index => {
					return this.points[index]
				})),
				noseToEar: new Vector(),
				ear: faceIndexes.sides[i].faceRings[0].slice(7, 10).map(index => this.points[index])
				
			}

			this.sides[i] = side
			
		}



		this.sideOrder = [this.sides[0], this.sides[1]]

		// Create mouth lines
		this.mouth = faceIndexes.mouth.map(mouthLine => mouthLine.map(index => this.points[index]))
		this.centerLine = faceIndexes.centerLine.map(index => this.points[index])
		this.noseTip = this.points[4]
		this.chin = this.points[152]
		this.forehead = this.points[10]

	}


	// Set this face to the animation data.
	// Or the tracking data 
	// Or both?

	update(t, totalTime) {
		this.animationFrame++
		
		let frameNumber = Math.floor(totalTime*.01)
		let faceFrame = testFaceData[frameNumber%testFaceData.length]
		let handFrame = testHandData[frameNumber%testHandData.length]
		
		// console.log(handFrame)
		// Compare the current Handsfree data to the animation data, maybe?
		for (var i = 0; i < this.points.length; i++) {
			this.points[i][0] = faceFrame[i][0]
			this.points[i][1] = faceFrame[i][1]
		}

		for (var j = 0; j < this.hands.length; j++) {
			let hand = this.hands[j]
			let frame = handFrame[j]

			for (var i = 0; i < hand.points.length; i++) {
				hand.points[i][0] = frame[i][0]
				hand.points[i][1] = frame[i][1]
			}
		
		}

	}

	// Do meta calculations
	calculateMetaTrackingData() {
		
		for (var i = 0; i < 2; i++) {
			let side = this.sides[i]
			side.eye.setToAverage(side.eyeRings[4])

			side.noseToEar.setToDifference(side.ear[2], this.noseTip)
			side.blink = 10*Vector.getDistance(side.eyeRings[4][4],side.eyeRings[4][8])/face.size


			// Hand calculations
			let h = hand[i]
			h.handDir.setToDifference(h.center,h.wrist)
			for (var j = 0; j < 5; j++) {
				h.pointDir[j].setToDifference(h.fingers[j][3],h.fingers[j][1])
			}
		
			
		}
		
		this.center.setToAverage([this.sides[0].eye, this.sides[1].eye])
		this.direction.setToAddMultiples(this.sides[0].noseToEar, 1, this.sides[1].noseToEar, 1)
		// console.log(face.center)
		this.sideOrder = this.direction[0] < 0? [this.sides[0], this.sides[1]]: [this.sides[1], this.sides[0]]
		
		this.width = Vector.getDistance(this.sides[0].ear[2], this.sides[1].ear[2])
		this.length = Vector.getDistance(this.chin, this.forehead)
		this.size = Math.max(this.width*1.5, this.length)
		this.scale = this.size/250
		
	} 

	
}




//--------------------------------
// Updating



let hfUpdateCount = 0
function applyHandsFreeData(data) {

	hfUpdateCount++
	
	// Only set position if visible
	// Also smooth with the previous point
	// pt.setToLerp((meshPt.x,meshPt.y), pt, app.smooth)
	function setPoint(pt, meshPt) {
	
		
		let x = (.5 - meshPt.x)*canvasW
		let y = (meshPt.y - .5)*canvasH
		pt.setTo(x, y)
		
		pt.visible = meshPt.visible
	}

	// Set the points to the current mesh
	if (data.facemesh &&  data.facemesh.multiFaceLandmarks &&  data.facemesh.multiFaceLandmarks.length > 0) {
		let faceMesh = data.facemesh.multiFaceLandmarks[0]
		
		// Copy over all of the face data
		for (var i = 0; i < faceMesh.length; i++) {
			setPoint(face.points[i], faceMesh[i])
		}
	}

	hand[0].visible = false
	hand[1].visible = false
	if (data.hands.multiHandLandmarks && data.hands.multiHandLandmarks.length > 0) {
		
		for (var i = 0; i < hand[0].points.length; i++) {

			setPoint(hand[0].points[i], data.hands.multiHandLandmarks[0][i])
			hand[0].visible = true
			if (data.hands.multiHandLandmarks[1]) {
				hand[1].visible = true
				setPoint(hand[1].points[i], data.hands.multiHandLandmarks[1][i])
			}
			
		}
	} else {
		console.log("-- no hands -- ")
	}
	calculateMetaTrackingData()
	
}

function initHandsFree(face) {
	let hfData = {
		face:[],
		hands: [[],[]]
	}

	

	if (handsfree === undefined) {

		console.log("Init handsfree....waiting to load the camera...")
		
		// From the handsfree demos (mostly)
		handsfree = new Handsfree({
			showDebug: true,
			hands: true
		})
		console.log("Finished initializing handsfree, stop recorded data")
		
		app.handsfreeActive = true
		handsfree.update({facemesh: true})

		// Let's create a plugin called "logger" to console.log the data
		handsfree.use('logger', (data) => {

			// New data! store it?
			if (data.facemesh &&  data.facemesh.multiFaceLandmarks &&  data.facemesh.multiFaceLandmarks.length > 0) {
				let faceMesh = data.facemesh.multiFaceLandmarks[0]
				console.log(faceMesh)
			}

		})


		// Start webcam and tracking (personally, I always like to ask first)
		handsfree.start()
	}

}