const express = require("express");
const cors = require("cors");

const { authenticateAsync } = require("./src/authentication");
const { getPlacesByPostcodeAsync } = require("./src/places");
const { requestQuote, updateService, quoteToCollection } = require("./src/quotes");
const { loadConfig } = require("./src/config");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

loadConfig(process.env.parcelperfect_url);
const username = process.env.parcelperfect_username;
const password = process.env.parcelperfect_password;

/**
 * 
 * @param {*} postcode 
 * @param {*} city 
 * @param {*} token 
 * @returns { message: string, places: array, postcode: string, city: string }
 */
const determinePlaceAsync = async (postcode, city, token) => {
    const result = await getPlacesByPostcodeAsync(postcode, token);

    if (!result.errorcode) {
        const places = result.results;
        const filteredPlaces = places.filter(x => x.town.toLowerCase().includes(city.toLowerCase()));

        if (filteredPlaces.length > 0) {
            return filteredPlaces[0];
        }
        else {
            return { message: "No place has been found", places: places, postcode: postcode, city: city };
        }
    } else {
        throw Error;
    }
};

app.get("/", (request, response) => {
    console.info("INFO", "📦👋 Welcome to ParcelPerfect REST Library!");
    response.send("📦👋 Welcome to ParcelPerfect REST Library!");
});

app.get("/places/:postcode", async (request, response) => {
    console.info("INFO", "🏡 Places Request");
    try {
        const postcode = request.params.postcode;

        const token = await authenticateAsync(username, password);
        const places = await getPlacesByPostcodeAsync(postcode, token);

        response.json(places);
    } catch (error) {
        console.error(error);
        response.send("An error has occurred. Please check logs.");
    }
});

app.get("/places/:postcode/:city", async (request, response) => {
    console.info("INFO", "🏡 Place Request");
    try {
        const postcode = request.params.postcode;
        const city = request.params.city;

        const token = await authenticateAsync(username, password);
        const place = await determinePlaceAsync(postcode, city, token);

        if (!place.message) {
            response.status(200).json(place);
        } else {
            response.status(404).json(place);
        }
    } catch (error) {
        console.error(error);
        response.send("An error has occurred. Please check logs.");
    }
});

app.post("/quote", async (request, response) => {
    const order = request.body;

    const token = await authenticateAsync(username, password);

    const postcode = order.billing.postcode;
    const city = order.billing.city;
    const origin = await determinePlaceAsync(4001, "MORNINGSIDE, Durban", token);
    const destination = await determinePlaceAsync(postcode, city, token);

    if (!destination.message || !origin.message) {
        const quote = {
            quoteno: "",
            waybill: "",
            details: {
                specinstruction: "Test",
                reference: "Test",
                origperadd1: "102 Lilian Ngoyi Road",
                origplace: origin.place,
                origtown: origin.town,
                origpers: "MINT MARKETING T/A MUSE BEAUTY",
                origpercontact: "TASNEEM",
                origperpcode: origin.pcode,

                /* LOGICAL SPLIT */
                destperadd1: order.billing.address_1,
                destperphone: order.billing.phone,
                destpercell: order.billing.phone,
                destplace: destination.place,
                desttown: destination.town,
                destpers: order.billing.first_name + order.billing.last_name,
                destpercontact: order.billing.first_name,
                destperpcode: destination.pcode,
            },
            contents: [
                {
                    item: 1,
                    desc: "Test",
                    pieces: 1,
                    dim1: 1,
                    dim2: 1,
                    dim3: 1,
                    actmass: 1,
                },
            ],
        };

        const quoteResponse = await requestQuote(quote, token);
        if (!quoteResponse.errorcode) {
            response.json(quoteResponse.results[0]);
        } else {
            throw response.json(quoteResponse);
        }
    } else {
        response.status(404).json(destination, origin);
    }
});

app.put("/service/:quoteno", async (request, response) => {
    try {
        const quoteno = request.params.quoteno;
        const service = request.body.service
        const token = await authenticateAsync(username, password);
        const result = await updateService(quoteno, service, token);
        if (!result.errorcode) {
            response.json(result.results[0]);
        } else {
            response.status(400).json(result);
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Unkown error occurred. Please check the logs.");
    }
});

app.put("/collection/:quoteno", async (request, response) => {
    try {
        const quoteno = request.params.quoteno;
        const token = await authenticateAsync(username, password);
        const result = await quoteToCollection(quoteno, token);
        if (!result.errorcode) {
            response.json(result.results[0]);
        } else {
            response.status(400).json(result);
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Unkown error occurred. Please check the logs.");
    }
});

app.listen(3000, console.info("🔥 Listening on http://localhost:3000"));