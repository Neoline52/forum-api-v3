const pool = require('../src/Infrastructures/database/postgres/pool');
const ThreadsTableTestHelper = require('./ThreadsTableTestHelper');
const UsersTableTestHelper = require('./UsersTableTestHelper');
const CommentsTableTestHelper = require('./CommentsTableTestHelper');
const ServerTestHelper = require('./ServerTestHelper');
const container = require('../src/Infrastructures/container');
const createServer = require('../src/Infrastructures/http/createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const requestPayload = {
        content: 'dicoding comment',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);
      expect(responseJson.data.addedComment.owner).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const requestPayload = {
        content: 'dicoding comment',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-notfound/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const requestPayload = {};
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and soft delete comment', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // Verify soft delete
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments[0].is_delete).toEqual(true);
    });

    it('should response 403 when user is not the owner', async () => {
      const accessToken = await ServerTestHelper.getAccessToken({ username: 'user2' }); // Creates user-123 internally
      await UsersTableTestHelper.addUser({ id: 'user-999', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-999' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-999' }); // Belongs to user-999
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak mengakses resource ini');
    });

    it('should response 404 when comment not found', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-notfound',
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
});
