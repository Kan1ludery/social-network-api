const isValidLink = (activeIcon, inputValue) => {
    if (activeIcon === 'telegram') {
        const regex = /^https:\/\/t\.me\/[a-zA-Z0-9_]+$/;
        return regex.test(inputValue);
    }
    const regexString = `^https?://(www\\.)?${activeIcon}\\.com/[a-zA-Z0-9._-]+/?$`;
    const regex = new RegExp(regexString, 'i');
    return regex.test(inputValue);
};

module.exports = isValidLink;
