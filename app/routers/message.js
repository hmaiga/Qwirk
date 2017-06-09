/**
 * Created by TBS on 26/02/2017.
 */
/**
 * Created by TBS on 21/02/2017.
 */
let jwt = require('express-jwt');
let sic = require('socket.io-client');
let path = require('path');

let config = require('./../../config/');
let messageController = require('./../controllers').message
let FileController = require('./../controllers/fileController');

let multer = require('multer');
let upload = multer();


let auth = jwt({
    secret: config.secret['PARAM'].secret,
    userProperty: 'payload'
});

var messageRouters = function messageRouters(router, app) {
    router.route('/messages/:contact/:start/:limit')
        .get(function(req, res) {
            //params = req.query.filter ? JSON.parse(req.query.filter) : {};
            return messageController.getMessages(req.params, function(err, messages) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(messages)
                }
            })
        })

        .post(function(req, res) {
            return messageController.addMessage(req.body, function(err, newMessage) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(newMessage);
                }
            })
        })

        .put(function(req, res) {
            return messageController.updateMessage(req.body, function(err, updatedMessage) {
                if (err) return res.status(500).send(err);
                else {
                    res.status(200).send(updatedMessage);
                }
            })
        });

    router.route('/groupmessages/:group/:start/:limit')
        .get(function(req, res) {
            //params = req.query.filter ? JSON.parse(req.query.filter) : {};
            return messageController.getGroupMessages(req.params, function(err, messages) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(messages)
                }
            })
        });

    router.route('/uploadMessage')
        .post(auth, function (req, res) {
            //console.log('req : ', req.files);
            let storage = multer.diskStorage({
                destination: path.join(__dirname, '..', 'assets', 'file')
            });
            let upload = multer({
                storage: storage,
                limits: { fieldSize: 25 * 1024 * 1024 }
            }).any();

            upload(req, res, function(err) {
                console.log('req : ', req.files);
                if (err) {
                    console.log(err);
                    return res.end('Error');
                } else {
                    //console.log('body : ', req.body);
                    req.files.forEach(function(item) {
                        console.log('Item : ', item);
                        //move your file to destination
                        return messageController.addMediaMessage(req, res, app, function (err, message) {
                            if (err) return res.status(500).send(err);
                            else {
                                let url = req.protocol + '://' + req.get('host');
                                let socket;
                                if(message.receiverGroup.length && message.receiverGroup.length > 0) {
                                    socket = sic(url + "/groupSocket");
                                    let userRoom = {"user" : "server", "room" : message.roomName};
                                    socket.emit('room', userRoom);
                                    socket.emit(message.roomName + "sleep", message);
                                }
                                else {
                                    socket = sic(url + "/privatePeer2Peer");
                                    let userRoom = {"user" : "server", "room" : message.roomName};
                                    socket.emit('room', userRoom);
                                    socket.emit(message.roomName + "sleep", message);
                                }
                                //socket.broadcast.to(message.roomName).emit(message);
                                console.log(message);
                                res.status(200).send(message);
                            }
                        })
                    });
                    //res.end('File uploaded');
                }
            });

        })

    router.route('/removemessage')
        .post(function(req, res) {
            return messageController.removeMessage(req, function(err, messages) {
                if (err) return res.status(500).send(err)
                else {
                    res.status(200).send(messages)
                }
            })
        })
    router.route('/getSendMessages')
        .get(auth, function (req, res) {
            return messageController.findMessagesByReceiver(req, function (err, messages) {
                if(err) return res.status(404).send(err)
                else {
                    res.status(200).send(messages);
                }
            })
        })
    router.route('/getFilename/:filename')
        .get(function (req, res) {
            let fc = new FileController(app);
            return fc.getFileByFilename(req, res, function (err, res) {
                if(err) return res.status(500).send(err);
                res.status(200).send(res);
            })
        })
}

module.exports = messageRouters;