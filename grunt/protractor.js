module.exports = {
  options: {
    configFile: 'node_modules/protractor/referenceConf.js', // Default config file
    keepAlive: false,
    noColor: false,
    args: {}
  },
  E2E_local: {
    options: {
      configFile: 'test/protractor-conf.coffee',
      args: {}
    }
  }
};
