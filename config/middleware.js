module.exports = {
  load: {
    before: ["responseTime", "logger", "cors", "responses"],
    after: ["parser", "router"],
  },
  settings: {
    /* logger: {
      level: "debug",
      exposeInContext: true,
      requests: true,
    }, */
  },
};
