// Utilities for room-based experiences on peer.js
// One player is the host and relays all actions to other players
// All other players relay actions through the host

const sendAsJSON = false

class PeerRoom {

	constructor(roomID, displayName, isHost = false) {
		io.room = this
		this.id = ""


		this.handlers = []
		this.displayName = displayName

		// Create a room
		this.roomID = roomID
		this.isHost = isHost
		this.guests = []


		// Hosts and guests both have access to the guest list
		

		// console.log(`Create room '${roomID}' as ${isHost?'host':'guest'}`)
		if (this.isHost) 
			this.connectAsHost()
		else 
			this.connectAsGuest()

		app.setPeerHandlers(this)
	}

	connectAsHost() {
		this.id = this.roomID

		// Add myself as a room member 
		// this.addGuest({displayName: this.displayName, id:this.id, isHost:true})

		this.peer = new Peer(io.prefix + this.roomID); 
		
		this.peer.on('open', (id) => {

			// Someone connects
			this.peer.on('connection', (conn) => {
				// console.log(`Making connection to ${conn.peer.substring(0,4)}...`)
				conn.on('open', () => {
					// console.log(`...Open connection to ${conn.peer.substring(0,4)}!`)
					

					this.addGuest({conn:conn})

					
					// Send startup data
					conn.send({
						from: this.id,
						action: "state",
						data: this.getState()
					})

					// Create a data pipeline to this guest
					conn.on('data', (data) => {
						// We got data from a guest, this guest has drawn something

						// Is this to me or a rebroadcast request?
						// console.log("Got guest data", data)
						if (data.rebroadcast) {
							// Rebroadcast
							// console.log("rebroadcast!", data)
							
							this.guests.forEach(guest => {
								// rebroadcast to everyone but the sender
								if (guest.conn && guest.conn !== conn) {
									// console.log("rebroadcast to", guest.conn.peer.substring(0,4))
									guest.conn.send(data)
								}
							})

							// Also consume this message ourself
							this.handleMessage(data)		
						}
					});
				});

				conn.on('close', () => {
					// console.log(`guest ${conn.peer.substring(0,4)} left!`)
					this.removeGuest(conn.peer)
				})

				
			});
		})
	}
	
	connectAsGuest() {
		this.peer = new Peer(); 
		
		this.peer.on('open', (id) => {
			this.id = id

			// Connect to the room
			let hostConn = this.peer.connect(io.prefix + this.roomID, 
				{serialization:"json"}
				);
			this.hostConnection = hostConn

			console.log("host connected!")

			hostConn.on('open', () => {
				console.log("host open!", this.displayName)

				// Send the host my name, and other startup data
				this.broadcast("joinGame", {
					displayName: this.displayName,
					emoji: words.getRandom(words.emoji)
				})

				console.log(hostConn.serialization)

				hostConn.on('data', (data) => {
					console.log("got data from host", data)
					this.handleMessage(data)
					
				})
			})

			hostConn.on('close', () => {
				console.log("host closed!")
			})


		})
	}

	getState() {
		let state = {
			guests: this.guests.map(g => {
				return {
					displayName: g.displayName,
					id: g.id
				}
			})
		}
		console.log("STATE", state)
		return state
	}


	addGuest({id, conn, displayName, isHost}) {
		console.log("add guest", id, conn, displayName)
		
		// Add this guest to the game
		let guest = {
			isHost: isHost,
			id: id || conn.peer,
			displayName: displayName || "anonymous guest " + words.getRandom(words.emoji),
			conn: conn,
			data: {
				foo:"bar",
				pts: Math.floor(Math.random()*1000)
			}
		}
		this.guests.push(guest)


		
	}

	on(action, fxn) {
		if (!this.handlers[action])
			this.handlers[action] = []
		this.handlers[action].push(fxn)
	}

	handleMessage(msg) {
		// console.log(msg.action, msg.from, msg.data)
		if (this.handlers[msg.action]) {
			this.handlers[msg.action].forEach(fxn => fxn(msg.data, msg.from))
		}
	}

	removeGuest(guest) {
		// console.log("REMOVE", guest)
		let index = this.guests.findIndex(g => g === guest || g.id === guest || g.displayName === guest)
		if (index >= 0) {
			let g = this.guests[index]
			g.conn.close()
			this.guests.splice(index)
		}
	}

	broadcast(action, data) {
		let msg = {
			from: this.id,
			rebroadcast: !this.isHost,
			action: action,
			data: data
		}

			

		if (this.isHost) {
			// Send to everyone
			this.guests.forEach(guest => {
				// rebroadcast to everyone (with a connection, ie, not myself)
				if (guest.conn)
					guest.conn.send(msg)
			})
		} else {
			if (this.hostConnection) {
				// console.log("sending to the host")
				// Send as guest to the host, they'll rebroadcast
				this.hostConnection.send(msg)
			}
			
		}
	}

}





//====================================================
// Widget for PeerRoom controls
// Create, join, or leave a room


// Connect to a Peerjs room
Vue.component("peerroom-widget", {
	template: `
		<div class="section" class="widget-connection widget">
			<div>
				<div v-if="false">
					<span class="label">display name:</span><input v-model="displayName" />
					<div class="status">{{status}}</div>
				</div>
			</div>

			

			<div v-if="!room">
				Room name:<input v-model="roomID"></input>
				<button @click="hostRoom">create room</button>
				<button @click="joinRoom">join room</button>
				
			</div>

			<div v-else>
				<div>
					<span class=label>Room:</span><span class="uid">{{room.roomID}}<span>
				</div>
				<div  v-if="!room.isHost">
					<span class=label>my id:</span><span class="uid">{{room.id.substring(0,4)}}<span>
				</div>
				
					<table>
						<tr v-for="guest in room.guests" >
							<td v-if="false" class="label">{{guest.displayName}}</td>
							<td class="value">{{guest.id.substring(0,4)}}</td>
							<td class="control"><button @click="room.removeGuest(guest)">🅧</button></td>
						</tr> 
					</table>
					<div v-if="room.isHost && room.guests.length === 0" style="font-style:italic">no-one connected yet</div>
				</div>



			</div>

		

			
		</div>`,

	methods: {
		hostRoom() {
			// Create a new room as host
			this.room = new PeerRoom(this.roomID, this.displayName, true)
		},

		joinRoom() {
			// Join a new room as host
			this.room = new PeerRoom(this.roomID, this.displayName, false)
		},

		leaveRoom() {
			this.room.leave()
		}
	},

	mounted() {
		// console.log("new peer widget")
		// Automatically create or join a room based on querystrings
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);

		// ID of the room we are hosting or connecting to
		this.roomID = urlParams.get("room")||this.roomID	
		// console.log("ID", this.roomID)  	

		// Automatically start in host or guest mode
		let startMode = urlParams.get("mode")
		
		switch(startMode) {
			case "host": 
				this.hostRoom()
				break
			case "join": 
				this.joinRoom()
				break
		}
	},
	data() {
		return {
			room: undefined,
			io: io,
			status: "",
			displayName: words.getUserName(),
			roomID: "testroom"
		}
	}
})