/**
 * Created by TBS on 24/05/2017.
 */

let userController = require('./../user');
let groupController = require('./../group');
let lugController = require('./../linkUserGroup');
let messageController = require('./../../controllers').message;

class NotificationGroupHandler {
    
    constructor(io) {
           this.io = io;
       this.groupNamespace = this.io.of('/groupSocket');
       this.roomsName = [];
       this.roomName = "";
    }
    
    init() {
        this.io.on('connection', function (res) {
            
        })
        let self = this
        this.groupNamespace.on('connection', function(socket) {
            self.createGroupRoom(socket);
            self.joinGroupsRooms(socket);
            self.joinGroupRoom(socket);
            self.bindUserToActualRoom(socket);
            self.inviteUserToRoom(socket);
            self.getInvites(socket);
        })
    }

    emitMessageToOther(socket, event, msg, room) {
        socket.broadcast.to(room).emit(event, msg); //emit à tout le monde de la room sauf à celui qui trigger la méthode
    }

    emitMessageToAll(socket, event, msg, room) {
        socket.to(room).emit(event, msg);       //emit à tout le monde de la room
    }

    joinGroupsRooms(socket) {
        let self = this
        socket.on('joinAllGroups', function(userId) {
            userController.findUserById(userId, function(err, userFound) {
                if (err) self.emitMessageToAll(socket, 'userError', err, userId)
                else {
                    self.connectedUser = userFound;
                    for (let group of userFound.groups) {
                        console.log("Everybody lookup", group);
                        socket.join(group);
                    }
                }
            })
        })
    }

    createGroupRoom(socket) {
        console.log('BEFOIRE GROUP')
        let self = this
        socket.on('createGroupRoom', function(group) {       //group et ses membre
            if (group.isPublic === true) {
                console.log('IN channel true')
                groupController.addGroup(group, function(err, newGroup) {
                    if (err)  {
                        self.emitMessageToAll(socket, 'userError', err, group.owner)
                    }
                    else {
                        socket.join(newGroup)
                        console.log('the new group has been added')
                        socket.emit('triggerJoinGroup', newGroup)
                        console.log('channel joined')
                    }
                })
            }
            else {
                groupController.addGroup(group, function(err, newGroup) {
                    if (err) self.emitMessageToAll(socket, 'userError', err, group.owner)
                    else {
                        socket.join(newGroup)
                        group._id = newGroup._id
                        socket.emit('triggerSendInvitation', group)
                    }
                })
            }

        })
    }

    joinGroupRoom(socket) {
        let self = this
        socket.on('joinGroup', function(group) {        //room ici est le nom de la room spécifiée côté front --> socket.emit('joinGroup', room), avec room == { _id: '132', etc}
            groupController.updateGroup(group, function(err, updatedGroup) {
                if (err) self.emitMessageToAll(socket, 'userError', err, group.owner)
                else {
                    socket.join(group);
                    self.emitMessageToAll(socket, 'userAdded', 'Welcome to ' + self.connectedUser.username, group)
                }
            })

        })
    }

    bindUserToActualRoom(socket) {
        let self = this;
        socket.on('room', function(userBindGroup) {
            socket.join(userBindGroup.room);
            socket.room = userBindGroup.room;
            socket.user = userBindGroup.user;

            self.roomsName[userBindGroup.user] = userBindGroup.room;
            self.roomName = userBindGroup.room;
            console.log("Bind User to Actual Room", self.roomsName);
            self.onMessageToRoom(socket);
            self.sendMessageToOthers(socket)

            self.onNotification(socket);
            self.updateMessageStatus(socket);
        })
    }

    inviteUserToRoom(socket) {
        let self = this
        socket.on('invitationToUser', function (invitation) {           //invitation = { group: {}, initiator: '127', targets: [{}]}
            for (let target of invitation.targets) {
                self.emitMessageToAll(socket, 'invitationSent', invitation.initiator.username + ' has invited ' + target.username, invitation.group)        //on notifie tous les membres du gorupe qu'un user a été inité
            }
            invitation.group.members = invitation.targets;
            lugController.addLinkToGroup(invitation.group, function (err, link) {
                if (err) {
                    self.emitMessageToAll(socket, 'linkError', err, invitation.initiator);
                    console.log('ERROR WHILE SEND INVITES');
                }
                else {
                    socket.emit('invitationReceived', invitation.targets)       //on envoit un event avec les targets, pour que le user puisse voir s'il en fait partie et faire des trucs
                }
            })
        })
    }
    
    getInvites(socket) {
        let self = this;
        socket.on('getInvites', function (userId) {
            lugController.getPendingInvitesFromUser({user_id : userId}, function (err, invites) {
                if (err) socket.emit(userId, err)
                else {
                    console.log('USERID : ', userId, typeof userId)
                    socket.join(userId)
                    self.emitMessageToAll(socket, userId, invites, userId);
                    console.log('SENT INVITES')
                }
            })
        })
    }

    socketEmitterOnNsp(socket, event, message) {
        //console.log(this.io.sockets);
        this.io.sockets.emit(event, message);
    }

    onMessageToRoom(socket) {
        let self = this;
        console.log('toto : ', self.roomsName[socket.user]);
        socket.on(self.roomsName[socket.user], function (text) {
            self.socketId = socket.id;
            console.log('On Message to room', self.roomsName, self.socketId, text);
            //self.rabbitMqPub(text);

            //let message = new messageModel(text);
            console.log('RabbitMQ Publisher', self.roomName, text);
            text.messageStatus.status = 'sent';
            messageController.addMessage(text, function (err, result) {
                if(err) console.error(err);
                else {
                    userController.findUserById(result.sender, function (err, res) {
                        if (err) console.error(err);
                        else {
                            result.sender = res;
                            console.log("On message to room : ",self.roomsName[result.sender._id]);
                            self.emitMessageToOther(socket, self.roomsName[result.sender._id], result, self.roomsName[result.sender._id]);
                            self.socketEmitterOnNsp(socket, "newGroupMessage", result);
                        }
                    })
                }
            })
        })
    }

    sendMessageToOthers(socket) {
        let self = this;
        socket.on(self.roomsName[socket.user] + "sleep", function (text) {
            console.log("On message to room : ",self.roomsName[text.sender]);
            self.emitMessageToAll(socket, self.roomsName[text.sender], self.roomsName[text.sender], text);
            //self.socketEmitterOnNsp(socket, "newMessage", result);
        })
    }

    onNotification(socket) {
        let self = this;
        console.log('isTyping binding event');
        socket.on('isTyping', function (text) {
            console.log('isTyping emitting to client', socket.user);
            self.emitMessageToOther(socket, self.roomsName[socket.user], text, 'isTyping');
        })
    }

    updateMessageStatus(socket) {
        let self = this;
        socket.on("updateStatus", function (message) {
            //console.log("T'm in update status");
            messageController.updateMessageStatus(message, function (err, message) {
                console.log("T'm in update status", message);
                if(err) console.log(err);
                else {
                    self.emitMessageToAll(socket, self.roomsName[socket.user], message, "updateStatus");
                }
            });
        })
    }

}

module.exports = NotificationGroupHandler;
