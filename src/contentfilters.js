module.exports.containsBannedWords = (search) => {
    let bannedWords = [`porn`, `pornography`, `porno`, `p0rn`, `pron`, `p0rno`, `p0rn0`, `aabbccdd`];

    const searchWords = search.toLowerCase().split(` `);
    return !searchWords.every(word => !bannedWords.includes(word));
}