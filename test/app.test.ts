import { expect } from "chai";
import app from "../app";
import request from "supertest";

describe("Express App Tests", () => {
    it("should respond with status 200 on GET /~testAPI", async () => {
        const response = await request(app).get("/~testAPI");
        expect(response.status).to.equal(200);
    });

    it("should respond with JSON data on GET /~testAPI", async () => {
        const response = await request(app).get("/~testAPI");
        expect(response.type).to.equal("application/json");
    });

    it("should respond with status 404 on non-existent route", async () => {
        const response = await request(app).get("/non-existent-route");
        expect(response.status).to.equal(404);
    });
});