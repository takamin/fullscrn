module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        browserify: {
            target: {
                files: {
                    "./fullscrn.js": [ "./index.js" ]
                }
            }
        },
        uglify: {
            target: {
                files: {
                    "./fullscrn.min.js" : [ "./fullscrn.js" ]
                }
            }
        },
        eslint: {
            files: [
                './index.js',
                './lib/web-dlog.js',
                './lib/document-ready.js'
            ]
        }
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.registerTask('lint', [ "eslint"]);
    grunt.registerTask("default", [ "lint", "browserify", "uglify" ]);
};
