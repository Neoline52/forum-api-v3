const CommentLikeRepository = require('../../../Domains/likes/CommentLikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeOrDislikeCommentUseCase = require('../LikeOrDislikeCommentUseCase');

describe('LikeOrDislikeCommentUseCase', () => {
  it('should orchestrating the like action correctly when comment is not liked', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockCommentLikeRepository = new CommentLikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.checkCommentLiked = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockCommentLikeRepository.likeComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const likeOrDislikeCommentUseCase = new LikeOrDislikeCommentUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await likeOrDislikeCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(useCasePayload.commentId);
    expect(mockCommentLikeRepository.checkCommentLiked).toBeCalledWith(useCasePayload.userId, useCasePayload.commentId);
    expect(mockCommentLikeRepository.likeComment).toBeCalledWith(useCasePayload.userId, useCasePayload.commentId);
  });

  it('should orchestrating the unlike action correctly when comment is already liked', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockCommentLikeRepository = new CommentLikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.checkCommentLiked = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentLikeRepository.unlikeComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const likeOrDislikeCommentUseCase = new LikeOrDislikeCommentUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await likeOrDislikeCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(useCasePayload.commentId);
    expect(mockCommentLikeRepository.checkCommentLiked).toBeCalledWith(useCasePayload.userId, useCasePayload.commentId);
    expect(mockCommentLikeRepository.unlikeComment).toBeCalledWith(useCasePayload.userId, useCasePayload.commentId);
  });
});
