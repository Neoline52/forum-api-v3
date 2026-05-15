const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');

describe('CommentLikeRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('likeComment function', () => {
    it('should add like to database', async () => {
      const fakeIdGenerator = () => '123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator);

      await commentLikeRepositoryPostgres.likeComment('user-123', 'comment-123');

      const likes = await LikesTableTestHelper.findLikesById('like-123');
      expect(likes).toHaveLength(1);
      expect(likes[0].user_id).toBe('user-123');
      expect(likes[0].comment_id).toBe('comment-123');
    });
  });

  describe('unlikeComment function', () => {
    it('should delete like from database', async () => {
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      await commentLikeRepositoryPostgres.unlikeComment('user-123', 'comment-123');

      const likes = await LikesTableTestHelper.findLikesById('like-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('checkCommentLiked function', () => {
    it('should return false if comment is not liked by user', async () => {
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      const isLiked = await commentLikeRepositoryPostgres.checkCommentLiked('user-123', 'comment-123');
      expect(isLiked).toBe(false);
    });

    it('should return true if comment is liked by user', async () => {
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      const isLiked = await commentLikeRepositoryPostgres.checkCommentLiked('user-123', 'comment-123');
      expect(isLiked).toBe(true);
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should return correct like count', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      await LikesTableTestHelper.addLike({ id: 'like-456', userId: 'user-456', commentId: 'comment-123' });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      const likeCount = await commentLikeRepositoryPostgres.getLikeCountByCommentId('comment-123');
      expect(likeCount).toBe(2);
    });
  });
});
