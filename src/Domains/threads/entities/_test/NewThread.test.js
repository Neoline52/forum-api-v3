const NewThread = require('../NewThread');

describe('a NewThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'abc',
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 'abc',
      body: 123,
      owner: 'user-123',
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newThread object correctly', () => {
    const payload = {
      title: 'dicoding thread',
      body: 'dicoding body',
      owner: 'user-123',
    };

    const { title, body, owner } = new NewThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
