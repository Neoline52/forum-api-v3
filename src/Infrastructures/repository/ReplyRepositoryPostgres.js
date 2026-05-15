const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { content, commentId, owner } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, owner, commentId, false, date],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT replies.id, users.username, replies.date, replies.content, replies.is_delete
             FROM replies
             LEFT JOIN users ON users.id = replies.owner
             WHERE replies.comment_id = $1
             ORDER BY replies.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async verifyReplyExists(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    const reply = result.rows[0];
    if (reply.owner !== owner) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
