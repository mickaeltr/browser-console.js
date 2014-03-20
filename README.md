# console.js

JavaScript console that sends logs to a remote server.
It also catches and send unexpected JavaScript global errors.

## Why?

You have plenty of logs for your server-side applications.
You need to know what is happening on your client-side applications too.

## Usage

First insert [jQuery](http://jquery.com/) (or [Zepto](http://zeptojs.com/)):
``<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js"></script>``

Then insert [console.js](https://github.com/mickaeltr/console.js):
``<script src="console.js"></script>``

Finally initialize the console and play with it!

```
<script>
    console.init({
        serverUrl: "/logs"
    });
    console.warn("Writes a warning log in the JS console and sends it to the server");
</script>
```

This will be sent (POST) to the server URL:

```
{
    "level": "warn",
    "message": "[url] Writes a warning log in the JS console and sends it to the server"
}
```

## Configuration

**levels**

* Default value: `["info", "warn", "error"]`
* Description: array of log levels, from the less critical to the most critical; for each level, a method will be created on the console object.

**levelEnabledOnServer**

* Default value: first item in the levels list
* Description: minimum level that will be sent to the server

**levelForConsoleLog**

* Default value: first item in the levels list
* Description: level that will be associated to the console.log calls

**levelForGlobalErrors**

* Default value: last item in the levels list
* Description: level that will be associated to the JavaScript global errors

**serverUrl**

* Default value: none
* Description: URL of the server that will receive log POST requests

**disableOnErrorHandler**

* Default value: `false`
* Description: Flag for disabling the handling of global JavaScript errors (`window.onerror`)