const Spotify = require('./lib/spotify');
const Wikipedia = require('./lib/wikipedia');
const Youtube = require('./lib/youtube');
const Lyrics = require('./lib/lyrics');

module.exports.onNewMessage = async (bot, data) => {

    // Bite Me
    if (data.text.match(/^\/biteme/)) {
        this.say(bot, `Screw You ${data.name}!`);
    }

    // Lyrics Search
    if (data.text.match(/^\/lyrics (.+)/)) {
        pmUserLyrics(bot, data);
    }

    if (data.text.match(/^\/released/)) {
        postSpotifyReleaseDate(bot);
    }

    // Generate new genres
    if (data.text.match(/^\/otherbands/)) {
        postSimilarBands(bot);
    }

    // Generate new genres
    if (data.text.match(/^\/spotify-artist/)) {
        postSpotifyArtistLink(bot);
    }

    // Generate new genres
    if (data.text.match(/^\/spotify-song/)) {
        postSpotifySongLink(bot);
    }
    
    // YouTube Search
    if (data.text.match(/^\/yt (.+)/)) {
        postYoutubeLink(bot, data);
    }

    // Wiki Search
    if (data.text.match(/^\/wiki (.+)/)) {
        postWikipediaLink(bot, data);
    }

    // Add to DJ Queue
    if (data.text.match(/^\/1addme/)) {
        addUserToQueue(bot, data);
    }

    // Remove from DJ Queue
    if (data.text.match(/^\/1removeme/)) {
        removeUserToQueue(bot, data);
    }
};

module.exports.say = async (bot, message) => {
    bot.API.speak(message);
}

const addUserToQueue = async (bot, data) => {
    try {
        let addDJ = await bot.DJQueue.add(bot, data);
        this.say(bot, addDJ);
    }
    catch (err) {
        this.say(bot, err);
        return;
    }
}

const removeUserToQueue = async (bot, data) => {
    try {
        let removeDJ = await bot.DJQueue.remove(data);
        this.say(bot, removeDJ);
    }
    catch (err) {
        this.say(bot, err);
        return;
    }
}

const pmUserLyrics = async (bot, data) => {
    let searchCriteria = data.text.match(/^\/lyrics (.+)/)[1];
    try {
        let lyrics = await Lyrics.getLyrics(searchCriteria);
        bot.PrivateMessage.send(bot, lyrics, data.userid);
    }
    catch (err) {
        bot.PrivateMessage.send(bot, err, data.userid);
        return;
    }
}

const postYoutubeLink = async (bot, data) => {
    let searchTerm = data.text.match(/^\/yt (.+)/)[1];
    let searchCriteria = encodeURIComponent(searchTerm);

    if (bot.ContentFilters.containsBannedWords(searchTerm)) {
        this.say(bot, `Grow up.`);
        return;
    }
    try {
        let youtubeURL = await Youtube.getVideoURL(searchCriteria);
        this.say(bot, youtubeURL);
    }
    catch (err) {
        this.say(bot, err);
        return;
    }
}

const postSimilarBands = async (bot) => {
    try {
        const spotifyAccessToken = await Spotify.getAccessToken();
        let currentArtist = await bot.Room.getCurrentMetaArtist(bot);
        let searchCriteria = encodeURIComponent(currentArtist);
        let spotifyArtistData = await Spotify.search(`artist`, searchCriteria);
        let spotifyArtistID = await Spotify.getArtistID(spotifyArtistData);
        let relatedArtists = await Spotify.getRelatedArtists(spotifyArtistID);
        
        let bandList = ``;
    
        relatedArtists.slice(0, 5).forEach(band => bandList += band.name + ',  ');
        bandList = bandList.slice(0, -3); 

        this.say(bot, `Similar bands to ${currentArtist} include ${bandList}`);
    }
    catch (err) {
        this.say(bot, err);
        return;
    }
}

const postSpotifyArtistLink = async (bot) => {
    try {
        const spotifyAccessToken = await Spotify.getAccessToken();
        let currentArtist = await bot.Room.getCurrentMetaArtist(bot);
        let searchCriteria = encodeURIComponent(`artist:${currentArtist}`);
        let spotifyArtistData = await Spotify.search(`artist`, searchCriteria);
        let spotifyLink = await Spotify.getArtistLink(spotifyArtistData);
        this.say(bot, spotifyLink);
    }
    catch (err) {
        this.say(bot, err);
        return;
    }
}

const postSpotifySongLink = async (bot) => {
    try {
        const spotifyAccessToken = await Spotify.getAccessToken();
        let currentSong = await bot.Room.getCurrentSong(bot);

        const currentMetaArtist = currentSong.metadata.artist;
        const currentMetaSong = currentSong.metadata.song;
        let searchCriteria = encodeURIComponent(`artist:${currentMetaArtist} track: ${currentMetaSong}`);
        let spotifySongData = await Spotify.search(`artist,track`, searchCriteria);

        let spotifyLink = await Spotify.getSongLink(spotifySongData);
        this.say(bot, spotifyLink);
    }
    catch (err) {
        this.say(bot, err);
        return;
    }
}

const postSpotifyReleaseDate = async (bot) => {
    try {
        const spotifyAccessToken = await Spotify.getAccessToken();
        let currentSong = await bot.Room.getCurrentSong(bot);

        const currentMetaArtist = currentSong.metadata.artist;
        const currentMetaSong = currentSong.metadata.song;
        let searchCriteria =encodeURIComponent(`artist:${currentMetaArtist} track: ${currentMetaSong}`);
        let spotifySongData = await Spotify.search(`artist,track`, searchCriteria);

        let spotifyReleaseDate = await Spotify.getSongReleaseDate(spotifySongData);
        this.say(bot, `This album was released on/in ${spotifyReleaseDate}`);
    }
    catch (err) {
        this.say(bot, err);
        return;
    }
}

const postWikipediaLink = async (bot, data) => {
    let searchTerm = data.text.match(/^\/wiki (.+)/)[1];

    if (bot.ContentFilters.containsBannedWords(searchTerm)) {
        this.say(bot, `Grow up.`);
        return;
    }

    let searchCriteria = encodeURIComponent(searchTerm);

    try {
        let wikipediaURL = await Wikipedia.getPageURL(searchCriteria);
        this.say(bot, wikipediaURL);
    }
    catch (err) {
        this.say(bot, err);
        return;
    }
}