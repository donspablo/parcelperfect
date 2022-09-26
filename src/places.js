const {callAsync} = require("./api");

const getPlacesByPostcodeAsync = async (postcode, token) => {
    const params = {
        postcode: postcode,
    };

    const response = await callAsync("Quote", "getPlacesByPostcode", params, token);

    return response;
};

const getPlacesByNameAsync = async (name, token) => {
    const params = {
        name: name,
    };

    const response = await callAsync("Quote", "getPlacesByName", params, token);

    return response;
};

module.exports = {getPlacesByPostcodeAsync, getPlacesByNameAsync};