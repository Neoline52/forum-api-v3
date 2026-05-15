const pool = require('../src/Infrastructures/database/postgres/pool');
const UsersTableTestHelper = require('./UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('./AuthenticationsTableTestHelper');
const container = require('../src/Infrastructures/container');
const createServer = require('../src/Infrastructures/http/createServer');

describe('/authentications endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /authentications', () => {
    it('should response 201 and new authentication', async () => {
      const requestPayload = {
        username: 'dicoding',
        password: 'secret_password',
      };
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password',
      });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.accessToken).toBeDefined();
      expect(responseJson.data.refreshToken).toBeDefined();
    });

    it('should response 401 if wrong password', async () => {
      const requestPayload = {
        username: 'dicoding',
        password: 'wrong_password',
      };
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password',
      });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('kredensial yang Anda masukkan salah');
    });
  });

  describe('when PUT /authentications', () => {
    it('should response 200 and new access token', async () => {
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password',
      });
      const server = await createServer(container);

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret_password',
        },
      });

      const { data: { refreshToken } } = JSON.parse(loginResponse.payload);

      const response = await server.inject({
        method: 'PUT',
        url: '/authentications',
        payload: {
          refreshToken,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.accessToken).toBeDefined();
    });

    it('should response 400 if refresh token not provided', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: '/authentications',
        payload: {},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan token refresh');
    });
  });

  describe('when DELETE /authentications', () => {
    it('should response 200 and delete refresh token', async () => {
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password',
      });
      const server = await createServer(container);

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret_password',
        },
      });

      const { data: { refreshToken } } = JSON.parse(loginResponse.payload);

      const response = await server.inject({
        method: 'DELETE',
        url: '/authentications',
        payload: {
          refreshToken,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.message).toEqual('refresh token berhasil dihapus');
    });

    it('should response 400 if refresh token not provided', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/authentications',
        payload: {},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan token refresh');
    });
  });
});
