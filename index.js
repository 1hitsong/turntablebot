const ttapi = require('ttapi');
const Storage = require('node-storage');
const request = require('request');
const store = new Storage('data');

require('dotenv').config();

const PrivateMessage = require('./src/privatemessage.js');
const Chat = require('./src/chat.js');
const Room = require('./src/room.js');
const Song = require('./src/song.js');
const User = require('./src/user.js');
const Vote = require('./src/vote.js');

const AUTH = process.env.BOT_AUTH;
const USERID = process.env.BOT_USERID;
const ROOMID = process.env.BOT_ROOMID;

const bot = new ttapi(AUTH, USERID);

let roomName = '';

bot.roomRegister(ROOMID, async () => {
    bot.setAsBot();

    const roomInfo = await Room.getInfo(bot);
    roomName = roomInfo.room.name;
});

bot.on('disconnected', async (data) => {

});

bot.on('pmmed', async (data) => {
    PrivateMessage.onNewPM(bot, data);
});

// Actions when a user posts in chat
bot.on('speak', async (data) => {

    Chat.onNewMessage(bot, data);

    let isMod = await User.isMod(bot, data.userid);

    // Someone is calling for a ban
    if (data.text.match(/^\/ban (.+)/)) {
        
        if (!isMod) {
            bot.speak(`Only mods can ban users.`);
            return;
        }

        let usertoban = data.text.match(/^\/ban (.+)/)[1];
        bot.getUserId(usertoban, function (userdata) { 
            if (!userdata.userid) {
                return;
            }

            let bannedList = store.get('bannedlist') ? store.get('bannedlist') : [];

            bot.boot(userdata.userid, `You've been banned from this room.`);
            
            if (bannedList.includes(userdata.userid)) {
                return;
            }

            bannedList.push(userdata.userid);

            store.put('bannedlist', bannedList);
        });
    }
});

// Actions when a new song plays
bot.on('newsong', (data) => {
    Song.onNewSong(bot, data);
});

// Actions when new users enter room
bot.on('registered', (registereddata) => {

    // Check if user is on banned list
    // If so, boot 'em
    bot.getUserId(registereddata.user[0].name, function (userdata) { 
        
        //Lookup failed
        if (!userdata.userid) {
            return;
        }

        // Ignore yourself
        if (userdata.userid === USERID) {
            return;
        }

        let bannedList = store.get('bannedlist') ? store.get('bannedlist') : [];

        if (bannedList.includes(userdata.userid)) {
            bot.boot(userdata.userid, `You've been banned from this room.`);
        }
    });

    // Greet incoming users
    /*
    sleep(1000).then(() => {
        bot.speak(`${registereddata.user[0].name}, Welcome to ${roomName}.`);
    });
    */
});