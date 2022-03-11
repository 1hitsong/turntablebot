
const vote = async (bot, direction) => {
    bot.API.vote(direction);
};

module.exports = vote;