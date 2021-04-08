// Karma configuration
// Generated on Sat Jan 07 2017 22:42:18 GMT-0600 (CST)

module.exports = function(config) {
  const settings = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: 'web/lib/appContext/**/*.js', type: 'module', included: false },
      { pattern: 'web/lib/arrivalPie/**/*.js', type: 'module', included: false },
      { pattern: 'web/lib/authMgr/**/*.js', type: 'module', included: false },
      { pattern: 'web/lib/littleDropDown/**/*.js', type: 'module', included: false },
      { pattern: 'web/lib/styleGuide/**/*.js', type: 'module', included: false },
      { pattern: 'web/lib/test/**/*.js', type: 'module', included: false },
      { pattern: 'web/common/**/*.js', type: 'module', included: false },
      { pattern: 'web/**/*.json', included: false },
      { pattern: 'web/lib/testMain.js', type: 'module', included: true },
      { pattern: 'node_modules/i18next/*.js', type: 'module', included: false },
      { pattern: 'node_modules/lit-html/*.js', type: 'module', included: false },
      { pattern: 'node_modules/lit-html/lib/*.js', type: 'module', included: false },
      { pattern: 'node_modules/font-awesome/css/*.css', included: false },
      { pattern: 'node_modules/purecss/build/*.css', included: false },
    ],

    // list of files to exclude
    exclude: [
      'web/lib/test/littleJasmineBoot.js',
      'web/lib/**/main.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },
    // relative paths are a little weird
    proxies: {
      '/i18next': '/base/node_modules/i18next',
      '/lit-html': '/base/node_modules/lit-html',
      '/modules/font-awesome': '/base/node_modules/font-awesome',
      '/modules/purecss': '/base/node_modules/purecss'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],
    customLaunchers: {
      // see https://github.com/karma-runner/karma-chrome-launcher/issues/158
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  };
  
  if (process.env['LITTLE_INTERACTIVE'] === 'false') {
    settings.singleRun = true;
    settings.browsers = ['ChromeHeadlessNoSandbox'];
  }
  config.set(settings);
}
