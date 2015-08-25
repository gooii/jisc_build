var _ = require('lodash');

module.exports = function (grunt, options) {

  grunt.log.verbose.writeln('Replace config',options);
  config = {};
  // Where to read the environment specific configs
  var envDir = './config/environments/';
  // Which environments are in use
  var environments = ['development', 'staging', 'preproduction', 'production', 'local'];

  var includes = {
    development: {data: 'dev.js', src: './app/index.html', dest: '.tmp/index.html'},
    staging: {data: 'staging.js', src: './dist/index.html', dest: 'dist/index.html'},
    preproduction: {data: 'shib.php', src: './dist/index.html', dest: 'dist/index.php'},
    production: {data: 'shib.php', src: './dist/index.html', dest: 'dist/index.php'},
    local: {data: 'shib.php', src: './app/index.html', dest: 'dist/index.php'}
  };

  // The 'src' is the service template which will have the template strings replaced by
  // the environment specific config
  // The 'dest' is where to write the final angular service file
  var configServiceFiles = [{
    expand: true,
    flatten: true,
    src: ['./config/config.coffee'],
    dest: 'app/scripts/components/constants/'
  }];

  var uiProject = "bower_components/" + options.uiProject + "/";
  var contentProject = "bower_components/" + options.contentProject + "/";
  grunt.log.verbose.writeln("Replace config UI : " + uiProject + " Content " + contentProject);

  _.each(environments, function (env) {
    // config replacement tasks
    config['config_' + env] = {
      options: {
        patterns: [{json: grunt.file.readJSON(envDir + env + '.json')}]
      },
      files: configServiceFiles
    };

    // Global JS Variable injectors.
    var includer = includes[env];
    var replaceFiles = [{src: includer.src, dest: includer.dest}];

    var userDataPattern = {match: 'userData'};

    var newline = '\n';
    // If its not a preproduction or production build then we also need to inject the configs from the content branding module
    if (includer.data != 'shib.php') {
      userDataPattern.replacement = '<%= grunt.file.read("' + uiProject + 'server/' + includer.data + '") %>';
      userDataPattern.replacement += newline + 'var brands =<%= grunt.file.read("' + contentProject + 'brands/brands.json") %>;' + newline;
      userDataPattern.replacement += newline + '<%= grunt.file.read("' + contentProject + 'brands/routes.js") %>' + newline;
    } else {
      userDataPattern.replacement = '<%= grunt.file.read("' + uiProject + 'server/shib.php") %>';
    }

    grunt.log.verbose.writeln('GITINFO',"<%= gitinfo %>");

    var gitInfoPattern = {
      match: 'buildInfo',
      replacement: 'var buildInfo = {' +
      'hash:"<%= gitinfo.local.branch.current.SHA %>",' +
      'branch:"<%= gitinfo.local.branch.current.name %>",' +
      'number:"<%= gitinfo.local.branch.current.lastCommitNumber %>"};'
    };

    var patterns = [userDataPattern, gitInfoPattern];

    config['preload_' + env] = {
      options: {
        patterns: patterns
      },
      files: replaceFiles
    };
  });

  return config;
};

