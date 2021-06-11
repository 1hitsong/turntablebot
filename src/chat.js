const request = require('request');
const PrivateMessage = require('./privatemessage');
const ContentFilters = require('./contentfilters');
const Room = require('./room');
const Spotify = require('./spotify');

module.exports.onNewMessage = async (bot, data) => {

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

    if (data.text.match(/^\/released/)) {
        postReleaseDate(bot);
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

const postSimilarBands = async (bot) => {
    const spotifyAccessToken = await Spotify.getAccessToken();

    try {
        var currentSong = await Room.getCurrentSong(bot);
    }
    catch (err) {
        this.say(bot, err);
        return;
    }

    const currentArtist = currentSong.metadata.artist;
    let searchCriteria = encodeURIComponent(currentArtist);

    let artistID = await Spotify.search(searchCriteria);

    if (!artistID.hasOwnProperty('artists')) {
        this.say(bot, `Couldn't find anything for ${currentArtist}.`);
        return;
    }

    if (!artistID.artists.hasOwnProperty('items')) {
        this.say(bot, `Couldn't find anything for ${currentArtist}.`);
        return;
    }

    if (!Array.isArray(artistID.artists.items) || !artistID.artists.items.length) {
        this.say(bot, `Couldn't find anything for ${currentArtist}.`);
        return;
    }

    artistID = artistID.artists.items[0].id;

    if (!artistID) {
        this.say(bot, `Couldn't find anything for ${currentArtist}.`);
        return;
    }

    try {
        let relatedArtists = await Spotify.getRelatedArtists(artistID);
        
        let bandList = ``;
    
        relatedArtists.slice(0, 5).forEach(band => bandList += band.name + ',  ');
        bandList = bandList.slice(0, -3); 
        this.say(bot, `Similar bands to ${currentArtist} include ${bandList}`);
    }
    catch (err) {
        this.say(bot, `Couldn't find anything for ${currentArtist}.`);
        return;
    }



}

const postSpotifyArtistLink = async (bot) => {
    const spotifyAccessToken = await Spotify.getAccessToken();

    const roomInfo = await Room.getInfo(bot);
    if (!roomInfo.room.metadata.current_song) {
        this.say(bot, `Dude, nothing's playing.`);
        return;
    }

    const currentArtist = roomInfo.room.metadata.current_song.metadata.artist;
    let searchCriteria = encodeURIComponent(`artist:${currentArtist}`);

    let artistID = await Spotify.search(searchCriteria);

    if (!artistID.hasOwnProperty('artists')) {
        this.say(bot, `Couldn't find anything for ${currentArtist}.`);
        return;
    }

    if (!artistID.artists.hasOwnProperty('items')) {
        this.say(bot, `Couldn't find anything for ${currentArtist}.`);
        return;
    }

    if (!Array.isArray(artistID.artists.items) || !artistID.artists.items.length) {
        this.say(bot, `Couldn't find anything for ${currentArtist}.`);
        return;
    }

    let spotifyLink = artistID.artists.items[0].external_urls.spotify;
    this.say(bot, spotifyLink);
}

const postSpotifySongLink = async (bot) => {
    const spotifyAccessToken = await Spotify.getAccessToken();

    const roomInfo = await Room.getInfo(bot);
    if (!roomInfo.room.metadata.current_song) {
        this.say(bot, `Dude, nothing's playing.`);
        return;
    }

    const currentArtist = roomInfo.room.metadata.current_song.metadata.artist;
    const currentSong = roomInfo.room.metadata.current_song.metadata.song;
    let searchCriteria = encodeURIComponent(`artist:${currentArtist} track: ${currentSong}`);

    let searchResults = await Spotify.search(searchCriteria);

    if (!searchResults.hasOwnProperty('tracks')) {
        this.say(bot, `Couldn't find anything for ${currentArtist} - ${currentSong}.`);
        return;
    }

    if (!searchResults.tracks.hasOwnProperty('items')) {
        this.say(bot, `Couldn't find anything for ${currentArtist} - ${currentSong}.`);
        return;
    }

    if (!Array.isArray(searchResults.tracks.items) || !searchResults.tracks.items.length) {
        this.say(bot, `Couldn't find anything for ${currentArtist} - ${currentSong}.`);
        return;
    }

    let spotifyLink = searchResults.tracks.items[0].external_urls.spotify;
    this.say(bot, spotifyLink);
}

const postReleaseDate = async (bot) => {
    const spotifyAccessToken = await Spotify.getAccessToken();

    const roomInfo = await Room.getInfo(bot);
    if (!roomInfo.room.metadata.current_song) {
        this.say(bot, `Dude, nothing's playing.`);
        return;
    }

    const currentArtist = roomInfo.room.metadata.current_song.metadata.artist;
    const currentSong = roomInfo.room.metadata.current_song.metadata.song;
    let searchCriteria = encodeURIComponent(`artist:${currentArtist} track: ${currentSong}`);

    let searchResults = await Spotify.search(searchCriteria);

    if (!searchResults.hasOwnProperty('tracks')) {
        this.say(bot, `Couldn't find anything for ${currentArtist} - ${currentSong}.`);
        return;
    }

    if (!searchResults.tracks.hasOwnProperty('items')) {
        this.say(bot, `Couldn't find anything for ${currentArtist} - ${currentSong}.`);
        return;
    }

    if (!Array.isArray(searchResults.tracks.items) || !searchResults.tracks.items.length) {
        this.say(bot, `Couldn't find anything for ${currentArtist} - ${currentSong}.`);
        return;
    }

    if (!searchResults.tracks.items[0].album.release_date) {
        return;
    }

    this.say(bot, `This album was released on/in ${searchResults.tracks.items[0].album.release_date}`);
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