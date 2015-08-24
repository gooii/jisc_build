module.exports = {

  bowerinstall: {
    command: function(libname) {
      return 'bower install ' + libname + ' -S';
    }
  },
  bowerupdate: {
    command: function(libname) {
      return 'bower update ' + libname;
    }
  },
  bowerlink: {
    command: function(libname) {
      return 'bower link ' + libname
    }
  }
};