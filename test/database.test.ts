import { User } from "../api/src/entity/User";
import "./database-setup";

import argon2 from "argon2";
import { expect } from 'chai';

describe("Database Test", () => {
    it("should create a user ", async () => {
        let user = await User.findOneBy({username: "test"})
        if (user) {
            await user.remove();
        };
        await User.create({
            username: "test",
            hsPassword: await argon2.hash("testpassword")
        }).save()
    });

    it("should remove a user", async () => {
        let user = await User.findOneBy({username: "test"});
        await user.remove();
        let test_user = await User.findOneBy({username: "test"});
        expect(test_user).to.be.null
    });

    it("should matched hashed password", async () => {
        let hash = await argon2.hash("testpassword")
        expect(await argon2.verify(hash, "testpassword")).to.be.true;
    });
});

