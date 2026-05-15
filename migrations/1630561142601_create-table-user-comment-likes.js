/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('user_comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('user_comment_likes', 'fk_likes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('user_comment_likes', 'fk_likes.comment_id_comments.id', 'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE');
  pgm.addConstraint('user_comment_likes', 'unique_user_comment_likes', 'UNIQUE(user_id, comment_id)');
};

exports.down = (pgm) => {
  pgm.dropTable('user_comment_likes');
};
