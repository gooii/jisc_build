var send = require('send')
  , utils = require('connect/lib/utils')
  , parse = require('parseUrl')
  , url = require('url')
  , modRewrite = require('connect-modrewrite')
  , path = require('path')
  , proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest
  , _ = require('lodash');

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

  _.each(brands, function(brand) {
    middlewares.push(templateProxy(brand, contentRoot));
  });

  return middlewares;
};

templateProxy = function(brandName, contentRoot) {

  var redirect = false;
  var root = contentRoot + brandName;

  var rewriter = function(req, res, next) {
    if ('GET' != req.method && 'HEAD' != req.method) return next();
    var originalUrl = url.parse(req.originalUrl);
    var path = parse(req).pathname;
    var pause = utils.pause(req);

    var isTemplate = path.indexOf('/templates') == 0;
    var isImage = path.indexOf('/images') == 0;

    //console.log('Check path',path,isTemplate,isImage);

    if(!isTemplate && !isImage) {
      return next();
    } else {
      // Strip either /templates or /images off the front
      if(isTemplate) {
        path = path.substring(11);
      }

      //console.log('Reduced path',path);
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

    if(isTemplate && (path.indexOf(brandName) == 0)) {
      path = path.substring(brandName.length);
    } else if(isImage && (path.indexOf(brandName) != -1)) {
      //console.log('Brand is in image path',path.split(brandName));
      path = path.split(brandName).join('');
    }

    if(isImage) {
      //console.log('IMAGE',path,root)
    } else {
      //console.log('TEMPLATE', path, root);
    }


    send(req, path)
      .maxage(0)
      .root(root)
      .index('index.html')
      .on('error', error)
      .on('directory', directory)
      .pipe(res);
  };
  return rewriter;
};

module.exports = {
  createConnectConfig: createConnectConfig
};
