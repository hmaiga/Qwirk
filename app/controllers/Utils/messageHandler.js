/**
 * Created by jngue on 11/05/2017.
 */

let q = require('q');
let amqp = require('amqp');
let messageModel = require('./../../models').message;

let contactController = require('./../../controllers').contact;
let userController = require('./../../controllers').user;
let messageController = require('./../../controllers').message;

class MessageHandler {
    constructor(io, ss, user) {
        this.io = io;
        this.user = user;
        this.ss = ss;
        this.contactNsp = this.io.of('/privatePeer2Peer');

        this.rabbitConn = amqp.createConnection({url: "amqp://localhost"});
        this.chatExchange;
        this.roomName = "";
        this.roomsName = {};
        this.numClients = {};
        this.socketId = "";
        this.actualUser = "";
        this.socket;
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
        //console.log("New connection on socket io");
    }

    joinContactsChannels(socket) {
        let self = this;
        let contactsUser = contactController.getContacts(this.user._id);
        //let contactNsp =
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
                        self.onNotification(socket);
                    })
            }
        }
    }

    joinContactChannel(socket) {
        let self = this;
        self.socket = socket;
        socket.on('room', function (userRoom) {
            //console.log('Bind room join', userRoom);
            //socket.disconnect();
            //self.leaveAllRooms(socket);
            console.log('Join room success', userRoom);
            socket.join(userRoom.room);
            socket.room = userRoom.room;
            socket.user = userRoom.user;

            if (self.numClients[userRoom.room] == undefined) {
                self.numClients[userRoom.room] = 1;
            } else {
                self.numClients[userRoom.room]++;
            }
            self.rabbiMqBindSub(socket);
            self.onMessageToRoom(socket);
            self.sendMessageToOthers(socket)
            self.onNotification(socket);
            self.updateMessageStatus(socket);
            self.roomsName[userRoom.user] = userRoom.room;
            self.roomName = userRoom.room;
            //console.log('Join room success', room, self.roomName, self.numClients);
        })
    }

    onDisconnectNameSpace(socket) {
        let self = this;
        socket.on('disconnect', function (e) {
            if (self.numClients[self.roomsName[socket.user]] == 0) {
                self.numClients[self.roomsName[socket.user]] = undefined;
            } else if (self.numClients[self.roomsName[socket.user]] == 0) {
                self.numClients[self.roomsName[socket.user]]--;
            }
            //self.leaveAllRooms(socket);
            socket.disconnect();
            console.log('Disconnect ', e);
        })
    }

    leaveAllRooms(socket) {
        let rooms = this.io.sockets.manager.roomClients[socket.id];
        for(let room in rooms) {
            socket.leave(room);
        }
    }

    socketEmitter(socket, room, event, message) {
        //console.log('Socket Emitter', room, event, message);
        socket.broadcast.to(room).emit(event, message);
    }

    socketAllEmitter(socket, room, event, message) {
        //console.log('Socket Emitter', room, event, message);
        socket.to(room).emit(event, message);
    }

    socketEmitterOnNsp(socket, event, message) {
        //console.log(this.io.sockets);
        this.io.sockets.emit(event, message);
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
            self.chatExchange = self.rabbitConn.exchange(self.roomsName[socket.user], {
                'type': 'fanout'
            });
        });
    }

    onMessageToRoom(socket) {
        let self = this;
        //console.log('toto : ', self.roomsName[socket.user]);
        socket.on(self.roomsName[socket.user], function (text) {
            self.socketId = socket.id;
            console.log('On Message to room', self.roomsName, self.socketId, text);
            //self.rabbitMqPub(text);

            //let message = new messageModel(text);
            //console.log('RabbitMQ Publisher', self.roomName, message);
            text.messageStatus.status = 'sent';
            messageController.addMessage(text, function (err, result) {
                if(err) console.error(err);
                else {
                    console.log("On message to room : ",self.roomsName[result.sender]);
                    self.socketEmitter(socket, self.roomsName[result.sender], self.roomsName[result.sender], result);
                    self.socketEmitterOnNsp(socket, "newMessage", result);
                }
            })
        })
    }

    sendMessageToOthers(socket) {
        let self = this;
        socket.on(self.roomsName[socket.user] + "sleep", function (text) {
            console.log("On message to room : ",self.roomsName[text.sender]);
            self.socketEmitter(socket, self.roomsName[text.sender], self.roomsName[text.sender], text);
            self.socketEmitterOnNsp(socket, "newMessage", text);
        })
    }

    onNotification(socket) {
        let self = this;
        //console.log('isTyping binding event');
        socket.on('isTyping', function (text) {
            //console.log('isTyping emitting to client');
            self.socketEmitter(socket, self.roomsName[socket.user], 'isTyping', text);
        })
    }

    onBlurNotification(socket) {
        let self = this;
        //console.log('isTyping blur event');
        socket.on('isTyping', function (text) {
            //console.log('isTyping emitting to client');
            self.socketEmitter(socket, self.roomsName[socket.user], 'isTyping', '');
        })
    }

    rabbiMqBindSub(socket) {
        let self = this;
        this.rabbitConn.queue(self.roomsName[socket.user], {
            exclusive: true
        }, function(q) {
            //Bind to chatExchange w/ "#" or "" binding key to listen to all messages.
            //console.log('RabbitMQ Queue Bind', q.name, self.roomName);
            q.bind(self.roomsName[socket.user], self.roomsName[socket.user], function (res) {
                //console.log("Bind ok");
            });
            //console.log('RabbitMQ Subscriber After binding', q.name);
            //Subscribe When a message comes, send it back to browser
            q.subscribe(function(message) {
                //console.log('RabbitMQ Subscriber', q.name, message);
                self.socketEmitter(socket, self.roomsName[socket.user], self.roomsName[socket.user], message);
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
        //console.log('RabbitMQ Publisher', this.roomName, message);
        this.chatExchange.publish(this.roomName, message);
    }

    updateMessageStatus(socket) {
        let self = this;
        socket.on("updateStatus", function (message) {
            //console.log("T'm in update status");
            messageController.updateMessageStatus(message, function (err, message) {
                //console.log("T'm in update status", message);
                if(err) console.log(err);
                else {
                    self.socketAllEmitter(socket, self.roomsName[socket.user], "updateStatus", message);
                }
            });
        })
    }

    getSocket() {
        return this.socket;
    }
}

module.exports = MessageHandler;
