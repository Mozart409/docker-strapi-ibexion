module.exports = {
  settings: {
    logger: {
      level: "debug",
      exposeInContext: true,
      requests: true,
    },
    cache: {
      enabled: true,
      enableEtagSupport: true,
      models: [
        {
          model: "global",
          singleType: true,
        },
        "page",
      ],
    },
  },
};
