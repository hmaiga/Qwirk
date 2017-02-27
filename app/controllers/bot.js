/**
 * Created by TBS on 26/02/2017.
 */
var builder = require('botbuilder');
var botModel = require('./../models').group

var botController = {
    addBot: function addBot(params, callback) {
        var newBot = new botModel(params)
        return newBot.save(function onSaveBot(err, bot) {
            if (err) return callback(err)
            else {
                return callback(null, bot)
            }
        })
    },
    
    getBots: function getBots(params, callback) {
        return botModel.find(params, function onGetBots(err, arrayBots) {
            if (err) return callback(err)
            else {
                return callback(null, arrayBots)
            }
        })
    },

    updateBot: function updateBot(params, callback) {
        botModel.findOne({id : params.id}, function(err, botFound) {
            if (err) return callback(err)
            if (!botFound) return callback("Aucun groupe n'a été trouvé")
            else {
                for(var key in botFound) {
                    if (key === 'id') {continue;}
                    botFound[key] = params[key];
                }

                return botFound.save(function onSaveUpdateBot(err, savedBot) {
                    if (err) callback(err)
                    else {
                        return callback(null, savedBot)
                    }
                })
            }
        })

    },

    removeBot: function removeBot(params, callback) {
        return botModel.remove(params, function onRemoveBot(err, deletedBot) {
            if (err) return callback(err)
            else {
                return callback(null, deletedBot)
            }
        })
    },

    sendMessages: function sendMessages(params, callback) {
        var connector = new builder.ChatConnector({
            appId: process.env.MICROSOFT_APP_ID,
            appPassword: process.env.MICROSOFT_APP_PASSWORD
        });
        var bot = new builder.UniversalBot(connector);
        connector.listen();
        //
        // bot.dialog('/', [
        //     function (session, args, next) {
        //         if (!session.userData.name) {
        //             session.beginDialog('/profile');
        //         } else {
        //             next();
        //         }
        //     },
        //     function (session, results) {
        //         session.send('Hello %s!', session.userData.name);
        //     }
        // ]);
        //
        // bot.dialog('/profile', [
        //     function (session) {
        //         builder.Prompts.text(session, 'Hi! What is your name?');
        //     },
        //     function (session, results) {
        //         session.userData.name = results.response;
        //         session.endDialog();
        //     }
        // ]);
        //
        
        var intents = new builder.IntentDialog();
        bot.dialog('/', intents);
        
        intents.matches(/^change name/i, [
            function (session) {
                session.beginDialog('/profile');
            },
            function (session, results) {
                session.send('Ok... Changed your name to %s', session.userData.name);
            }
        ]);
        
        intents.matches(/^erase name/i, [
        
            function (session) {
                delete session.userData.name;
                session.send("Ok... I'm forgetting your name..");
                session.endDialog();
        
            },
        ]);
        
        intents.onDefault([
            function (session, args, next) {
                if (!session.userData.name) {
                    session.beginDialog('/profile');
                } else {
                    next();
                }
            },
            function (session, results) {
                session.send('Hello %s!', session.userData.name);
            }
        ]);
        
        bot.dialog('/profile', [
            function (session) {
                builder.Prompts.text(session, 'Hi! What is your name?');
            },
            function (session, results) {
                session.userData.name = results.response;
                session.endDialog();
            }
        ]);
    }
}

module.exports = botController;
