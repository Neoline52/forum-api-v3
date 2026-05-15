const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteReplyUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.verifyReplyExists).toBeCalledWith(useCasePayload.replyId);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(useCasePayload.replyId, useCasePayload.owner);
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(useCasePayload.replyId);
  });
});
