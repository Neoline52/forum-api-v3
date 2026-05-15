const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      const newReply = new NewReply({
        content: 'dicoding reply',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.addReply(newReply);

      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      const newReply = new NewReply({
        content: 'dicoding reply',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'dicoding reply',
        owner: 'user-123',
      }));
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return empty array when no replies found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const replies = await replyRepositoryPostgres.getRepliesByCommentId('comment-123');
      expect(replies).toEqual([]);
    });

    it('should return replies correctly', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-1',
        content: 'reply 1',
        commentId: 'comment-123',
        owner: 'user-123',
        date: '2021-08-08T07:22:33.555Z',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-2',
        content: 'reply 2',
        commentId: 'comment-123',
        owner: 'user-123',
        date: '2021-08-08T07:26:21.338Z',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const replies = await replyRepositoryPostgres.getRepliesByCommentId('comment-123');

      expect(replies).toHaveLength(2);
      expect(replies[0].id).toEqual('reply-1');
      expect(replies[0].username).toEqual('dicoding');
      expect(replies[0].content).toEqual('reply 1');
      expect(replies[0].is_delete).toEqual(false);
      expect(replies[1].id).toEqual('reply-2');
      expect(replies[1].username).toEqual('dicoding');
      expect(replies[1].content).toEqual('reply 2');
    });
  });

  describe('deleteReplyById function', () => {
    it('should soft delete reply', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await replyRepositoryPostgres.deleteReplyById('reply-123');

      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies[0].is_delete).toEqual(true);
    });
  });

  describe('verifyReplyExists function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyExists('reply-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when reply found', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyExists('reply-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when user is not the owner', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw error when user is the owner', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });
});
