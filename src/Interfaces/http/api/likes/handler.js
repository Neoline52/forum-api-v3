const LikeOrDislikeCommentUseCase = require('../../../../Applications/use_case/LikeOrDislikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request) {
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;
    const likeOrDislikeCommentUseCase = this._container.getInstance(LikeOrDislikeCommentUseCase.name);
    await likeOrDislikeCommentUseCase.execute({ threadId, commentId, userId });

    return {
      status: 'success',
    };
  }
}

module.exports = LikesHandler;
