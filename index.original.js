const express = require("express");
const { MongoClient } = require('mongodb');

const static = express();
static.get(/^\/(?:1|2|3)\.html$/, function(request, response) {
    response.sendFile(__dirname + "/index.html");
});

static.listen(50000, () => console.log("Static listen on port 50000"));

const app = express();

new MongoClient("mongodb://127.0.0.1:27017/").connect().then((client) => {
    app.locals.collection = client.db("mongodb").collection("tracks");
});

app.use(express.json());

const allowCrossDomain = function(request, response, next) {
    response.header('Access-Control-Allow-Origin', "*");
    response.header('Access-Control-Allow-Headers', "*");
    next();
}

app.use(allowCrossDomain);

app.get("/tracker", (request, response) => {
    response.sendFile(__dirname + "/tracker.js");
});

function validateData(data) {
    const requiredFields = [
        { field: "event", type: "string" },
        { field: "tags", type: "array" },
        { field: "url", type: "string" },
        { field: "title", type: "string" },
        { field: "ts", type: "number" }
    ];

    // Проверяем наличие всех обязательных полей в данных
    for (const { field, type } of requiredFields) {
        if (!data.hasOwnProperty(field)) return false;

        // Проверяем тип данных
        switch (type) {
            case "string":
                if (typeof data[field] !== "string") return false;
                break;
            case "array":
                if (!Array.isArray(data[field])) return false;
                break;
            case "number":
                if (typeof data[field] !== "number") return false;
                break;
            default:
                return false;
        }
    }

    return true;
}

app.post("/tracker", (request, response) => {
    if (!Array.isArray(request.body) || !request.body.every(validateData)) return response.status(422).end();
    response.status(200).end();
    app.locals.collection.insertMany(request.body);
});

app.listen(8888, () => console.log("App listen on port 8888"));