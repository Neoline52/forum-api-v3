const CommentDetail = require('../CommentDetail');

describe('a CommentDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'comment-123',
    };

    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
    };

    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create commentDetail object correctly', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
      replies: [],
      likeCount: 5,
    };

    const commentDetail = new CommentDetail(payload);

    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.replies).toEqual(payload.replies);
    expect(commentDetail.likeCount).toEqual(payload.likeCount);
  });

  it('should create commentDetail object with masked content when isDelete is true', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
      isDelete: true,
      replies: [],
      likeCount: 5,
    };

    const commentDetail = new CommentDetail(payload);

    expect(commentDetail.content).toEqual('**komentar telah dihapus**');
  });
});
