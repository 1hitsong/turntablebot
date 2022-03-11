module.exports.isMod = async (bot, userId) => {
    const roomInfo = await bot.Room.getInfo(bot);
    let moderatorList = roomInfo.room.metadata.moderator_id;
    return moderatorList.includes(userId);
}