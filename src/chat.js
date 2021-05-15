const request = require('request');
const PrivateMessage = require('./privatemessage');
const ContentFilters = require('./contentfilters');

module.exports.onNew = async (bot, data) => {

    // Bite Me
    if (data.text.match(/^\/biteme/)) {
        this.say(bot, `Screw You ${data.name}!`);
    }

    // Lyrics Search
    if (data.text.match(/^\/lyrics (.+)/)) {
        pmUserLyrics(bot, data);
    }

    // Generate new genres
    if (data.text.match(/^\/what genre is (.+)/)) {
        postNewGenre(bot, data);
    }

    // YouTube Search
    if (data.text.match(/^\/yt (.+)/)) {
        postYoutubeLink(bot, data);
    }

    // Wiki Search
    if (data.text.match(/^\/wiki (.+)/)) {
        postWikipediaLink(bot, data);
    }
};

module.exports.say = async (bot, message) => {
    bot.speak(message);
}

const pmUserLyrics = async (bot, data) => {
    let searchCriteria = data.text.match(/^\/lyrics (.+)/)[1];
    let songData = searchCriteria.split(` - `);
    let URL = `https://api.lyrics.ovh/v1/${songData[0]}/${songData[1]}`
    
    request(URL, {json: true}, (error, res, body) => {
        if (!body.hasOwnProperty(`lyrics`)) {
            PrivateMessage.send(bot, `I couldn't find lyrics for ${searchCriteria}.`, data.userid);
            return;
        }

        PrivateMessage.send(bot, body.lyrics, data.userid);
    });
}

const postNewGenre = async (bot, data) => {
    let searchCriteria = data.text.match(/^\/what genre is (.+)/)[1];
    let URL = `https://binaryjazz.us/wp-json/genrenator/v1/genre/`
    
    request(URL, {json: true}, (error, res, body) => {
        this.say(bot, `${searchCriteria} is ${body}.`);
    });
}

const postYoutubeLink = async (bot, data) => {
    let searchCriteria = encodeURIComponent(data.text.match(/^\/yt (.+)/)[1]);

    if (ContentFilters.containsBannedWords(data.text.match(/^\/yt (.+)/)[1])) {
        this.say(bot, `Grow up.`);
        return;
    }

    let youtubeURL = `https://www.googleapis.com/youtube/v3/search?q=${searchCriteria}&key=${process.env.YOUTUBE_API_KEY}`
    
    request(youtubeURL, {json: true}, (error, res, body) => {
        let videoId = body.items[0].id.videoId;
        this.say(bot, `https://www.youtube.com/watch?v=${videoId}`);
    });
}

const postWikipediaLink = async (bot, data) => {
    if (ContentFilters.containsBannedWords(data.text.match(/^\/wiki (.+)/)[1])) {
        this.say(bot, `Grow up.`);
        return;
    }

    let searchCriteria = encodeURIComponent(data.text.match(/^\/wiki (.+)/)[1]);
    let wikiURL = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchCriteria}&format=json`
    
    request(wikiURL, {json: true}, (error, res, body) => {
        if (!body.query.search[0]) {
            return;
        }

        let PageID = encodeURIComponent(body.query.search[0].title);
        this.say(bot, `http://en.wikipedia.org/wiki/${PageID}`);
    });
}