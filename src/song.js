module.exports.onNewSong = async (bot, data) => {
    // Up vote every song
    sleep(5000).then(() => {
        bot.Vote(bot, `up`);
    });
}

module.exports.snag = async (bot) => {
    let currentSongId = await this.getCurrentSong(bot);
    
    bot.API.playlistAdd(currentSongId);
    bot.API.snag();
};

module.exports.getCurrentSong = async (bot) => {
    const roomInfo = await bot.Room.getInfo(bot);
    return roomInfo.room.metadata.current_song._id;
}

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));