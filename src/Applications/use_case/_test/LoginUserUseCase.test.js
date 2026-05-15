const UserRepository = require('../../../Domains/users/UserRepository');
const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const PasswordHash = require('../../../Applications/security/PasswordHash');
const LoginUserUseCase = require('../LoginUserUseCase');
const NewAuth = require('../../../Domains/authentications/entities/NewAuth');
const UserLogin = require('../../../Domains/users/entities/UserLogin');

describe('LoginUserUseCase', () => {
  it('should orchestrating the login action correctly', async () => {
    const useCasePayload = {
      username: 'dicoding',
      password: 'secret_password',
    };

    const mockUserRepository = new UserRepository();
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();
    const mockPasswordHash = new PasswordHash();

    mockUserRepository.getPasswordByUsername = jest.fn()
      .mockImplementation(() => Promise.resolve('encrypted_password'));
    mockPasswordHash.comparePassword = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockUserRepository.getIdByUsername = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'));
    mockAuthenticationTokenManager.createAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve('access_token'));
    mockAuthenticationTokenManager.createRefreshToken = jest.fn()
      .mockImplementation(() => Promise.resolve('refresh_token'));
    mockAuthenticationRepository.addToken = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
      passwordHash: mockPasswordHash,
    });

    const actualAuthentication = await loginUserUseCase.execute(useCasePayload);

    expect(actualAuthentication).toEqual(new NewAuth({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    }));

    expect(mockUserRepository.getPasswordByUsername).toBeCalledWith(useCasePayload.username);
    expect(mockPasswordHash.comparePassword).toBeCalledWith(useCasePayload.password, 'encrypted_password');
    expect(mockUserRepository.getIdByUsername).toBeCalledWith(useCasePayload.username);
    expect(mockAuthenticationTokenManager.createAccessToken).toBeCalledWith({ username: useCasePayload.username, id: 'user-123' });
    expect(mockAuthenticationTokenManager.createRefreshToken).toBeCalledWith({ username: useCasePayload.username, id: 'user-123' });
    expect(mockAuthenticationRepository.addToken).toBeCalledWith('refresh_token');
  });
});
