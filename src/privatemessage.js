const Vote = require('./vote');

module.exports.pmReceived = async (bot, data) => {

    if (data.text.match(/^\/commands/)) {
        this.send(bot,
        `
        [ /ban * ]
        [ /lyrics artist - song title ]
        [ /what genre is * ]
        [ /wiki * ]
        [ /yt * ]
        `, data.senderid);
    }

    if (data.text.match(/^\/bop/)) {
        Vote(bot, `up`);
    }
};

module.exports.send = async (bot, message, touser) => {
    bot.pm(message, touser);
};