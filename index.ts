import express, { Request, Response } from "express";
import { MongoClient } from 'mongodb';

const appStatic = express();
appStatic.get(/^\/(?:1|2|3)\.html$/, function(request: Request, response: Response) {
    response.sendFile(__dirname + "/index.html");
});

appStatic.listen(50000, () => console.log("Static listen on port 50000"));

const app = express();

MongoClient.connect("mongodb://127.0.0.1:27017/").then((client) => {
    app.locals.collection = client.db("mongodb").collection("tracks");
});

app.use(express.json());

const allowCrossDomain = (request: Request, response: Response, next: () => void) => {
    response.header('Access-Control-Allow-Origin', "*");
    response.header('Access-Control-Allow-Headers', "*");
    next();
}

app.use(allowCrossDomain);

app.get("/tracker", (request: Request, response: Response) => {
    response.sendFile(__dirname + "/tracker.js");
});

function validateData(data: any): boolean {
    const requiredFields = [
        { field: "event", type: "string" },
        { field: "tags", type: "array" },
        { field: "url", type: "string" },
        { field: "title", type: "string" },
        { field: "ts", type: "number" }
    ];

    for (const { field, type } of requiredFields) {
        if (!data.hasOwnProperty(field)) return false;

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

app.post("/tracker", (request: Request, response: Response) => {
    const body = request.body as any[];
    if (!Array.isArray(body) || !body.every(validateData)) return response.status(422).end();
    response.status(200).end();
    app.locals.collection?.insertMany(body);
});

app.listen(8888, () => console.log("App listen on port 8888"));