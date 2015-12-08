module.exports = {
  options: {
    files             : ['bower.json'],
    updateConfigs     : [],
    commit            : true,
    commitMessage     : 'Release v%VERSION%',
    commitFiles       : ['-a'],
    createTag         : true,
    tagName           : '%VERSION%',
    tagMessage        : 'Version %VERSION%',
    push              : true,
    pushTo            : 'origin',
    gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
    globalReplace     : false
  }
};
