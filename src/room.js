module.exports.getInfo = (bot) => {
    return new Promise((resolve) => {
        bot.roomInfo(true, (data) => {
            resolve(data);
        });
    });
}

module.exports.getCurrentSong = (bot) => {
    return new Promise((resolve, reject) => {
        bot.roomInfo(true, (data) => {

            if (!data.room.metadata.current_song) {
                reject(`Dude, nothing's playing.`);
                return;
            }

            resolve(data.room.metadata.current_song);
        });
    });
}

module.exports.getCurrentMetaArtist = (bot) => {
    return new Promise((resolve, reject) => {
        bot.roomInfo(true, (data) => {

            if (!data.room.metadata.current_song) {
                reject(`Dude, nothing's playing.`);
                return;
            }

            resolve(data.room.metadata.current_song.metadata.artist);
        });
    });
}

module.exports.getCurrentMetaSong = (bot) => {
    return new Promise((resolve, reject) => {
        bot.roomInfo(true, (data) => {

            if (!data.room.metadata.current_song) {
                reject(`Dude, nothing's playing.`);
                return;
            }

            resolve(data.room.metadata.current_song.metadata.song);
        });
    });
}