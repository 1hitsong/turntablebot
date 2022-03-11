const request = require('request');

module.exports.getLyrics = (searchCriteria) => {
    return new Promise( (resolve, reject) => {
        let songData = searchCriteria.split(` - `);
        let URL = `https://api.lyrics.ovh/v1/${songData[0]}/${songData[1]}`
        
        request(URL, {json: true}, (error, res, body) => {
            if (!body.hasOwnProperty(`lyrics`)) {
                reject(`I couldn't find lyrics for ${searchCriteria}.`);
                return;
            }

            resolve(body.lyrics);
        });
    });
}