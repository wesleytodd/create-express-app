# Scaffold an Express App

Scaffold out an [Express app](https://www.npmjs.com/package/express).

## Usage

```
$ npm init express-app
$ npmx create-express-app
```

With `npm@6` this will run this package with `npx`.  If you are on an earlier version of `npm` you will
need to install globally and run directly:

```
$ npm install -g create-express-app
$ create-express-app
```

### CLI Usage

```
$ create-express-app --help

Usage: create-express-app [options] <directory>

Options:
  -V, --version                      output the version number
  --extended                         Show extended option prompts (ex. browser, engines, etc)
  --force                            Force overwrite files
  --no-prompt                        Skip prompts and just use input options
  --name [name]                      The package name
  --app-type [type]                  The app type, determines template and defaults
  --view-engine [type]               The view engine to use (default ejs)
  --body-parser                      Install and use the body-parser package
  --consolidate                      Install and use the consolidate package
  --cookie-parser                    Install and use the cookie-parser package
  --serve-static                     Install and use the serve-static package
  --dependencies [dependencies]      Package dependencies
  --dev-dependencies [dependencies]  Package dev dependencies
  --main [main]                      The app main entry script
  -h, --help                         output usage information
```

### Programmatic Usage

```javascript
const createExpressApp = require('create-express-app')

(async () => {
  // Will create an express app in the current directoy
  await createExpressApp({
    noPrompt: false,
    extended: false,
    silent: false,
    name: 'my-app'
    directory: process.cwd(),
    appType: 'bare',
    viewEngine: 'ejs',
    bodyParser: false,
    consolidate: false,
    cookieParser: false,
    serveStatic: false,
    dependencies: [],
    devDependencies: [],
    main: 'index.js'
  })
})()
```

After that you should be able to start with running:

```
$ npm run start
```
