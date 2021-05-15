const Room = require('./room');

module.exports.isMod = async (bot, userId) => {
    const roomInfo = await Room.getInfo(bot);
    let moderatorList = roomInfo.room.metadata.moderator_id;
    return moderatorList.includes(userId);
}