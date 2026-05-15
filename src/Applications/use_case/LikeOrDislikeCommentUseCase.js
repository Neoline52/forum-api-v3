class LikeOrDislikeCommentUseCase {
  constructor({ commentLikeRepository, commentRepository, threadRepository }) {
    this._commentLikeRepository = commentLikeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);

    const isLiked = await this._commentLikeRepository.checkCommentLiked(userId, commentId);

    if (isLiked) {
      await this._commentLikeRepository.unlikeComment(userId, commentId);
    } else {
      await this._commentLikeRepository.likeComment(userId, commentId);
    }
  }
}

module.exports = LikeOrDislikeCommentUseCase;
