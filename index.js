const ttapi = require('ttapi');
const Storage = require('node-storage');
const request = require('request');
const store = new Storage('data');

require('dotenv').config();

const PrivateMessage = require('./src/privatemessage.js');
const Chat = require('./src/chat.js');

const AUTH = process.env.BOT_AUTH;
const USERID = process.env.BOT_USERID;
const ROOMID = process.env.BOT_ROOMID;

const bot = new ttapi(AUTH, USERID);

let roomName = '';

bot.roomRegister(ROOMID, async () => {
    bot.setAsBot();

    const roomInfo = await getRoomInfo();
    roomName = roomInfo.room.name;
});

bot.on('disconnected', async (data) => {

});

bot.on('pmmed', async (data) => {
    PrivateMessage.pmReceived(bot, data);
});

// Actions when a user posts in chat
bot.on('speak', async (data) => {

    Chat.onNew(bot, data);

    let isMod = await isModerator(data.userid);    

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
    // Up vote every song
    sleep(1000).then(() => {
        bot.bop();
    });
});

// Actions when new users enter room
bot.on('registered', (registereddata) => {

    // Ignore yourself
    if (registereddata.user[0].name === 'tgpo [bot]') {
        return;
    }

    // Check if user is on banned list
    // If so, boot 'em
    bot.getUserId(registereddata.user[0].name, function (userdata) { 
        if (!userdata.userid) {
            return;
        }

        let bannedList = store.get('bannedlist') ? store.get('bannedlist') : [];

        if (bannedList.includes(userdata.userid)) {
            bot.boot(userdata.userid, `You've been banned from this room.`);
        }
    });

    // Greet incoming users
    sleep(1000).then(() => {
        // bot.speak(`${registereddata.user[0].name}, Welcome to ${roomName}.`);
    });
});

// Check if user is moderator of current room
const isModerator = async (userId) => {
    const roomInfo = await getRoomInfo();
    let moderatorList = roomInfo.room.metadata.moderator_id;
    return moderatorList.includes(userId);
}

// Async RoomInfo Fuction
const getRoomInfo = () => {
    return new Promise(resolve => {
        bot.roomInfo( (data) => {
            resolve(data);
        });
    });
}

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));