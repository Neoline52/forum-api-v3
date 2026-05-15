const ReplyDetail = require('../ReplyDetail');

describe('a ReplyDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'reply-123',
    };

    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah balasan',
    };

    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create replyDetail object correctly', () => {
    const payload = {
      id: 'reply-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah balasan',
    };

    const replyDetail = new ReplyDetail(payload);

    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.date).toEqual(payload.date);
    expect(replyDetail.content).toEqual(payload.content);
  });

  it('should create replyDetail object with masked content when isDelete is true', () => {
    const payload = {
      id: 'reply-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah balasan',
      isDelete: true,
    };

    const replyDetail = new ReplyDetail(payload);

    expect(replyDetail.content).toEqual('**balasan telah dihapus**');
  });
});
