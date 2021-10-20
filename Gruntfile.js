module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      src: ['src/**/*.js'],
      options: {
        browser: true,
        indent: 2,
        white: false,
        evil: true,
        regexdash: true,
        wsh: true,
        trailing: true,
        eqnull: true,
        expr: true,
        boss: true,
        node: true,
        strict: false
      }
    },

    qunit: {
      all: {
        options: {
          urls: ['http://localhost:8000/test/test.html']
        }
      }
    },

    connect: {
      server: {
        options: {
          base: './'
        }
      }
    },

    concat: {
      options: {
        stripBanners: true,
        banner: '//\n' +
          '// <%= pkg.name %> - v<%= pkg.version %>\n' +
          '// The MIT License\n' +
          '// Copyright (c) 2012 The New York Times, CMS Group, Matthew DeLambo <delambo@gmail.com> \n' +
          '//\n'
      },
      dist: {
        src: ['lib/rangy/rangy-core.js', 'src/polyfills.js', 'src/ice.js', 'src/dom.js', 'src/bookmark.js', 'src/selection.js', 'src/icePlugin.js', 'src/icePluginManager.js', 'src/plugins/IceAddTitlePlugin/IceAddTitlePlugin.js', 'src/plugins/IceCopyPastePlugin/IceCopyPastePlugin.js', 'src/plugins/IceSmartQuotesPlugin/IceSmartQuotesPlugin.js', 'src/plugins/IceEmdashPlugin/IceEmdashPlugin.js'],
        dest: 'dist/ice.js'
      }
    },

    uglify: {
      options: {
        beautify : {
          ascii_only: true,
          beautify: false
        },
        preserveComments: false,
        banner: '//\n' +
          '// <%= pkg.name %> - v<%= pkg.version %>\n' +
          '// The MIT License\n' +
          '// Copyright (c) 2012 The New York Times, CMS Group, Matthew DeLambo <delambo@gmail.com> \n' +
          '//\n'
      },
      ice: {
        files: {
          'dist/ice.min.js': ['dist/ice.js']
        }
      },
      icemaster: {
        options: {
          banner: '//\n' +
            '// <%= pkg.name %> - Master\n' +
            '// The MIT License\n' +
            '// Copyright (c) 2012 The New York Times, CMS Group, Matthew DeLambo <delambo@gmail.com>\n' +
            '//\n'
        },
        files: {
          'ice-master.min.js': ['dist/ice.js']
        }
      },
      tinyice: {
        files: {
          'dist/ice_editor_plugin.js': 'lib/tinymce/js/tinymce/plugins/ice/plugin.min.js'
        }
      },
      tinysr: {
        files: {
          'dist/sr_editor_plugin.js': 'lib/tinymce/js/tinymce/plugins/icesearchreplace/plugin.min.js'
        }
      }
    },

    compress: {
      gz: {
        options: {
          mode: 'gzip'
        },
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['ice.min.js'],
          dest: 'dist/',
          ext: '.min.gz'
        }]
      },
      zip: {
        options: {
          archive: 'dist/ice_<%= pkg.version %>.zip'
        },
        files: [{
          expand:true,
          src: ['dist/**']
        }]
      }
    },

    clean: {
      build: ['dist']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('test', ['connect', 'qunit']);

  grunt.registerTask('build', ['clean:build', 'concat', 'uglify:ice', 'uglify:icemaster', 'compress:gz', 'cp', 'compress:zip']);

  grunt.registerTask('package', ['clean:build', 'concat', 'compress:gz', 'cp', 'compress:zip']);

  grunt.registerTask('cp', function() {
    cpTinyDir('ice');
    //grunt.file.delete('dist/ice_editor_plugin.js');

    cpTinyDir('icesearchreplace');
    //grunt.file.delete('dist/sr_editor_plugin.js');
  });

  var cpTinyDir = function(dir) {
    grunt.file.recurse('lib/tinymce/js/tinymce/plugins/' + dir + '/', function(abspath, rootdir, subdir, filename) {
      grunt.file.copy(rootdir + '/' + (subdir ? subdir + '/' : '') + filename,'dist/tinymce/plugins/' + dir + '/' + (subdir ? subdir + '/' : '') + '/' + filename);
    });
  };
};
