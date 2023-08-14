import request from 'supertest';
import { expect } from 'chai';
import express from 'express';
import { accountRouter } from '../api/routes/account';

const app = express();
app.use(express.json());
app.use('/api', accountRouter);

describe('Account Routes', () => {
  describe('POST /api/login', () => {
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

    it('should return error message if login fails', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          user: '',
          password: '',
        });

      expect(response.status).to.equal(422);
      expect(response.body.message).to.equal('Wrong username or password!');
    });
  });

  describe('POST /api/register', () => {
    it('should return success message if registration is successful', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'test@example.com',
          user: 'testuser',
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
          user: 'testuser',
          password: 'testpassword',
        });

      expect(response.status).to.equal(403);
      expect(response.body.message).to.equal('User already exists!');
    });
  });

  describe('DELETE /delete/account', () => {
    it('should delete user account and return success message', (done) => {
      request(app)
        .post('/delete/account')
        .set('Authorization', 'Bearer <your-access-token>')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.message).to.equal('Success');
          done();
        });
    });
  
    it('should return 401 if user is not logged in', (done) => {
      request(app)
        .post('/delete/account')
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.message).to.equal("You're not logged in!");
          done();
        });
    });
  
    it('should return 404 if account is not found', (done) => {
      request(app)
        .post('/delete/account')
        .set('Authorization', 'Bearer <your-access-token>')
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.message).to.equal('Account not found!');
          done();
        });
    });
  });

  describe('POST /api/logout', () => {
    it('should return success message if logout is successful', async () => {
      const response = await request(app)
        .post('/api/logout')
        .set('Cookie', ['accessToken=tokenValue', 'jid=refreshTokenValue']);

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Successfully logged off');
    });

    it('should return error message if user is not logged in', async () => {
      const response = await request(app)
        .post('/api/logout');

      expect(response.status).to.equal(401);
      expect(response.body.message).to.equal("You're not logged in!");
    });
  });
});
