var Bot = require('ttapi');
var Storage = require('node-storage');
const request = require('request');

require('dotenv').config();

const AUTH = process.env.BOT_AUTH;
const USERID = process.env.BOT_USERID;
const ROOMID = process.env.BOT_ROOMID;

const bot = new Bot(AUTH, USERID);

var store = new Storage('data');

let roomName = '';

bot.roomRegister(ROOMID, async () => {
    bot.setAsBot();

    const roomInfo = await getRoomInfo();
    roomName = roomInfo.room.name;
});

bot.on('disconnected', async (data) => {

});

bot.on('pmmed', async (data) => {
    if (data.text.match(/^\/commands/)) {
        bot.pm(`
        [ /ban * ]
        [ /lyrics artist - song title ]
        [ /what genre is * ]
        [ /wiki * ]
        [ /yt * ]
        `, data.senderid);
    }

    if (data.text.match(/^\/bop/)) {
        bot.bop();
    }
});

// Actions when a user posts in chat
bot.on('speak', async (data) => {

    // Bite Me
    if (data.text.match(/^\/biteme/)) {
        bot.speak(`Screw You ${data.name}!`);
    }

    // Lyrics Search
    if (data.text.match(/^\/lyrics (.+)/)) {
        let searchCriteria = data.text.match(/^\/lyrics (.+)/)[1];
        let songData = searchCriteria.split(` - `);
        let URL = `https://api.lyrics.ovh/v1/${songData[0]}/${songData[1]}`
        
        request(URL, {json: true}, (error, res, body) => {
            if (!body.hasOwnProperty(`lyrics`)) {
                bot.pm(`I couldn't find lyrics for ${searchCriteria}.`, data.userid);
                return;
            }

            bot.pm(body.lyrics, data.userid);
        });
    }

    // Genrenator
    // Generate new genres
    if (data.text.match(/^\/what genre is (.+)/)) {
        let searchCriteria = data.text.match(/^\/what genre is (.+)/)[1];
        let URL = `https://binaryjazz.us/wp-json/genrenator/v1/genre/`
        
        request(URL, {json: true}, (error, res, body) => {
            bot.speak(`${searchCriteria} is ${body}.`);
        });
    }

    // YouTube Search
    if (data.text.match(/^\/yt (.+)/)) {
        let searchCriteria = encodeURIComponent(data.text.match(/^\/yt (.+)/)[1]);

        if (containsBannedWords(data.text.match(/^\/yt (.+)/)[1])) {
            bot.speak(`Grow up.`);
            return;
        }

        let youtubeURL = `https://www.googleapis.com/youtube/v3/search?q=${searchCriteria}&key=${process.env.YOUTUBE_API_KEY}`
        
        request(youtubeURL, {json: true}, (error, res, body) => {
            let videoId = body.items[0].id.videoId;
            bot.speak(`https://www.youtube.com/watch?v=${videoId}`);
        });
    }

    // Wiki Search
    if (data.text.match(/^\/wiki (.+)/)) {
        if (containsBannedWords(data.text.match(/^\/wiki (.+)/)[1])) {
            bot.speak(`Grow up.`);
            return;
        }

        let searchCriteria = encodeURIComponent(data.text.match(/^\/wiki (.+)/)[1]);
        let wikiURL = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchCriteria}&format=json`
        
        request(wikiURL, {json: true}, (error, res, body) => {
            if (!body.query.search[0]) {
                return;
            }

            let PageID = encodeURIComponent(body.query.search[0].title);
            bot.speak(`http://en.wikipedia.org/wiki/${PageID}`);
        });
    }

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

const containsBannedWords = (search) => {
    let bannedWords = [`porn`, `pornography`, `porno`, `p0rn`, `pron`, `p0rno`, `p0rn0`];

    const searchWords = search.toLowerCase().split(` `);
    return !searchWords.every(word => !bannedWords.includes(word));
}
  

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));