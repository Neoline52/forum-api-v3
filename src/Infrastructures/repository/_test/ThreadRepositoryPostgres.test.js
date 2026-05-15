const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      const newThread = new NewThread({
        title: 'dicoding thread',
        body: 'dicoding body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.addThread(newThread);

      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      const newThread = new NewThread({
        title: 'dicoding thread',
        body: 'dicoding body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'dicoding thread',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return thread correctly', async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding thread',
        body: 'dicoding body',
        owner: 'user-123',
        date: '2021-08-08T07:19:09.775Z',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('dicoding thread');
      expect(thread.body).toEqual('dicoding body');
      expect(thread.username).toEqual('dicoding');
      expect(thread.date).toEqual(expect.any(Date)); // Return from pg will be a Date object
    });
  });

  describe('verifyThreadExists function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when thread found', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });
});
