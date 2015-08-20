var send = require('send')
  , utils = require('connect/lib/utils')
  , parse = utils.parseUrl
  , url = require('url');

var templateProxy = function(brandName, contentRoot) {

  var redirect = false;
  var root = contentRoot + brandName;

  var rewriter = function(req, res, next) {
    if ('GET' != req.method && 'HEAD' != req.method) return next();
    var originalUrl = url.parse(req.originalUrl);
    var path = parse(req).pathname;
    var pause = utils.pause(req);

    var isTemplate = path.indexOf('/templates') == 0;
    var isImage = path.indexOf('/images') == 0;

    //grunt.log.writeln('Check path',path,isTemplate,isImage);

    if(!isTemplate && !isImage) {
      return next();
    } else {
      // Strip either /templates or /images off the front
      if(isTemplate) {
        path = path.substring(11);
      }

      //grunt.log.writeln('Reduced path',path);
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
      //grunt.log.writeln('Brand is in image path',path.split(brandName));
      path = path.split(brandName).join('');
    }

    //if(isImage) {
    //  grunt.log.writeln('IMAGE',path,root)
    //} else {
    //  grunt.log.writeln('TEMPLATE', path, root);
    //}


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
  templateProxy: templateProxy
};