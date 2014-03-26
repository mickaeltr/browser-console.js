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
    console.warn("Writes a warning log in the JS console and sends it to the server", new Error("Oops"));
    console.xxxx("Sends an unexpected JS error to the server, as there is no 'xxxx' level/method");
</script>
```

The following requests will be sent (`POST`) to the server URL (`/logs`):

```json
{
    "level": "warn",
    "message": "Writes a warning log in the JS console and sends it to the server, Error: Oops!"
}
```

```json
{
    "level": "error",
    "message": "[http://localhost:1337/:16] TypeError: console.xxxx is not a function"
}
```

HTTP headers of `POST` requests can be useful too:

```
Referer: http://localhost:1337/
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:28.0) Gecko/20100101 Firefox/28.0
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

**logJavaScriptErrors**

* Default value: `true`
* Description: activation flag for logging JavaScript errors (`window.onerror`)

## Bonus

Optionally insert [stacktrace.js](https://github.com/stacktracejs/stacktrace.js) and you will get stack traces for errors:

```json
{
    "level": "warn",
    "message": "Writes a warning log in the JS console and sends it to the server, Error: Oops!",
    "stackTrace": "{anonymous}()@http://localhost:1337/:15"
}
```

It works better in browsers that fully support the HTML 5 draft spec for [ErrorEvent](http://www.w3.org/html/wg/drafts/html/master/webappapis.html#the-errorevent-interface)
and [window.onerror](http://www.w3.org/html/wg/drafts/html/master/webappapis.html#onerroreventhandler):

## Development

### Prerequisites

* [node.js](http://nodejs.org/)
* [Grunt](http://gruntjs.com/)

### Run unit tests

#### In the console

```bash
grunt jasmine
grunt watch:jasmine # with live reloading
```

#### In a browser

```bash
grunt jasmine:console:build
grunt jasmine:console:build watch:jasmine-build # with livereloading
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
