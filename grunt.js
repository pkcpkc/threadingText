module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        qunit: {
            files: ['Tests/tests.html']
        }
    });

    // Load plugin
    grunt.loadNpmTasks('grunt-contrib-qunit');

    // Task to run tests
    grunt.registerTask('test', 'qunit');
};