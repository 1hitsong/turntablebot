module.exports.onNewPM = async (bot, data) => {

    if (data.text.match(/^\/commands/)) {
        this.send(bot,
        `
        [ /ban * ]
        [ /lyrics artist - song title ]
        [ /otherbands ]
        [ /released ]
        [ /spotify-artist ]
        [ /spotify-song ]
        [ /what genre is * ]
        [ /wiki * ]
        [ /yt * ]
        `, data.senderid);
    }

    if (data.text.match(/^\/bop/)) {
        bot.Vote(bot, `up`);
    }

    if (data.text.match(/^\/snag/)) {
        if (data.senderid === '60986c3e47c69b001ad5c5f5') {
            bot.Song.snag(bot);
        }
    }

    if (data.text.match(/^\/djstart/)) {
        if (data.senderid === '60986c3e47c69b001ad5c5f5') {
            bot.API.addDj();
        }
    }

    if (data.text.match(/^\/djstop/)) {
        if (data.senderid === '60986c3e47c69b001ad5c5f5') {
            bot.API.remDj();
        }
    }
};

module.exports.send = async (bot, message, touser) => {
    bot.API.pm(message, touser);
};