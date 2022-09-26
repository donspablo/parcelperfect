const axios = require("axios").default;
const { fetchConfig } = require("./config");
/**
 * Makes API request to ParcelPerfect's REST API. Authentication variables need to be set in .env file.
 * @param {*} className 
 * @param {*} method 
 * @param {*} params 
 * @param {*} token 
 */
const callAsync = async (className, method, params, token = null) => {
    const url = fetchConfig().url;
    const jsonParams = JSON.stringify(params);
    let serviceCall = `${url}?params=${encodeURIComponent(jsonParams)}&method=${method}&class=${className}`;
    if (token) serviceCall += `&token_id=${token}`;
    const response = await axios({
        method: "GET",
        url: serviceCall
    });
    return response.data;
};

module.exports = { callAsync };