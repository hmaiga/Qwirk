/**
 * Created by TBS on 24/05/2017.
 */

let userController = require('./../user');
let groupController = require('./../group')
let lugController = require('./../linkUserGroup')

class NotificationGroupHandler {
    
    constructor(io) {
       this.io = io;
       this.groupNamespace = this.io.of('/groupSocket')
    }
    
    init() {
        this.io.on('connection', function (res) {
            
        })
        this.groupNamespace.on('connection', function(socket) {
            this.createGroupRoom(socket)
            this.joinGroupsRooms(socket);
            this.joinGroupRoom(socket);
            this.inviteUserToRoom(socket)
        })
    }

    emitMessageToOther(socket, event, msg, room) {
        socket.broadcast.to(room).emit(event, msg); //emit à tout le monde de la room sauf à celui qui trigger la méthode
    }

    emitMessageToAll(socket, event, msg, room) {
        socket.in(room).emit(event, msg);       //emit à tout le monde de la room
    }

    joinGroupsRooms(socket) {
        socket.on('joinAllGroups', function(userId) {
            this.userController.findUserById(userId, function(err, userFound) {
                if (err) this.emitMessageToAll(socket, 'userError', err, userId)
                else {
                    this.connectedUser = userFound;
                    for (let group of userFound.groups) {
                        socket.join(group);
                    }
                }
            })
        })
    }

    createGroupRoom(socket) {
        socket.on('createGroupRoom', function(group) {       //group et ses membre
            if (group.isPublic === true) {
                this.groupController.addGroup(group, function(err, newGroup) {
                    if (err) this.emitMessageToAll(socket, 'userError', err, group.owner)
                    else {
                        socket.join(group)
                        socket.emit('triggerJoinGroup', group)
                    }
                })
            }
            else {
                this.groupController.addGroup(group, function(err, newGroup) {
                    if (err) this.emitMessageToAll(socket, 'userError', err, group.owner)
                    else {
                        socket.join(group)
                        socket.emit('triggerSendInvitation', group)
                    }
                })
            }

        })
    }

    joinGroupRoom(socket) {
        socket.on('joinGroup', function(group) {        //room ici est le nom de la room spécifiée côté front --> socket.emit('joinGroup', room), avec room == { _id: '132', etc}
            this.groupController.updateGroup(group, function(err, updatedGroup) {
                if (err) this.emitMessageToAll(socket, 'userError', err, group.owner)
                else {
                    socket.join(group);
                    this.emitMessageToAll(socket, 'userAdded', 'Welcome to ' + this.connectedUser.username, group)
                }
            })

        })
    }

    inviteUserToRoom(socket) {
        socket.on('invitationToUser', function (invitation) {           //invitation = { group: {}, initiator: '127', targets: [{}]}
            for (let target of invitation.targets) {
                this.emitMessageToAll(socket, 'invitationSent', invitation.initiator.username + ' has invited ' + target.username, invitation.group)        //on notifie tous les membres du gorupe qu'un user a été inité
            }
            invitation.group.members = invitation.targets;
            this.lugController.addLinkToGroup(invitation.group, function (err, link) {
                if (err) this.emitMessageToAll(socket, 'linkError', err, invitation.initiator)
                else {
                    socket.emit('invitationReceived', invitation.targets)       //on envoit un event avec les targets, pour que le user puisse voir s'il en fait partie et faire des trucs
                }
            })
        })
    }

}

module.exports = NotificationGroupHandler;
