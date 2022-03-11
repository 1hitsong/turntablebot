const Storage = require('node-storage');

module.exports.add = async (bot, data) => {
    const store = new Storage('data');

    return new Promise(async (resolve, reject) => {
        let roomInfo = await bot.Room.getInfo(bot)

        // Check is user is already a DJ
        if (roomInfo.room.metadata.djs.includes(data.userid)) {
            reject(`You're already DJing.`);
            return;
        }

        // The DJ deck isn't full, so no need to queue
        if (!roomInfo.room.metadata.dj_full) {
            reject(`Just hop up right now, there's room.`);
            return;
        }

        let djQueue = store.get('djqueue') ? store.get('djqueue') : [];
        let user = {userid: data.userid, name: data.name}
        
        // Check is user is already in the queue
        if (djQueue.some(e => e.userid === user.userid)) {
            reject(`You're already in the queue`);
            return;
        }

        djQueue.push(user);
        store.put('djqueue', djQueue);

        resolve(`Added in position ${djQueue.length}`);
    });
}

module.exports.remove = async (user) => {
    const store = new Storage('data');

    return new Promise(async (resolve) => {
        let djQueue = store.get('djqueue') ? store.get('djqueue') : [];

        if (djQueue.length) {
            djQueue = djQueue.filter(e => e.userid !== user.userid);
            store.put('djqueue', djQueue);
    
            resolve(`${user.name} removed from queue`);
        }
        else {
            resolve();
        }
    });
}

module.exports.next = async () => {
    return new Promise(async (resolve) => {
        let nextDJ = await this.getNextDJ();

        if (nextDJ) {
            sleep(30000).then(async () => {
                let refreshNextDJ = await this.getNextDJ();
                if (refreshNextDJ.userid === nextDJ.userid) {
                    this.remove(nextDJ);
                    this.next();
                }
            });
    
            resolve(`@${nextDJ.name} You have 30 seconds to hop up to DJ.`);
        }
    });
}

module.exports.getNextDJ = async () => {
    const store = new Storage('data');

    return new Promise(async (resolve) => {
        let djQueue = store.get('djqueue') ? store.get('djqueue') : [];
        resolve(djQueue.length ? djQueue[0] : null);
    });
}

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));