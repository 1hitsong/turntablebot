const ttapi = require('ttapi');
const Storage = require('node-storage');
const store = new Storage('data');
const cors = require('cors');
const express = require('express')
const app = express();
const pug = require('pug');

require('dotenv').config({ path: './src/config/.env' });

app.use(`/styles`, express.static('./src/styles'));
app.use(`/scripts`, express.static('./src/scripts'));
app.use(`/modules`, express.static('./node_modules'));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000'
}));

const bot = {
    API: new ttapi(process.env.BOT_AUTH, process.env.BOT_USERID),
    Chat: require('./src/chat.js'),
    ContentFilters: require('./src/contentfilters.js'),
    DJQueue: require('./src/djqueue.js'),
    PrivateMessage: require('./src/privatemessage.js'),
    Room: require('./src/room.js'),
    Song: require('./src/song.js'),
    User: require('./src/user.js'),
    Vote: require('./src/vote.js'),
}

let roomName = '';

const login = () => {
    try {
        bot.API.roomRegister(process.env.BOT_ROOMID, async () => {
            bot.API.setAsBot();

            const roomInfo = await bot.Room.getInfo(bot);
            roomName = roomInfo.room.name;
        });
    }
    catch(err) {
        console.log(err);
        login();
    }
}

login();


var checkIfConnected = function ()
{
    if (!bot.API._isAuthenticated) {
        login();
    }
};

setInterval(checkIfConnected, 10000);

bot.API.on('disconnected', async (data) => {

});

bot.API.on('pmmed', async (data) => {
    bot.PrivateMessage.onNewPM(bot, data);
});

bot.API.on('add_dj', async (data) => {
    let nextDJ = await bot.DJQueue.getNextDJ();

    // Check the new DJ is the next in the Queue
    if (nextDJ) {
        if (nextDJ.userid !== data.user[0].userid) {
            bot.Chat.say(bot, `@${data.user[0].name} you are not next in queue.` );
            bot.API.remDj(data.user[0].userid);
            return;
        }
    }

    // Remove new DJ from the queue
    let removeMessage = await bot.DJQueue.remove(data.user[0]);
    if (removeMessage) {
        bot.Chat.say(bot, removeMessage);
    }
});

bot.API.on('rem_dj', async (data) => {
    // Check is there is anyone in the queue
    let nextDJ = await bot.DJQueue.getNextDJ();
    if (nextDJ) {
        Chat.say(bot, await bot.DJQueue.next() );
    }
});

// Actions when a user posts in chat
bot.API.on('speak', async (data) => {

    if (data.text.match(/^UNBAN/)) {
        bot.API.getUserId(data.name, function (userdata) { 
            if (!userdata.userid) {
                return;
            }
            let bannedList = store.get('bannedlist') ? store.get('bannedlist') : [];
            bot.API.boot(userdata.userid, `You've been banned from this room.`);
            if (bannedList.includes(userdata.userid)) {
                return;
            }
            bannedList.push(userdata.userid);
            store.put('bannedlist', bannedList);
        });
    }

    if (data.text.match(/𝕘𝕣𝟠𝟜𝕦/)) {
        bot.API.getUserId(data.name, function (userdata) { 
            if (!userdata.userid) {
                return;
            }
            let bannedList = store.get('bannedlist') ? store.get('bannedlist') : [];
            bot.API.boot(userdata.userid, `You've been banned from this room.`);
            if (bannedList.includes(userdata.userid)) {
                return;
            }
            bannedList.push(userdata.userid);
            store.put('bannedlist', bannedList);
        });
    }

    if (data.text.match(/gr84u/)) {
        bot.API.getUserId(data.name, function (userdata) { 
            if (!userdata.userid) {
                return;
            }
            let bannedList = store.get('bannedlist') ? store.get('bannedlist') : [];
            bot.API.boot(userdata.userid, `You've been banned from this room.`);
            if (bannedList.includes(userdata.userid)) {
                return;
            }
            bannedList.push(userdata.userid);
            store.put('bannedlist', bannedList);
        });
    }
    

    bot.Chat.onNewMessage(bot, data);

    let isMod = await bot.User.isMod(bot, data.userid);

    // Someone is calling for a ban
    if (data.text.match(/^\/ban (.+)/)) {
        
        if (!isMod) {
            bot.API.speak(`Only mods can ban users.`);
            return;
        }

        let usertoban = data.text.match(/^\/ban (.+)/)[1];
        bot.API.getUserId(usertoban, function (userdata) { 
            if (!userdata.userid) {
                return;
            }

            let bannedList = store.get('bannedlist') ? store.get('bannedlist') : [];

            bot.API.boot(userdata.userid, `You've been banned from this room.`);
            
            if (bannedList.includes(userdata.userid)) {
                return;
            }

            bannedList.push(userdata.userid);

            store.put('bannedlist', bannedList);
        });
    }
});

// Actions when a new song plays
bot.API.on('newsong', (data) => {
    bot.Song.onNewSong(bot, data);
});

// Actions when new users enter room
bot.API.on('registered', (registereddata) => {

    // Check if user is on banned list
    // If so, boot 'em
    bot.API.getUserId(registereddata.user[0].name, function (userdata) { 
        
        //Lookup failed
        if (!userdata.userid) {
            return;
        }

        // Ignore yourself
        if (userdata.userid === process.env.BOT_USERID) {
            return;
        }

        let bannedList = store.get('bannedlist') ? store.get('bannedlist') : [];

        if (bannedList.includes(userdata.userid)) {
            bot.API.boot(userdata.userid, `You've been banned from this room.`);
        }

        if (registereddata.user[0].name.substring(0,3) === 'III') {
            bot.API.boot(userdata.userid, `You've been banned from this room.`);
        }
    });

    // Greet incoming users
    /*
    sleep(1000).then(() => {
        bot.API.speak(`${registereddata.user[0].name}, Welcome to ${roomName}.`);
    });
    */
});

app.get('/', function (req, res) {
    bot.API.playlistAll( (playlistData) => {
        let html = pug.renderFile('./src/templates/index.pug', {playlistData: playlistData.list});
        res.send(html);
    });
});

app.post('/songstatus', async function (req, res) {
    const Youtube = require('./src/lib/youtube');
    let videoStatus = await Youtube.checkVideoStatus(req.body.videoIDs)
    res.send(videoStatus);
});

app.get('/queue.json', function (req, res) {
    bot.API.playlistAll( (playlistData) => {
        res.json(playlistData);
    });
});

app.post('/movesong', (req, res) => {
    bot.API.playlistReorder(Number.parseInt(req.body.indexFrom), Number.parseInt(req.body.indexTo));
    res.json(`refresh`);
});

app.get('/findsong', (req, res) => {
    bot.API.searchSong(req.query.term, (data) => {
        let html = pug.renderFile('./src/templates/search.pug', {playlistData: data.docs});
        res.send(html);
    });
});

app.get('/addsong', (req, res) => {
    bot.API.playlistAdd(req.query.songid);
    res.json(`refresh`);
});

app.get('/deletesong', (req, res) => {
    bot.API.playlistRemove(Number.parseInt(req.query.songindex));
    res.json(`refresh`);
});

app.listen(8585)