/**
 * Created by TBS on 10/05/2017.
 */
var linkUserGroupModel = require('./../models').linkUserGroup;

var linkUserGroupController = {
    addLinkToGroup: function addLinkToGroup(group, callback) {
        if (group.data.isPublic === false) {
            for(var user in group.data.members) {
                var newLink = new linkUserGroupModel({group: group.groupId, user: group.data.members[user]._id, isPending: true, isKicked: false, isBanned: false, isAccepted: false })
                if(group.data.members.length === parseInt(user) + 1) {
                    newLink.save(function onSaveLink(err) {
                        console.log(group.data.members[user]._id)
                        if (err) {
                            return callback(err)
                        }
                        else {
                            console.log('INSIDE)')
                            return callback(null)
                        }

                    })

                }
                
                else {
                    newLink.save(function onSaveLink(err) {
                        console.log(group.data.members[user]._id)
                        if (err) {
                            return callback(err)
                        }

                        console.log('INSIDE elase)')
                    })
                }
                
            }
            
        }
        
        if (group.data.isPublic === true) {
            console.log('TADAAA')
            for(var user in group.data.members) {
                var newLink = new linkUserGroupModel({group: group.groupId, user: group.data.members[user]._id, isPending: false, isKicked: false, isBanned: false, isAccepted: true })
                if(group.data.members.length === parseInt(user) + 1) {
                    newLink.save(function onSaveLink(err) {
                        if (err) {
                            return callback(err)
                        }
                        else {
                            return callback(null)
                        }
                    })


                }

                else {
                    newLink.save(function onSaveLink(err) {
                        if (err) {
                            return callback(err)
                        }

                    })
                }
            }


        }


    },

    acceptLinkUserGroup: function updateLink(params, callback) {
        linkUserGroupModel.findOne({group: params.group, user: params.user}, function (err, linkFound) {
            if (err) return callback(err)
            if (!linkFounded) return callback("Cet utilisateur n'est pas relié à ce groupe")
            else {
                for(var key in params) {
                    if (key === 'group' || key === 'user' || key === '_id') {continue;}
                    console.log(key)
                    if (linkFound[key]) {
                        linkFound[key] = params[key];
                    }
                }
                return linkFound.save(function onSave(err, link) {
                    if (err) callback(err);
                    else {
                        return callback(null, link)
                    }
                })
            }
        })
    },

    getPendingInvitesFromUser: function getInvitesFromUser(params, callback) {
        return linkUserGroupModel.find({user : params.user_id, isPending: true, isAccepted: false}, function (err, invites) {
            if(err) return callback(err);
            else{
                return callback(null, invites)
            }
        })
    },

    removeLinkUserGroup: function updateLink(params, callback) {
        linkUserGroupModel.findOne({group: params.group, user: params.user}, function (err, linkFound) {
            if (err) return callback(err)
            if (!linkFounded) return callback("Cet utilisateur n'est pas relié à ce groupe, impossible de décliner l'invitation")
            else {
                linkUserGroupModel.remove({group: params.group, user: params.user}, function (err, linkRemoved) {
                    if (err) return callback(err, null)
                    else {
                        return callback(null, linkRemoved)
                    }
                })
            }
        })
    }
}
module.exports = linkUserGroupController;