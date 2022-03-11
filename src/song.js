module.exports.onNewSong = async (bot, data) => {
    // Up vote every song
    sleep(5000).then(() => {
        bot.Vote(bot, `up`);
    });
}

module.exports.snag = async (bot) => {
    const roomInfo = await bot.Room.getInfo(bot);
    let currentSongId = roomInfo.room.metadata.current_song._id;
    
    bot.API.playlistAdd(currentSongId);
    bot.API.snag();
};

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));