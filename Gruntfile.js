module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: './*.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      options: {
        livereload: true,
      },
      client: {
        files: ['client/*', 'client/css/*', 'client/app/*', 'client/app/**/*']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['watch']);
  // grunt.registerTask('watch', ['watch']);
};