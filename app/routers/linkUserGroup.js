/**
 * Created by TBS on 09/05/2017.
 */
var linkUserGroupController = require('./../controllers').linkUserGroup

var linkUserGroupRouters = function linkUserLinkUserGroupRouters(router) {
    router.route('/invites/:user_id')
        .get(function(req, res) {
            // params = req.query.filter ? JSON.parse(req.query.filter) : {};
            console.log(req.params)
            return linkUserGroupController.getPendingInvitesFromUser(req.params, function(err, linkUserGroups) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(linkUserGroups)
                }
            })
        });

    router.route('/acceptinvites')
        // .post(function(req, res) {
        //     return linkUserGroupController.addLinkUserGroup(req.body, function(err, newLinkUserGroup) {
        //         if (err) return res.status(500).send(err);
        //         else {
        //             res.status(200).send(newLinkUserGroup);
        //         }
        //     })
        // })
    //ici on veut req.body : { isAccepted: true, isPending: false, group: '123', user: '456' }
        .put(function(req, res) {
            if (req.body.isAccepted === true && req.body.isPending === false) {
                return linkUserGroupController.acceptLinkUserGroup(req.body, function(err, updatedLinkUserGroup) {
                    if (err) return res.status(500).send(err);
                    else {
                        res.status(200).send(updatedLinkUserGroup);
                    }
                })

            }
            else {
                return res.status(400).send('Bad request : veuillez renseigner les bon champs');
            }
        });
    
    router.route('/refuseinvites')
        //ici on veut req.body : { isAccepted: false, isPending: false, group: '123', user: '456' }
        .put(function(req, res) {
            if (req.body.isAccepted === false && req.body.isPending === false) {
                return linkUserGroupController.removeLinkUserGroup(req.body, function(err, updatedLinkUserGroup) {
                    if (err) return res.status(500).send(err);
                    else {
                        res.status(200).send(updatedLinkUserGroup);
                    }
                })

            }
            else {
                return res.status(400).send('Bad request : veuillez renseigner les bon champs');
            }
        });
    
}

module.exports = linkUserGroupRouters;