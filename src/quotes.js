const {callAsync} = require("./api")

const requestQuote = async (quote, token) => {
    const response = await callAsync("Quote", "requestQuote", quote, token);
    return response;
}

const updateService = async (quoteno, service, token) => {
    const params = {
        quoteno: quoteno,
        service: service
    }

    const response = await callAsync("Quote", "updateService", params, token);
    return response;
}

const quoteToCollection = async (quoteno, token) => {
    const params = {
        quoteno: quoteno
    }

    const response = await callAsync("Collection", "quoteToCollection", params, token);
    return response;
}

module.exports = {requestQuote, updateService, quoteToCollection};