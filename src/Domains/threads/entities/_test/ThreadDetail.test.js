const ThreadDetail = require('../ThreadDetail');

describe('a ThreadDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'abc',
    };

    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: 'abc',
      body: 'abc',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create threadDetail object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'dicoding thread',
      body: 'dicoding body',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [],
    };

    const threadDetail = new ThreadDetail(payload);

    expect(threadDetail.id).toEqual(payload.id);
    expect(threadDetail.title).toEqual(payload.title);
    expect(threadDetail.body).toEqual(payload.body);
    expect(threadDetail.date).toEqual(payload.date);
    expect(threadDetail.username).toEqual(payload.username);
    expect(threadDetail.comments).toEqual(payload.comments);
  });
});
