import request from 'supertest';
import { expect } from 'chai';
import argon2 from 'argon2';
import express from 'express';
const cookieParser = require("cookie-parser");

import { User } from '../api/src/entity/User'; 
import "./database-setup";
import { ProfileRouter } from '../api/routes/profile';
import { jwtCreateAccessToken, jwtCreateRefreshToken } from '../api/jwtokens';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', ProfileRouter);

describe('Profile Routes', () => {
  let user: User;
  let accessToken: string;
  let refreshToken: string;

  before(async () => {
    user = await User.create({
      username: 'test',
      hsPassword: await argon2.hash('testpassword'),
    }).save();
    accessToken = jwtCreateAccessToken(user);
    refreshToken = jwtCreateRefreshToken(user)
  });


  describe('POST /api/change-password', () => {
    it('should return success message if password change is successful', async () => {
      const newPassword = 'newtestpassword';
      const response = await request(app)
        .post('/api/change-password')
        .set('Cookie', [`accessToken=${accessToken}`, `jid=${refreshToken}`])
        .send({
          oldPassword: 'testpassword',
          newPassword: newPassword,
        });

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Success');

      user = await User.findOneBy({ username: "test" });
      const passwordMatches = await argon2.verify(user.hsPassword, newPassword);
      expect(passwordMatches).to.be.true;
    });

    it('should return 404 if user is not found', async () => {
      let temp_id = user.id;
      user.id = "47909368-4105-11ee-be56-0242ac120002";
      // create tokens with invalid id
      let oldaccessToken = jwtCreateAccessToken(user);
      let oldrefreshToken = jwtCreateRefreshToken(user);
      // recover id
      user.id = temp_id;

      const response = await request(app)
        .post('/api/change-password')
        .set('Cookie', [`accessToken=${oldaccessToken}`, `jid=${oldrefreshToken}`])
        .send({
          oldPassword: 'newtestpassword',
          newPassword: 'testpassword',
        });

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("User not found!");

    });

    it('should return 403 if old password is incorrect', async () => {
      const response = await request(app)
        .post('/api/change-password')
        .set('Cookie', [`accessToken=${accessToken}`, `jid=${refreshToken}`])
        .send({
          oldPassword: 'wrongpassword',
          newPassword: 'newpassword',
        });

      expect(response.status).to.equal(403);
      expect(response.body.message).to.equal("Password does not match original!");
    });

/*     it('should return 500 on internal error', async () => {
      // Simulate an internal error scenario
      const originalHash = argon2.hash;
      argon2.hash = async () => {
        throw new Error('Internal Error');
      };

      const response = await request(app)
        .post('/api/change-password')
        .set('Cookie', [`accessToken=${accessToken}`, `jid=${refreshToken}`])
        .send({
          oldPassword: 'testpassword',
          newPassword: 'newpassword',
        });

      expect(response.status).to.equal(500);
      expect(response.body.message).to.equal("Internal error!");

      // Restore the original argon2.hash function
      argon2.hash = originalHash;
    }); */

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .post('/api/change-password')
        .send({
          oldPassword: 'testpassword',
          newPassword: 'newpassword',
        });

      expect(response.status).to.equal(401);
      expect(response.body.message).to.equal("You are not logged in!");
    });

    it('should return 403 if new password is missing', async () => {
        const response = await request(app)
          .post('/api/change-password')
          .set('Cookie', [`accessToken=${accessToken}`, `jid=${refreshToken}`])
          .send({
            oldPassword: 'testpassword',
          });
  
        expect(response.status).to.equal(403);
        expect(response.body.message).to.equal("Missing new password or old password!");
      });
  
      it('should return 200 if user has no password set initially', async () => {
        user.hsPassword = "temp"; // hardcoded value
        await user.save();
  
        const response = await request(app)
          .post('/api/change-password')
          .set('Cookie', [`accessToken=${accessToken}`, `jid=${refreshToken}`])
          .send({
            oldPassword: 'testpassword',
            newPassword: 'newpassword',
          });
  
        expect(response.status).to.equal(200);
        expect(response.body.message).to.equal("Success");
      });
  });


  describe('POST /api/change-username', () => {
    it('should return 422 if username is invalid', async () => {
      const response = await request(app)
        .post('/api/change-username')
        .set('Cookie', [`accessToken=${accessToken}`, `jid=${refreshToken}`])
        .send({
          username: 'i',
        });

      expect(response.status).to.equal(422);
    });

    it('should return 403 if username already exists', async () => {
      // Create another user with the conflicting username
      const conflictingUser = await User.create({
        username: 'conflictinguser',
      }).save();

      const response = await request(app)
        .post('/api/change-username')
        .set('Cookie', [`accessToken=${accessToken}`, `jid=${refreshToken}`])
        .send({
          username: conflictingUser.username,
        });

      expect(response.status).to.equal(403);

      // Clean up: Delete the conflicting user
      await conflictingUser.remove();
    });

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .post('/api/change-username')
  
      expect(response.status).to.equal(401);
      expect(response.body.message).to.equal("You are not logged in!");
    });
  });


  describe('POST /api/change-address', () => {
    it('should return 200 if successful change', async () => {
      const response = await request(app)
        .post('/api/change-address')
        .set('Cookie', [`accessToken=${accessToken}`, `jid=${refreshToken}`])
        .send({
          message: "localhost wants you to sign in with your Ethereum account:\n0x70997970C51812dc3A010C7d01b50e0d17dc79C8\n\n'Please sign this message to confirm your identity.'\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 1337\nNonce: njusft\nIssued At: 2023-08-21T17:44:17.333Z",
          signature: "0xe3e6d6cee6c236550925cbb770edc46cc58fc5761ae6adbd26045b0b04d2d8eb7813ee53b70a7d732c08a33bfb4a97fc26dd7c668ba10b314d172608f5b454521c",
          address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
        });
  
      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("Success");
    });
  
    it('should return 403 if address fields are missing', async () => {
      const response = await request(app)
        .post('/api/change-address')
        .set('Cookie', [`accessToken=${accessToken}`, `jid=${refreshToken}`])
        .send({
          message: 'some-message',
        });

      expect(response.status).to.equal(403);
      expect(response.body.message).to.equal("Missing signature, message or address!");
    });

    it('should return 403 if signature is invalid', (done) => {
      request(app)
        .post('/api/change-address')
        .set('Cookie', [`accessToken=${accessToken}`, `jid=${refreshToken}`])
        .send({
          message: 'some-message',
          signature: 'signature',
          address: '0xAnotherAddress',
        })
        .expect(403)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body.message).to.equal("Failed!");
            expect(res.body).to.have.property("error");
            done()
        });
    });

    it('should return 403 if recovered address does not match', (done) => {
      request(app)
        .post('/api/change-address')
        .set('Cookie', [`accessToken=${accessToken}`, `jid=${refreshToken}`])
        .send({
            message: "localhost wants you to sign in with your Ethereum account:\n0x70997970C51812dc3A010C7d01b50e0d17dc79C8\n\n'Please sign this message to confirm your identity.'\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 1337\nNonce: njusft\nIssued At: 2023-08-21T17:44:17.333Z",
            signature: "0xe3e6d6cee6c236550925cbb770edc46cc58fc5761ae6adbd26045b0b04d2d8eb7813ee53b70a7d732c08a33bfb4a97fc26dd7c668ba10b314d172608f5b454521c",
            address: "random"
        })
        .expect(403)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'Failed!');
          expect(res.body).to.have.property('error', 'Recovered address does not equal to original address!');
          done();
        });
    });

    it('should return 401 if user is not authenticated', async () => {
        const response = await request(app)
          .post('/api/change-address')
    
        expect(response.status).to.equal(401);
        expect(response.body.message).to.equal("You are not logged in!");
    });
    // Add more test cases as needed
  });

});
