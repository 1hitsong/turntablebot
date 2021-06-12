const request = require('request');

module.exports.getPageURL = (searchCriteria) => {
    return new Promise( (resolve, reject) => {
        let wikiURL = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchCriteria}&format=json`
    
        request(wikiURL, {json: true}, (error, res, body) => {
            if (error) {
                reject(`Something went wrong. Try again later.`);
                return;
            }

            if (!body.query.search[0]) {
                reject(`Search found no match.`);
                return;
            }
        
            let PageID = encodeURIComponent(body.query.search[0].title);
            resolve(`http://en.wikipedia.org/wiki/${PageID}`);
        });
    });
}