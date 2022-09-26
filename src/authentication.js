const md5 = require('md5');
const { callAsync } = require('./api');

const authenticateAsync = async (username, password) => {
    const saltParams = {
        email: username
    }
    const getSaltResponse = await callAsync("Auth", "getSalt", saltParams);
    console.info("SALT RESPONSE", getSaltResponse);

    const salt = getSaltResponse.results[0].salt;
    const md5Password = md5(`${password}${salt}`);
    const tokenParams = {
        email: username,
        password: md5Password
    }
    const getSecureTokenResponse = await callAsync("Auth", "getSecureToken", tokenParams);
    console.info("SECURE TOKEN RESPONSE", getSecureTokenResponse);

    if (!getSecureTokenResponse.errorcode) {
        return getSecureTokenResponse.results[0].token_id;
    } else {
        console.error(getSecureTokenResponse);
        throw Error;
    }
};

module.exports = { authenticateAsync };