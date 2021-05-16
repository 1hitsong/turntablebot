const Vote = require('./vote');

module.exports.onNewSong = async (bot, data) => {
    console.log(`New Song`);
    
    // Up vote every song
    sleep(5000).then(() => {
        console.log(`Bop`);
        Vote(bot, `up`);
    });
}

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));