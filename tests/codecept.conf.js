exports.config = {
  tests: './*_test.js',
  output: './output',
  helpers: {
    WebDriver: {
      url: 'http://localhost:6001',
      browser: 'chrome'
    }
  },
  include: {
    I: './steps_file.js'
  },
  bootstrap: null,
  mocha: {},
  name: 'tests'
}