/* istanbul ignore file */
const Jwt = require('@hapi/jwt');
const UsersTableTestHelper = require('./UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('./AuthenticationsTableTestHelper');

const ServerTestHelper = {
  async getAccessToken({ username = 'dicoding', password = 'secret_password' } = {}) {
    await UsersTableTestHelper.addUser({ username, password });
    
    // Simulate login by generating token directly to speed up tests
    const id = 'user-123';
    const accessToken = Jwt.token.generate({ username, id }, process.env.ACCESS_TOKEN_KEY);
    const refreshToken = Jwt.token.generate({ username, id }, process.env.REFRESH_TOKEN_KEY);
    
    await AuthenticationsTableTestHelper.addToken(refreshToken);

    return accessToken;
  },
};

module.exports = ServerTestHelper;
