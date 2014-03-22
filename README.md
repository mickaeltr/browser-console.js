# console.js [![Build Status](https://travis-ci.org/mickaeltr/console.js.svg?branch=master)](https://travis-ci.org/mickaeltr/console.js)

JavaScript console that sends logs and unexpected JavaScript errors to a remote server.

## Why?

You have plenty of logs for your server-side applications but you do not know much about your client-side. You need to know what is happening there too.

## Usage

Insert [console.js](https://github.com/mickaeltr/console.js), initialize the console and play with it:

```html
<script src="lib/console.js"></script>
<script>
    console.init({
        serverUrl: "/logs"
    });
    console.warn("Writes a warning log in the JS console and sends it to the server");
    console.xxxx("Sends an unexpected JS error to the server, as there is no 'xxxx' level/method");
</script>
```

The following requests will be sent (`POST`) to the server URL (`/logs`):

```json
{
    "level": "warn",
    "message": "[http://localhost:1337/] Writes a warning log in the JS console and sends it to the server"
}
```

```json
{
    "level": "error",
    "message": "[http://localhost:1337/] TypeError: console.xxxx is not a function - http://localhost:1337/:135"
}
```

Your server needs to handle `POST` requests on the server URL and exploit the logs. See a node.js example at `server/server.js`.

## Configuration

**serverUrl**

* Default value: none
* Description: URL of the server for sending logs

**levels**

* Default value: `["info", "warn", "error"]`
* Description: array of log levels, from the less critical to the most critical; for each level, a method is created on the console object.

**levelEnabledOnServer**

* Default value: first item in the levels list
* Description: minimum level for sending logs to the server

**levelForConsoleLog**

* Default value: first item in the levels list
* Description: level used for `console.log` calls

**levelForJavaScriptErrors**

* Default value: last item in the levels list
* Description: level used for JavaScript errors logging

**disableJavaScriptErrorsLogging**

* Default value: `false`
* Description: flag for disabling the logging of JavaScript errors (`window.onerror`)

## Development

### Run unit tests

#### In the console

```bash
grunt jasmine
grunt watch:jasmine # with live reloading
```

#### In a browser

```bash
grunt jasmine:build
grunt jasmine:build watch:jasmine-build # with livereloading
```
then open file **.grunt/SpecRunner.html** in a browser

### Generate minified and source map files

```bash
grunt uglify
```

### Clean up the project

```bash
grunt clean
```

## About

[Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0.html)

This project was inspired by [RESTHub](http://resthub.org/)'s [console.js](https://github.com/resthub/resthub-backbone-stack/blob/master/js/lib/resthub/console.js).
