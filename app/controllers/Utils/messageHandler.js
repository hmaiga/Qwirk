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
    }
    init() {
        console.log("Init socket io");
        this.rabbitMqInit();
        this.io.on('connection', function (result) { 
            console.log("Init socket io", result);
        });
    }

    initContact() {
        this.contactNsp.on('connection', this.socketConnection);
    }

    socketConnection(socket) {
        console.log("New connection on socket io");
        this.onDisconnectNameSpace(socket);
        this.joinContactChannel(socket);
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
        socket.on('room', function (room) {
            socket.join(room);
        })
    }

    onDisconnectNameSpace(socket) {
        socket.on('disconnect', function (e) {
            console.log('Disconnect ', e);
        })
    }

    socketEmitter(socket, room, event, message) {
        socket.in(room).emit(event, message);
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
            self.chatExchange = self.rabbitConn.exchange(exchange, {
                'type': 'fanout'
            });
        });
    }

    onMessageToRoom(contact, socket) {
        let queueName;
        let self = this;
        (contact.username > self.user.username) ?
            queueName = self.user.username + contact.username
            : queueName = contact.username + self.user.username;
        socket.on(queueName, function (text) {
            self.rabbitMqPub(contact, text);
        })
    }

    rabbiMqBindSub(contact, socket) {
        let self = this;
        let queueName;
        (contact.username > self.user.username) ?
            queueName = self.user.username + contact.username
            : queueName = contact.username + self.user.username;
        this.rabbitConn.queue(queueName, {
            exclusive: true
        }, function(q) {
            //Bind to chatExchange w/ "#" or "" binding key to listen to all messages.
            q.bind(queueName, queueName);

            //Subscribe When a message comes, send it back to browser
            q.subscribe(function(message) {
                self.socketEmitter(socket, queueName, queueName, message);
            });
        });

    }

    rabbitMqPub(contact, text) {
        let queueName;
        (contact.username > self.user.username) ?
            queueName = self.user.username + contact.username
            : queueName = contact.username + self.user.username;
        let message = new messageModel();
        message.sender = this.user._id;
        message.receiverUser = contact._id;
        message.messageStatus = null;
        message.sendTime = new Date();
        message.queue = queueName;
        message.typeMessage = null;
        message.content = text;
        self.chatExchange.publish(queueName, message);
    }
}

module.exports = MessageHandler;