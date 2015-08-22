var send = require('send')
  , utils = require('connect/lib/utils')
  , parse = require('parseurl')
  , url = require('url')
  , modRewrite = require('connect-modrewrite')
  , path = require('path')
  , proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest
  , _ = require('lodash')
  , isThere = require("is-there");

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
    middlewares.push(proxySnippet);
  }

  _.each(mountFolders, function(folder) {
    middlewares.push(connect.static(path.resolve(folder)));
  });

  if(contentRoot.lastIndexOf('/') != contentRoot.length - 1) {
    contentRoot += '/';
  }

  middlewares.push(templateProxy(brands,contentRoot));
  //_.each(brands, function(brand) {
  //  middlewares.push(templateProxy(brand, contentRoot));
  //});

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

    console.log('Check path',path,isTemplate,isImage);

    if(!isTemplate && !isImage) {
      return next();
    } else {
      if(isTemplate) {
        // Strip /templates off the front
        path = path.substring(11);
      } else {
        path = path.substring(8);
      }

      console.log('Reduced path',path);
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

  console.log('resolveBrandFile. Root : ' + root + '. file : ' + file + '. isTemplate : ' + isTemplate);
  console.log('brands : ' + brands);
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
  console.log('brand name ' + brandName);

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

  console.log('PTC : ' + pathsToCheck);
  var actualPath = _.find(pathsToCheck,function(p) {
    return isThere(p);
  })

  if(actualPath !== undefined) {
    console.log('Actual path ' + actualPath);
    return actualPath.substring(root.length);
  } else {
    return actualPath;
  }

}

module.exports = {
  createConnectConfig: createConnectConfig
};
