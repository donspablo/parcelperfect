let config;

function Config(url) {
    this.url = url;
}

const loadConfig = (url) => {
    config = new Config(url);
}

const fetchConfig = () => {
    return config;
}

module.exports = {loadConfig, fetchConfig};