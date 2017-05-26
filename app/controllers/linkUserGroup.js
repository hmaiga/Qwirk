/**
 * Created by TBS on 10/05/2017.
 */
var linkUserGroupModel = require('./../models').linkUserGroup;

createLinkToChannel: function createLinkToChannel(params, callback) {

}

createLinkToGroup: function createLinkToGroup(params, callback) {

}

removeLink: function removeLink (params, callback) {
    linkUserGroupModel.findOne({group: params.group, user: params.user}, function (err, linkFound) {
        if (err) return callback(err)
        if (!linkFound) return callback("Cet utilisateur n'est pas relié à ce groupe, impossible de décliner l'invitation")
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

var linkUserGroupController = {
    addLinkToGroup: function addLinkToGroup(group, callback) {
        if (group.members.length !== 0) {
            console.log("NO")
            if (group.isPublic === false) {
                for(var user in group.members) {
                    var newLink = new linkUserGroupModel({group: group._id, user: group.members[user]._id, isPending: true, isKicked: false, isBanned: false, isAccepted: false })
                    if(group.members.length === parseInt(user) + 1) {
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
                            console.log(group.members[user]._id)
                            if (err) {
                                return callback(err)
                            }

                            console.log('INSIDE elase)')
                        })
                    }

                }

            }

            if (group.isPublic === true) {
                console.log('TADAAA')
                for(var user in group.members) {
                    var newLink = new linkUserGroupModel({group: group._id, user: group.members[user]._id, isPending: false, isKicked: false, isBanned: false, isAccepted: true })
                    if(group.members.length === parseInt(user) + 1) {
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

        }
        else {
            return callback(null)
        }


    },

    updateLinkUserGroup: function (params, callback) {
        linkUserGroupModel.find({group: params._id}, function (err, linksFound) {
            if (err) return callback(err)
            else {
                console.log('HERE')
                let userIdArrayinLinks = []
                let membersId = []
                for(var l in linksFound) {
                    userIdArrayinLinks.push(linksFound[l].user.toString())
                }
                
                for(var m in params.members) {
                    membersId.push(params.members[m]._id)
                }
                
                console.log(membersId)
                
                if (membersId.length === 0 && userIdArrayinLinks.length === 0) return callback(null)
                
                for(var l in userIdArrayinLinks) {
                    console.log(typeof userIdArrayinLinks[l])
                    console.log(typeof membersId[0])

                    if (membersId.indexOf(userIdArrayinLinks[l]) !== -1) {
                        //In the array!
                        console.log('id present dans a et b')
                    }
                    else {
                        console.log("id de b non present dans a donc suppression..")
                        removeLink({group: params._id, user: userIdArrayinLinks[l]}, function onRemoveLink(err) {
                            if (err) {
                                console.log('ERR Suppression ')
                                return callback(err)
                            }

                        })
                    }

                }

                if (membersId.length === 0) return callback(null)
                for(var u in membersId) {
                    if (userIdArrayinLinks.indexOf(membersId[u]) !== -1) {
                        //In the array!
                        console.log('id de a present dans a et b')
                        console.log(membersId.length, parseInt(u)+1)
                        if(membersId.length === parseInt(u) + 1) {
                            console.log('id de a present dans a et b FIN')
                            return callback(null)
                        }
                    }
                    else {
                        if (params.isPublic === false) {
                            if(membersId.length === parseInt(u) +1) {
                                console.log("id de a non present dans b donc ajout FIN..")
                                var newLink = new linkUserGroupModel({group: params._id, user: membersId[u], isPending: true, isKicked: false, isBanned: false, isAccepted: false })
                                newLink.save(function onSaveLink(err) {
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
                                console.log("id de a non present dans b donc ajout")
                                var newLink = new linkUserGroupModel({group: params._id, user: membersId[u], isPending: true, isKicked: false, isBanned: false, isAccepted: false })
                                newLink.save(function onSaveLink(err) {
                                    if (err) {
                                        return callback(err)
                                    }

                                })
                            }
                        }

                        if (params.isPublic === true) {
                            if(params.members.length === parseInt(u) + 1) {
                                var newLink = new linkUserGroupModel({group: params._id, user: membersId[u], isPending: false, isKicked: false, isBanned: false, isAccepted: false })
                                newLink.save(function onSaveLink(err) {
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
                                var newLink = new linkUserGroupModel({group: params._id, user: membersId[u], isPending: false, isKicked: false, isBanned: false, isAccepted: false })
                                newLink.save(function onSaveLink(err) {
                                    if (err) {
                                        console.log('errrrrrrr')
                                        return callback(err)
                                    }
                                    else {
                                        console.log('CONTINUE')
                                    }

                                })
                            }
                        }
                    }
                    
                }



            }
        })
    },
    
    acceptLinkUserGroup: function updateLink(params, callback) {
        linkUserGroupModel.findOne({group: params.group, user: params.user}, function (err, linkFound) {
            if (err) return callback(err)
            if (!linkFound) return callback("Cet utilisateur n'est pas relié à ce groupe")
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

    removeLinkUserGroup: function removeLink(params, callback) {
        removeLink(params, function (err, removedLink) {
            if (err) return callback(err)
            else {
                return callback(null, removedLink)
            }
        })
    },

    removeAllLinksfromGroup: function removeAllLinksfromGroup(params, callback) {
        let countRemoveLinks = 0
        console.log(params.group)
        linkUserGroupModel.find({group: params.group}, function (err, links) {
            console.log('LINKS', links)
            if (err) return callback(err)
            if (!links.length) return callback(null)
            else {
                for(let group in links) {
                    linkUserGroupModel.remove({group: links[group].group}, function (err, linkRemoved) {
                        if (err) return callback(err, null)
                        else {
                            countRemoveLinks++
                            if (links.length === countRemoveLinks) {
                                return callback(null, links)
                            }

                        }
                    })
                }

            }
        })
    }
}
module.exports = linkUserGroupController;