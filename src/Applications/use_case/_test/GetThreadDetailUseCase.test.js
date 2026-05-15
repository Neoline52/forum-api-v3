const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentLikeRepository = require('../../../Domains/likes/CommentLikeRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThreadDetail = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-1',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_delete: false,
      },
      {
        id: 'comment-2',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'sebuah comment 2',
        is_delete: true,
      },
    ];

    const mockRepliesComment1 = [
      {
        id: 'reply-1',
        username: 'dicoding',
        date: '2021-08-08T07:59:48.766Z',
        content: 'sebuah balasan',
        is_delete: true,
      },
      {
        id: 'reply-2',
        username: 'johndoe',
        date: '2021-08-08T08:07:01.522Z',
        content: 'sebuah balasan',
        is_delete: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadDetail));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation((commentId) => {
        if (commentId === 'comment-1') return Promise.resolve(mockRepliesComment1);
        return Promise.resolve([]);
      });
    mockCommentLikeRepository.getLikeCountByCommentId = jest.fn()
      .mockImplementation((commentId) => {
        if (commentId === 'comment-1') return Promise.resolve(2);
        return Promise.resolve(0);
      });

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    const threadDetail = await getThreadDetailUseCase.execute(useCasePayload);

    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-1');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-2');
    expect(mockCommentLikeRepository.getLikeCountByCommentId).toBeCalledWith('comment-1');
    expect(mockCommentLikeRepository.getLikeCountByCommentId).toBeCalledWith('comment-2');

    expect(threadDetail).toEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-1',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
          likeCount: 2,
          replies: [
            {
              id: 'reply-1',
              username: 'dicoding',
              date: '2021-08-08T07:59:48.766Z',
              content: '**balasan telah dihapus**',
            },
            {
              id: 'reply-2',
              username: 'johndoe',
              date: '2021-08-08T08:07:01.522Z',
              content: 'sebuah balasan',
            },
          ],
        },
        {
          id: 'comment-2',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: [],
        },
      ],
    });
  });
});
