const pool = require('../src/Infrastructures/database/postgres/pool');
const ThreadsTableTestHelper = require('./ThreadsTableTestHelper');
const UsersTableTestHelper = require('./UsersTableTestHelper');
const CommentsTableTestHelper = require('./CommentsTableTestHelper');
const RepliesTableTestHelper = require('./RepliesTableTestHelper');
const ServerTestHelper = require('./ServerTestHelper');
const container = require('../src/Infrastructures/container');
const createServer = require('../src/Infrastructures/http/createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const requestPayload = {
        content: 'dicoding reply',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content);
      expect(responseJson.data.addedReply.owner).toBeDefined();
    });

    it('should response 404 when comment not found', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const requestPayload = {
        content: 'dicoding reply',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-notfound/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and soft delete reply', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // Verify soft delete
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies[0].is_delete).toEqual(true);
    });

    it('should response 403 when user is not the owner', async () => {
      const accessToken = await ServerTestHelper.getAccessToken({ username: 'user2' }); // Creates user-123
      await UsersTableTestHelper.addUser({ id: 'user-999', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-999' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-999' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-999' });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak mengakses resource ini');
    });

    it('should response 404 when reply not found', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-notfound',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('balasan tidak ditemukan');
    });
  });
});
