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
        let self = this
        this.groupNamespace.on('connection', function(socket) {
            self.createGroupRoom(socket)
            self.joinGroupsRooms(socket);
            self.joinGroupRoom(socket);
            self.inviteUserToRoom(socket)
            self.getInvites(socket);
            // self.test(socket);
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
        let self = this
        socket.on('getInvites', function (userId) {
            lugController.getPendingInvitesFromUser({user_id : userId}, function (err, invites) {
                if (err) socket.emit(userId, err)
                else {
                    console.log('USERID : ', userId, typeof userId)
                    // socket.join(userId)
                    // self.emitMessageToAll(socket, 'test', invites, userId);
                    socket.emit('test', 'test')
                    console.log('SENT INVITES')
                }
            })
        })
    }

    // test(socket) {
    //     socket.on('test', function(data) {
    //         console.log(data)
    //     })
    // }

}

module.exports = NotificationGroupHandler;
