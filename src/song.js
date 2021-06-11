const request = require('request');
const Vote = require('./vote');
const Room = require('./room');


module.exports.onNewSong = async (bot, data) => {
    // Up vote every song
    sleep(5000).then(() => {
        Vote(bot, `up`);
    });
}

module.exports.snag = async (bot) => {
    const roomInfo = await Room.getInfo(bot);
    let currentSongId = roomInfo.room.metadata.current_song._id;
    
    bot.playlistAdd(currentSongId);
    bot.snag();
};

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));