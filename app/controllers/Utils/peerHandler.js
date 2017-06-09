/**
 * Created by Housseini  Maiga on 5/31/2017.
 */
let contactModel = require('./../../models').contact;

let contactController = require('./../../controllers').contact;
let userController = require('./../../controllers').user;


class PeerConnection {
    constructor(peerServer, server, connected) {
        this.peerServer = peerServer;
        this.server = server;
        this.connected = connected;
    }

    init() {
        console.log(' this.connected = []; ===> ');
        this.peerServer.on('connection', function(id) {
            console.log('Peer server > peer connection id : /', id);
             console.log('this.connected : => ', this.connected);
            let idx = this.connected ? this.connected.indexOf(id) : -1; // only add id if it's not in the list yet
            if (idx === -1) {this.connected.push(id);}
            console.log('Connected users list : ',this.connected);
        });

        this.peerServer.on('disconnect', function(id) {
            console.log('Peer server > peer disconnect id : /', id);
            let idx = this.connected ? this.connected.indexOf(id) : -1; // only attempt to remove id if it's in the list
            if (idx !== -1) {this.connected.splice(idx, 1);}
            console.log('Connected users list : ', this.connected);
        });

        this.server.on('disconnect', function(id) {
            console.log(id + " disconnect");
        });
    }
}

module.exports = PeerConnection;


