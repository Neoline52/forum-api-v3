const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentsWithRepliesAndLikes = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this._replyRepository.getRepliesByCommentId(comment.id);
        const likeCount = await this._commentLikeRepository.getLikeCountByCommentId(comment.id);

        const repliesDetail = replies.map((reply) => new ReplyDetail({
          ...reply,
          date: reply.date,
          isDelete: reply.is_delete,
        }));

        return new CommentDetail({
          ...comment,
          date: comment.date,
          isDelete: comment.is_delete,
          replies: repliesDetail,
          likeCount,
        });
      }),
    );

    return {
      ...thread,
      comments: commentsWithRepliesAndLikes,
    };
  }
}

module.exports = GetThreadDetailUseCase;
