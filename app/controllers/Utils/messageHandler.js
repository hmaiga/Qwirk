/**
 * Created by jngue on 11/05/2017.
 */

let q = require('q');
let amqp = require('amqp');
let messageModel = require('./../../models').message;

let contactController = require('./../../controllers').contact;
let userController = require('./../../controllers').user;

class MessageHandler {
    constructor(io, user) {
        this.io = io;
        this.user = user;
        this.contactNsp = this.io.of('/privatePeer2Peer');

        this.rabbitConn = amqp.createConnection({url: "amqp://localhost"});
        this.chatExchange;
        this.roomName = "";
        this.numClients = {};
        this.socketId = "";
    }
    init() {
        console.log("Init socket io");
        this.rabbitMqInit();
        this.io.on('connection', function (result) { 
            console.log("Init socket io nsp : /");
        });
        this.initContact();
    }

    initContact() {
        let self = this;
        this.contactNsp.on('connection', function (socket) {
            console.log('Init socket io nsp :', socket.nsp.name);
            self.socketConnection(socket);
        });
    }

    socketConnection(socket) {
        this.onDisconnectNameSpace(socket);
        this.joinContactChannel(socket);
        console.log("New connection on socket io");
    }

    joinContactsChannels(socket) {
        let self = this;
        let contactsUser = contactController.getContacts(this.user._id);
        //var contactNsp =
        for(let contactUser of contactsUser) {
            let roomName;
            if(contactUser.contact !== null && !contactUser.isPending && !contactUser.isBlocked) {
                this.getContactPromise(contactUser.contact)
                    .then(function (contact) {
                        (contact.username > self.user.username) ?
                            roomName = self.user.username + contact.username
                            : roomName = contact.username + self.user.username;
                        socket.join(roomName);
                        self.rabbiMqBindSub(contact, socket);
                        self.onMessageToRoom(contact, socket);
                    })
            }
        }
    }

    joinContactChannel(socket) {
        let self = this;
        socket.on('room', function (room) {
            console.log('Bind room join');
            socket.join(room);
            socket.room = room;

            if (self.numClients[room] == undefined) {
                self.numClients[room] = 1;
            } else {
                self.numClients[room]++;
            }
            self.rabbiMqBindSub(socket);
            self.onMessageToRoom(socket);
            self.roomName = room;
            console.log('Join room success', room, self.roomName, self.numClients);
        })
    }

    onDisconnectNameSpace(socket) {
        socket.on('disconnect', function (e) {
            console.log('Disconnect ', e);
        })
    }

    socketEmitter(socket, room, event, message) {

        console.log('Socket Emitter', room, event, message);
        socket.broadcast.to(room).emit(event, message);
    }

    getContactPromise(id) {
        let deffered = Q.defer();
        userController.findUserById(id, function (err, user) {
            if (err) deffered.reject(err);
            else deffered.resolve(user);
        });
        return deffered.promise;
    }

    rabbitMqInit(exchange) {
        let self = this;
        self.rabbitConn.on('ready', function() {
            self.chatExchange = self.rabbitConn.exchange(self.roomName, {
                'type': 'fanout'
            });
        });
    }

    onMessageToRoom(socket) {
        let self = this;
        console.log('toto : ', self.roomName);
        socket.on(self.roomName, function (text) {
            self.socketId = socket.id;
            console.log('On Message to room', self.roomName, self.socketId, text);
            self.rabbitMqPub(text);
        })
    }

    rabbiMqBindSub(socket) {
        let self = this;
        this.rabbitConn.queue(self.roomName, {
            exclusive: true
        }, function(q) {
            //Bind to chatExchange w/ "#" or "" binding key to listen to all messages.
            console.log('RabbitMQ Queue Bind', q.name, self.roomName);
            q.bind(self.roomName, self.roomName, function (res) {
                console.log("Bind ok");
            });
            console.log('RabbitMQ Subscriber After binding', q.name);
            //Subscribe When a message comes, send it back to browser
            q.subscribe(function(message) {
                console.log('RabbitMQ Subscriber', q.name, message);
                self.socketEmitter(socket, self.roomName, self.roomName, message);
            });
        });

    }

    rabbitMqPub(text) {
        let message = new messageModel();
        message.messageStatus = null;
        message.sendTime = new Date();
        message.queue = this.roomName;
        message.typeMessage = null;
        message.content = text;
        console.log('RabbitMQ Publisher', this.roomName, message);
        this.chatExchange.publish(this.roomName, message);
    }
}

module.exports = MessageHandler;