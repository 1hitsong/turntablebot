const request = require('request');

module.exports.getAccessToken = () => {
    return new Promise(resolve => {
        let buff = new Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`);
        let base64String = buff.toString("base64");
    
        request.post(`https://accounts.spotify.com/api/token`,
            {          
                body: "grant_type=client_credentials",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${base64String}`
                },
            }, (error, res, body) => {
                let response = JSON.parse(body);
                resolve(response.access_token);
        });
    });
}

module.exports.search = async (scope, searchQuery) => {
    const spotifyAccessToken = await this.getAccessToken();
    let spotifyGetBandIDURL = `https://api.spotify.com/v1/search?q=${searchQuery}&type=${scope}&limit=1`

    return new Promise( (resolve, reject) => {
        request(spotifyGetBandIDURL,
            {
                json: true,
                headers: {
                    'Authorization': `Bearer ${spotifyAccessToken}`
                },
            }, (error, res, body) => {
                if (scope.toLowerCase() === `artist`) {

                    if (!body.hasOwnProperty('artists')) {
                        reject(`Artist Not Found.`);
                        return;
                    }
                
                    if (!body.artists.hasOwnProperty('items')) {
                        reject(`Artist Not Found.`);
                        return;
                    }
                
                    if (!Array.isArray(body.artists.items) || !body.artists.items.length) {
                        reject(`Artist Not Found.`);
                        return;
                    }
                }
                else if(scope.toLowerCase() === `artist,track`) {
                    if (!body.hasOwnProperty('tracks')) {
                        reject(`Song Not Found.`);
                        return;
                    }
                
                    if (!body.tracks.hasOwnProperty('items')) {
                        reject(`Song Not Found.`);
                        return;
                    }
                
                    if (!Array.isArray(body.tracks.items) || !body.tracks.items.length) {
                        reject(`Song Not Found.`);
                        return;
                    }
                }

                resolve(body);
            });
    });
}

module.exports.getRelatedArtists = async (artistID) => {
    const spotifyAccessToken = await this.getAccessToken();
    let spotifyGetRelatedArtistsURL = `https://api.spotify.com/v1/artists/${artistID}/related-artists`

    return new Promise((resolve, reject) => {
        request(spotifyGetRelatedArtistsURL,
            {
                json: true,
                headers: {
                    'Authorization': `Bearer ${spotifyAccessToken}`
                },
            }, (error, res, body) => {

                if (!Array.isArray(body.artists) || !body.artists.length) {
                    reject(`No Related Artists Found.`);
                    return;
                }

                resolve(body.artists);
        });
    });
}

module.exports.getArtistID = async (spotifyArtistData) => {
    return new Promise((resolve, reject) => {
        let artistID = spotifyArtistData.artists.items[0].id;

        if (!artistID) {
            reject(`Artist Not Found.`);
            return;
        }

        resolve(artistID);
    });
}

module.exports.getArtistLink = async (spotifyArtistData) => {
    return new Promise((resolve, reject) => {
        let artistLink = spotifyArtistData.artists.items[0].external_urls.spotify;

        if (!artistLink) {
            reject(`Artist Link Not Found.`);
            return;
        }

        resolve(artistLink);
    });
}

module.exports.getSongLink = async (spotifySongData) => {
    return new Promise((resolve, reject) => {
        let songLink = spotifySongData.tracks.items[0].external_urls.spotify;

        if (!songLink) {
            reject(`Song Link Not Found.`);
            return;
        }

        resolve(songLink);
    });
}

module.exports.getSongReleaseDate = async (spotifySongData) => {
    return new Promise((resolve, reject) => {
        let songReleaseDate = spotifySongData.tracks.items[0].album.release_date;

        if (!songReleaseDate) {
            reject(`Release Date Not Found.`);
            return;
        }

        resolve(songReleaseDate);
    });
}