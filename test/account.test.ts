import request from 'supertest';
import { expect } from 'chai';
import express from 'express';
import argon2 from "argon2";
const cookieParser = require("cookie-parser");

import { accountRouter } from '../api/routes/account';
import "./database-setup";
import { User } from '../api/src/entity/User';
import { jwtCreateAccessToken, jwtCreateRefreshToken } from '../api/jwtokens';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', accountRouter);

describe('Account Routes', () => {
  describe('POST /api/login', () => {
    let user : User;
    
    before(async () => {
      user = await User.create({
        username: "test",
        hsPassword: await argon2.hash("testpassword")
      }).save();
    });
    it('should return success message if login is successful', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          user: 'test',
          password: 'testpassword',
        });

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Success');
    });

    it('should return error message if does not have any password or username', async () => {
      const response = await request(app)
      .post('/api/login')
      .send({
        user: '',
        password: '',
      });

      expect(response.status).to.equal(403);
      expect(response.body.message).to.equal('Missing username or password!');
    });

    it('should return error message if login fails', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          user: 't',
          password: 't',
        });

      expect(response.status).to.equal(422);
      expect(response.body.message).to.equal('\"username\" length must be at least 3 characters long');
    });
  });

  describe('POST /api/register', () => {
    before(async () => {
      //delete created account
      let user = await User.findOneBy({username: "test"});
      if (user) {
        await user.remove();
      };
    });
    it('should return success message if registration is successful', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'test@example.com',
          user: 'test',
          password: 'testpassword',
        });

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Success');
    });

    it('should return error message if user already exists', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'test@example.com',
          user: 'test',
          password: 'testpassword',
        });

      expect(response.status).to.equal(403);
      expect(response.body.message).to.equal('User already exists!');
    });
  });

  describe('DELETE /api/delete/account', () => {
    let user : User;
    let accessToken: string;
    let refreshToken: string;
    before(async () => {
      user = await User.findOneBy({username: "test"});
      if (!user) {
        await User.create({
          username: "test",
          hsPassword: await argon2.hash("testpassword")
        }).save();
      };
      accessToken = jwtCreateAccessToken(user);
      refreshToken = jwtCreateRefreshToken(user)
    });

    it('should delete user account and return success message', (done) => {
      request(app)
        .post('/api/delete/account')
        .set('Cookie', [`accessToken=${accessToken}`, `jid=${refreshToken}`])
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.message).to.equal('Success');
          done();
        });
    });
  
    it('should return 401 if user is not logged in', (done) => {
      request(app)
        .post('/api/delete/account')
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.message).to.equal("You're not logged in!");
          done();
        });
    });
  
    it('should return 404 if account is not found', (done) => {
      request(app)
        .post('/api/delete/account')
        .set('Cookie', [`accessToken=${accessToken}`, `jid=${refreshToken}`])
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.message).to.equal('Account not found!');
          done();
        });
    });
  });

  describe('POST /api/logout', () => {
    let user : User;
    before(async () => {
      user = await User.findOneBy({username: "test"});
      if (!user) {
        user = await User.create({
          username: "test",
          hsPassword: await argon2.hash("testpassword")
        }).save();
      };
    });

    /* Using a different datasource
    it('should return success message if logout is successful', async () => {
      const response = await request(app)
        .post('/api/logout')
        .set('Cookie', [`accessToken=${jwtCreateAccessToken(user)}`, `jid=${jwtCreateRefreshToken(user)}`]);

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Successfully logged off');
    }); */

    it('should return error message if user is not logged in', async () => {
      const response = await request(app)
        .post('/api/logout');

      expect(response.status).to.equal(401);
      expect(response.body.message).to.equal("You're not logged in!");
    });
  });
});
