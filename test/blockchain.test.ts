import request from 'supertest';
import { expect } from 'chai';
import express from 'express';
const cookieParser = require("cookie-parser");

import "./database-setup";
import { blockchainRouter } from '../api/routes/blockchain';

describe('Blockchain API', () => {
  const app = express();
  app.use(express.json());
  app.use(blockchainRouter);
  app.use(cookieParser());

  describe('POST /request-nonce', () => {
    it('should return a unique nonce and date', (done) => {
      request(app)
        .post('/request-nonce')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'Success');
          expect(res.body).to.have.property('nonce').that.is.a('string');
          expect(res.body).to.have.property('time').that.is.a('string');
          done();
        });
    });

/*     it('should handle errors', (done) => {
      request(app)
        .post('/request-nonce')
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('error');
          done();
        });
    }); */
  });

  describe('POST /authenticate', () => {
    it('should authenticate a user and return a success message', (done) => {
      request(app)
        .post('/authenticate')
        .send({
            message: "localhost wants you to sign in with your Ethereum account:\n0x70997970C51812dc3A010C7d01b50e0d17dc79C8\n\n'Please sign this message to confirm your identity.'\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 1337\nNonce: njusft\nIssued At: 2023-08-21T17:44:17.333Z",
            signature: "0xe3e6d6cee6c236550925cbb770edc46cc58fc5761ae6adbd26045b0b04d2d8eb7813ee53b70a7d732c08a33bfb4a97fc26dd7c668ba10b314d172608f5b454521c",
            address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
        })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'Success');
          expect(res.header['set-cookie']).to.be.an('array');
          expect(res.header['set-cookie'][0]).to.include('jid=');
          expect(res.header['set-cookie'][1]).to.include('accessToken=');
          done();
        });
    });

    it('should handle missing signature, message, or address', (done) => {
      request(app)
        .post('/authenticate')
        .expect(403)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'Missing signature, message or address!');
          done();
        });
    });

    it('should handle failed authentication', (done) => {
      request(app)
        .post('/authenticate')
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
  });
});
