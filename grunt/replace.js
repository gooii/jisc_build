var _ = require('lodash');

module.exports = function (grunt, options) {

  config = {};

  if(!options.contentProject) {
    grunt.log.writeln('Skipping replace : no contentProject configured');
    return config;
  }

  grunt.log.verbose.writeln('Replace config',options);
  // Where to read the environment specific configs
  var envDir = './config/environments/';
  // Which environments are in use
  var environments = ['preview', 'development', 'staging', 'production', 'local'];

  var includes = {
    local:          {data: 'dev.js'  , src: './app/index.html',  dest: 'dist/index.php'},
    preview:        {data: 'shib.php', src: './dist/index.html', dest: 'dist/index.php'},
    development:    {data: 'shib.php', src: './dist/index.html', dest: 'dist/index.php'},
    staging:        {data: 'shib.php', src: './dist/index.html', dest: 'dist/index.php'},
    production:     {data: 'shib.php', src: './dist/index.html', dest: 'dist/index.php'},
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

  var contentProject = "bower_components/" + options.contentProject + "/";
  var buildProject = "node_modules/jisc_build/";
  grunt.log.verbose.writeln("Replace config. Content " + contentProject);

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

    // If its not a production build then we also need to inject the configs from the content branding module
    if (includer.data != 'shib.php') {
      userDataPattern.replacement = '<%= grunt.file.read("' + buildProject + 'server/' + includer.data + '") %>';
      userDataPattern.replacement += newline + 'var brands =<%= grunt.file.read("' + contentProject + 'brands/brands.json") %>;' + newline;
      userDataPattern.replacement += newline + '<%= grunt.file.read("' + contentProject + 'brands/routes.js") %>' + newline;
    } else {
      userDataPattern.replacement = '<%= grunt.file.read("' + buildProject + 'server/shib.php") %>';
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

    grunt.log.verbose.writeln('UserData     : ', env, userDataPattern);
    grunt.log.verbose.writeln('ReplaceFiles : ', env, replaceFiles);
    config['preload_' + env] = {
      options: {
        patterns: patterns
      },
      files: replaceFiles
    };
  });

  return config;
};

