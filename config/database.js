module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "bookshelf",
      settings: {
        client: "postgres",
        host: env("PGHOST", "127.0.0.1"),
        port: env.int("PGPORT", 5432),
        database: env("PGDATABASE", "strapi"),
        username: env("PGUSER", ""),
        password: env("PGPASSWORD", ""),
      },
      options: {
        useNullAsDefault: true,
        debug: true,
      },
    },
  },
});
