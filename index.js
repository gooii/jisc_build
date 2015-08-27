var send = require('send')
  , utils = require('connect/lib/utils')
  , parse = require('parseurl')
  , url = require('url')
  , modRewrite = require('connect-modrewrite')
  , path = require('path')
  , proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest
  , _ = require('lodash')
  , isThere = require("is-there")
  , grunt = require("grunt");

var fileTypes = ['html', 'png', 'gif', 'jpg', 'js', 'css', 'woff', 'ttf', 'svg'];

createConnectConfig = function(options) {
  var config = {
    options: {
      port: options.port,
      hostname: '0.0.0.0'
    },
    livereload: {
      options: {
        livereload: options.livereload_port,
        middleware: function (connect) {
          return createMiddleware(connect, options);
        }
      }
    }
  };
  if(options.proxyServer) {
    config.proxies = createProxies(options);
  }
  return config;
};

createProxies = function(options) {
  var proxyServer = options.proxyServer || "";
  var proxyPaths = options.proxyPaths || [];
  // Configure proxies
  var proxies = [];
  _.each(proxyPaths, function (path) {
    proxies.push({
      context: path,
      host: proxyServer,
      port: 443,
      xforward: true,
      changeOrigin: true,
      https: true
    })
  });
  grunt.log.writeln('Proxies',proxies);
  return proxies;
};

createMiddleware = function(connect, config) {

  var mountFolders = config.mountFolders || [];
  var brands = config.brands || [];
  var contentRoot = config.contentRoot;
  var proxyPaths = config.proxyPaths;

  var rewriteRule = '!';

  if(proxyPaths) {
    rewriteRule += proxyPaths.join('|') + '|';
  }
  rewriteRule += '\\.' + fileTypes.join('|\\.');
  rewriteRule += '$ /index.html';

  var middlewares = [modRewrite([rewriteRule])];

  if(config.proxyServer) {
    grunt.log.writeln('Add proxy snippet');
    middlewares.push(proxySnippet);
  }

  _.each(mountFolders, function(folder) {
    middlewares.push(connect.static(path.resolve(folder)));
  });

  if(contentRoot.lastIndexOf('/') != contentRoot.length - 1) {
    contentRoot += '/';
  }

  middlewares.push(templateProxy(brands,contentRoot));

  return middlewares;
};

templateProxy = function(brands, contentRoot) {

  var redirect = false;
  var root = contentRoot;

  var rewriter = function(req, res, next) {
    if ('GET' != req.method && 'HEAD' != req.method) return next();
    var originalUrl = url.parse(req.originalUrl);
    var path = parse(req).pathname;
    var pause = utils.pause(req);

    var isTemplate = path.indexOf('/templates') == 0;
    var isImage = path.indexOf('/images') == 0;

    grunt.log.writeln('Check path',path,isTemplate,isImage);

    if(!isTemplate && !isImage) {
      return next();
    } else {
      if(isTemplate) {
        // Strip /templates off the front
        path = path.substring(11);
      } else {
        path = path.substring(8);
      }

      grunt.log.writeln('Reduced path',path);
    }

    if (path == '/' && originalUrl.pathname[originalUrl.pathname.length - 1] != '/') {
      return directory();
    }

    function resume() {
      next();
      pause.resume();
    }

    function directory() {
      if (!redirect) return resume();
      var target;
      originalUrl.pathname += '/';
      target = url.format(originalUrl);
      res.statusCode = 303;
      res.setHeader('Location', target);
      res.end('Redirecting to ' + utils.escape(target));
    }

    function error(err) {
      if (404 == err.status) return resume();
      next(err);
    }

    var filePath = resolveBrandFile(root, brands, path, isTemplate);

    if(filePath == undefined) {
      return next();
    }

    send(req, filePath)
      .maxage(0)
      .root(root)
      .index('index.html')
      .on('error', error)
      .on('directory', directory)
      .pipe(res);
  };
  return rewriter;
};

function resolveBrandFile(root, brands, file, isTemplate) {

  grunt.log.writeln('resolveBrandFile. Root : ' + root + '. file : ' + file + '. isTemplate : ' + isTemplate);
  grunt.log.writeln('brands : ' + brands);
  // root : bower_components/jja_content/brands/
  // file : 'sparerib/about/about.html' or 'images/sparerib/banner.jpg'

  // brands : ['sparerib','default']
  // isTemplate : true

  // 3 : is the first path section of 'file' a brand name
  var fileParts = file.split('/');
  var brandName = 'default';
  if(fileParts.length > 1) {
    var firstPathSection = fileParts[0];
    if(_.indexOf(brands,firstPathSection) != -1) {
      brandName = firstPathSection;
    }
  }
  grunt.log.writeln('brand name ' + brandName);

  var pathsToCheck = [];
  if(isTemplate) {
    pathsToCheck.push(root + file);
    if(brandName != 'default') {
      pathsToCheck.push(root + 'default/' + file.substring(brandName.length));
    } else {
      pathsToCheck.push(root + 'default/' + file);
    }
  } else {
    pathsToCheck.push(root + 'images/' + file);
    if(brandName != 'default') {
      pathsToCheck.push(root + brandName + '/images/' + file.substring(brandName.length));
      pathsToCheck.push(root + 'default/images/' + file.substring(brandName.length));
    } else {
      pathsToCheck.push(root + 'default/images/' + file);
    }
  }
  pathsToCheck.push(file);

  grunt.log.writeln('PTC : ' + pathsToCheck);
  var actualPath = _.find(pathsToCheck,function(p) {
    return isThere(p);
  })

  if(actualPath !== undefined) {
    grunt.log.writeln('Actual path ' + actualPath);
    return actualPath.substring(root.length);
  } else {
    return actualPath;
  }

}

registerCopyTasks = function(grunt) {
  grunt.registerTask("copy_shib_login", function () {
    grunt.file.mkdir("dist/Login");
    grunt.file.copy("node_modules/jisc_build/server/login.php", "dist/Login/login.php");
  });

  grunt.registerTask("copy_template_php", function () {
    grunt.file.mkdir("dist/templates/");
    grunt.file.copy("node_modules/jisc_build/server/templates/index.php", "dist/templates/index.php");
  });

  grunt.registerTask("copy_robots_txt", function () {
    grunt.file.copy("app/robots.txt", "dist/robots.txt");
  });

  grunt.registerTask("copy_htaccess",function () {
    grunt.file.copy("config/apache/htaccess", "dist/.htaccess");
  });

  return ['copy_shib_login','copy_template_php','copy_robots_txt'];

};

registerReleaseTask = function(grunt) {
  // release task which bumps the specified segment of the version number ('major', 'minor', 'patch', 'prerelease'
  // or 'git'), then git tags, commits and pushes it to origin
  //
  // we could optionally pass in an additional build environment related task to include in the work flow, but for
  // now am just leaving it as an isolated task
  //
  grunt.registerTask("release", "Release a new version - bumps bower.json, git tags, commits and pushes it", function (target) {
    if (!target) {
      target = "patch"
    }
    grunt.task.run(["bump-only:" + target, "bump-commit"]);
  });
};

var fonts = function(outDir) {
  return {
    expand: true,
    dot: true,
    cwd: 'bower_components/font-awesome/fonts',
    dest: outDir + '/fonts',
    src: '*.*'
  };
};

var uiImages = function(outDir) {
  return {
    // static JJA_UI images (including favicon) and shared partials
    expand: true,
    dot: true,
    cwd: 'bower_components/jja_ui/app',
    dest: outDir,
    src: [
      '*.ico',
      'images/{,*/}/**/*.*'
    ]
  };
};

var appHtmlImages = function(outDir) {
  return {
    /* copy across index.html and any image resource from search app */
    expand: true,
    dot: true,
    cwd: 'app',
    dest: outDir,
    src: [
      'partials/**/*.html',
      'images/{,*/}/**/*.*'
    ]
  };
}

var brandsContent = function(project) {
  return {
    files: [{
      expand: true,
      dot: true,
      cwd: 'bower_components/' + project + '_content/brands',
      dest: 'dist/brands',
      src: '**/*.*'
    }]
  }
};

copySets = {
  fonts:fonts,
  uiImages:uiImages,
  appHtmlImages:appHtmlImages,
  brands:brandsContent
};

module.exports = {
  createConnectConfig: createConnectConfig,
  registerCopyTasks: registerCopyTasks,
  registerReleaseTask: registerReleaseTask,
  copySets: copySets
};
