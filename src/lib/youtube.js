const request = require('request');

module.exports.getVideoURL = (searchCriteria) => {
    return new Promise( (resolve, reject) => {
        let youtubeURL = `https://www.googleapis.com/youtube/v3/search?q=${searchCriteria}&key=${process.env.YOUTUBE_API_KEY}`
    
        request(youtubeURL, {json: true}, (error, res, body) => {
            if (error) {
                reject(`Something went wrong. Try again later.`);
                return;
            }

            if (!body.hasOwnProperty('items')) {
                reject(`Search found no match.`);
                return;
            }

            if (!Array.isArray(body.items) || !body.items.length) {
                reject(`Search found no match.`);
                return;
            }
        
            let videoId = body.items[0].id.videoId;

            if (!videoId) {
                reject(`Search found no match.`);
                return;
            }

            resolve(`https://www.youtube.com/watch?v=${videoId}`);
        });
    });
}