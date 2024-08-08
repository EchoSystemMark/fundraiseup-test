"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const appStatic = (0, express_1.default)();
appStatic.get(/^\/(?:1|2|3)\.html$/, function (request, response) {
    response.sendFile(__dirname + "/index.html");
});
appStatic.listen(50000, () => console.log("Static listen on port 50000"));
const app = (0, express_1.default)();
mongodb_1.MongoClient.connect("mongodb://127.0.0.1:27017/").then((client) => {
    app.locals.collection = client.db("mongodb").collection("tracks");
});
app.use(express_1.default.json());
const allowCrossDomain = (request, response, next) => {
    response.header('Access-Control-Allow-Origin', "*");
    response.header('Access-Control-Allow-Headers', "*");
    next();
};
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
    for (const { field, type } of requiredFields) {
        if (!data.hasOwnProperty(field))
            return false;
        switch (type) {
            case "string":
                if (typeof data[field] !== "string")
                    return false;
                break;
            case "array":
                if (!Array.isArray(data[field]))
                    return false;
                break;
            case "number":
                if (typeof data[field] !== "number")
                    return false;
                break;
            default:
                return false;
        }
    }
    return true;
}
app.post("/tracker", (request, response) => {
    var _a;
    const body = request.body;
    if (!Array.isArray(body) || !body.every(validateData))
        return response.status(422).end();
    response.status(200).end();
    (_a = app.locals.collection) === null || _a === void 0 ? void 0 : _a.insertMany(body);
});
app.listen(8888, () => console.log("App listen on port 8888"));
