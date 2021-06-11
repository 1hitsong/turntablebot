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

module.exports.search = async (searchQuery) => {
    const spotifyAccessToken = await this.getAccessToken();
    let spotifyGetBandIDURL = `https://api.spotify.com/v1/search?q=${searchQuery}&type=artist,track&limit=1`

    return new Promise(resolve => {
        request(spotifyGetBandIDURL,
            {
                json: true,
                headers: {
                    'Authorization': `Bearer ${spotifyAccessToken}`
                },
            }, (error, res, body) => {
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
                    reject();
                    return;
                }

                resolve(body.artists);
        });
    });
}