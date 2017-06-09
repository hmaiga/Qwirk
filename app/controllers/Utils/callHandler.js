/**
 * Created by Housseini  Maiga on 5/22/2017.
 */
let contactModel = require('./../../models').contact;

let contactController = require('./../../controllers').contact;
let userController = require('./../../controllers').user;


class CallHandler {
    constructor(io) {
        this.io = io;
        this.callNamespace = this.io.of('/callPeer');
    }

    init() {
        let self = this;
        let peerInfo;
        console.log("CallHandler > Init socket io");
        this.io.on('connection', function (socket) {
            console.log("CallHandler > Init socket io nsp : /");
        });
        this.callNamespace.on('connection', function (socket) {
            console.log("CallHandler > Init socket io nsp : /");
            socket.on('callRemotePeer', function (data) {
                console.log('CallHandler > call from : ', data);
                peerInfo = data;
                console.log('PeerInfo  1 : ', peerInfo);
                // socket.emit('call', {content});
                self.socketEmitter(socket, data);
            });
            console.log('PeerInfo 2 : ', peerInfo);

            socket.emit('call', {
                content: peerInfo
            });
        })

    }

    socketEmitter(socket, message) {
        console.log("Socket emmitter : ", message);
        socket.emit('call', {
            content: message
        }, function (data) {
            if(data.error) console.log('Something wrong', data);
            else console.log('socketEmitter data : ', data);
        });
    }

}

module.exports = CallHandler;

