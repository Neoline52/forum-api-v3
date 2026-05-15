const CommentLikeRepository = require('../../Domains/likes/CommentLikeRepository');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async likeComment(userId, commentId) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO user_comment_likes VALUES($1, $2, $3)',
      values: [id, userId, commentId],
    };

    await this._pool.query(query);
  }

  async unlikeComment(userId, commentId) {
    const query = {
      text: 'DELETE FROM user_comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async checkCommentLiked(userId, commentId) {
    const query = {
      text: 'SELECT id FROM user_comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM user_comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = CommentLikeRepositoryPostgres;
