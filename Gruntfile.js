module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        browserify: {
            target: {
                files: {
                    "./fullscrn.js": [ "./index.js" ]
                }
            },
            test: {
                files: {
                    "./test/bundle-fullscrn.test.js":
                        [ "./test/fullscrn.test.js" ]
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
    grunt.loadNpmTasks("grunt-contrib-uglify-es");
    grunt.registerTask('lint', [ "eslint"]);
    grunt.loadNpmTasks('grunt-md2html');
    grunt.registerTask("default", [ "lint", "browserify", "uglify" ]);
    grunt.registerTask("test", [ "lint", "browserify:test" ]);
};
