module.exports.getInfo = (bot) => {
    return new Promise(resolve => {
        bot.roomInfo( (data) => {
            resolve(data);
        });
    });
}