describe("console.js", function () {
    "use strict";

    var config, console = window.console;

    beforeEach(function () {
        console.log = function () {
        };
        console.info = function () {
        };
        console.warn = function () {
        };
        console.error = function () {
        };
        config = {serverUrl: "/logs"};
    });

    afterEach(function () {
        console.restore();
    });

    it("extends the window.console object", function () {
        expect(console).toBeDefined();
        expect(console.init).toBeDefined();
    });

    describe("readConfig", function () {

        it("is chainable", function () {
            // When
            var returns = console.readConfig(config);

            // Then
            expect(returns).toBe(console);
        });

        describe("levels", function () {

            it("sets a default value when invalid or not specified", function () {
                var defaultValue = ["info", "warn", "error"];

                expect(console.readConfig(config).config.levels).toEqual(defaultValue);

                config.levels = "invalid";
                expect(console.readConfig(config).config.levels).toEqual(defaultValue);

                config.levels = [];
                expect(console.readConfig(config).config.levels).toEqual(defaultValue);

                config.levels = ["", "  ", null];
                expect(console.readConfig(config).config.levels).toEqual(defaultValue);
            });

            it("cleans up given values", function () {
                config.levels = [" ", "error  ", 123, null];
                expect(console.readConfig(config).config.levels).toEqual(["error", "123"]);
            });

        });

        describe("levelEnabledOnServer", function () {

            it("sets a default value when invalid or not specified", function () {
                expect(console.readConfig(config).config.levelEnabledOnServer).toEqual("info");

                config.levelEnabledOnServer = "invalid";
                expect(console.readConfig(config).config.levelEnabledOnServer).toEqual("info");
            });

            it("cleans up given values", function () {
                config.levelEnabledOnServer = " warn ";
                expect(console.readConfig(config).config.levelEnabledOnServer).toEqual("warn");
            });

        });

        describe("levelForConsoleLog", function () {

            it("sets a default value when invalid or not specified", function () {
                expect(console.readConfig(config).config.levelForConsoleLog).toEqual("info");

                config.levelForConsoleLog = "invalid";
                expect(console.readConfig(config).config.levelForConsoleLog).toEqual("info");
            });

            it("cleans up given values", function () {
                config.levelForConsoleLog = " warn ";
                expect(console.readConfig(config).config.levelForConsoleLog).toEqual("warn");
            });

        });

        describe("levelForJavaScriptErrors", function () {

            it("sets a default value when invalid or not specified", function () {
                expect(console.readConfig(config).config.levelForJavaScriptErrors).toEqual("error");

                config.levelForJavaScriptErrors = "invalid";
                expect(console.readConfig(config).config.levelForJavaScriptErrors).toEqual("error");
            });

            it("cleans up given values", function () {
                config.levelForJavaScriptErrors = " warn ";
                expect(console.readConfig(config).config.levelForJavaScriptErrors).toEqual("warn");
            });

        });

        describe("serverUrl", function () {

            it("writes a log when invalid or not specified", function () {
                // Given
                config.serverUrl = "  ";
                spyOn(console, "log");

                // When
                console.readConfig(config);

                // Then
                expect(console.config.serverUrl).toBeFalsy();
                expect(console.log).toHaveBeenCalledWith("No server URL specified (serverUrl)");
            });

            it("cleans up given values", function () {
                config.serverUrl = " /logs ";
                expect(console.readConfig(config).config.serverUrl).toEqual("/logs");
            });

        });

        describe("logJavaScriptErrors", function () {

            it("sets a default value when not specified", function () {
                expect(console.readConfig(config).config.logJavaScriptErrors).toEqual(true);

                config.logJavaScriptErrors = "invalid";
                expect(console.readConfig(config).config.logJavaScriptErrors).toEqual(true);
            });

            it("cleans up given values", function () {
                config.logJavaScriptErrors = " true ";
                expect(console.readConfig(config).config.logJavaScriptErrors).toEqual(true);

                config.logJavaScriptErrors = false;
                expect(console.readConfig(config).config.logJavaScriptErrors).toEqual(false);

                config.logJavaScriptErrors = true;
                expect(console.readConfig(config).config.logJavaScriptErrors).toEqual(true);

                config.logJavaScriptErrors = " false ";
                expect(console.readConfig(config).config.logJavaScriptErrors).toEqual(false);
            });

        });

    });

    describe("addStackTrace", function () {

        it("returns the given data", function () {
            // When
            var data = {level: "info", message: "message"},
                returns = console.addStackTrace(data);

            // Then
            expect(returns).toBe(data);
        });

        it("does not add stack trace when stacktrace.js is not installed", function () {
            // Given
            var error = Error("Oops!"),
                data = {level: "info", message: "message", stackTrace: ""},
                printStackTrace = window.printStackTrace;
            error.stack = "line1\nline2";
            window.printStackTrace = null;

            // When
            console.addStackTrace(data, error);

            // Then
            expect(data.stackTrace).toBeUndefined();
            window.printStackTrace = printStackTrace;
        });

        it("does not add stack trace when no error is given", function () {
            // Given
            var data = {level: "info", message: "message", stackTrace: ""};

            // When
            console.addStackTrace(data);

            // Then
            expect(data.stackTrace).toBeUndefined();
        });

        it("does not add stack trace when the given error is not an Error", function () {
            // Given
            var data = {level: "info", message: "message", stackTrace: ""};

            // When
            console.addStackTrace(data, "Oops!");

            // Then
            expect(data.stackTrace).toBeUndefined();
        });

        it("adds the error stack trace when stacktrace.js is installed", function () {
            // Given
            var error = Error("Oops!"),
                data = {level: "info", message: "message"};
            error.stack = "line1\nline2";
            spyOn(window, "printStackTrace").and.callThrough();

            // When
            console.addStackTrace(data, error);

            // Then
            expect(data.stackTrace).toBeTruthy();
            expect(window.printStackTrace).toHaveBeenCalledWith({e: error});
        });

        it("transforms the stack trace into a multi-line string", function () {
            // Given
            var data = {level: "info", message: "message"};
            spyOn(window, "printStackTrace").and.returnValue(["Oops1", "Oops2"]);

            // When
            console.addStackTrace(data, Error("Oops!"));

            // Then
            expect(data.stackTrace).toBe("Oops1\nOops2");
        });

        it("does not break in case of stacktrace.js error", function () {
            // Given
            var data = {level: "info", message: "message", stackTrace: ""};
            spyOn(window, "printStackTrace").and.throwError();

            // When
            console.addStackTrace(data);

            // Then
            expect(data.stackTrace).toBeUndefined();
        });
    });

    describe("proxyConsoleFunctions", function () {

        it("is chainable", function () {
            // When
            var returns = console.readConfig(config)
                .proxyConsoleFunctions();

            // Then
            expect(returns).toBe(console);
        });

        it("creates a console.log function when it does not exist", function () {
            // Given
            var consoleLog = console.log;
            delete console.log;

            // When
            console.readConfig(config)
                .proxyConsoleFunctions();

            // Then
            expect(console.original.log).toBeDefined();
            expect(console.original.log).not.toBe(consoleLog);
            expect(console.log).toBeDefined();
            expect(console.log).not.toBe(console.original.log);
            console.log = consoleLog;
        });

        it("saves original functions", function () {
            // Given
            delete console.fatal;
            var originalConsoleLog = console.log,
                originalConsoleError = console.error;
            config.levels = ["log", "error", "fatal"];

            // When
            console.readConfig(config)
                .proxyConsoleFunctions();

            // Then
            expect(console.original.log).toBe(originalConsoleLog);
            expect(console.original.error).toBe(originalConsoleError);
            expect(console.original.fatal).toBeUndefined();
        });

        it("creates functions for each level", function () {
            // Given
            config.levels = ["level1", "level2"];

            // When
            console.readConfig(config)
                .proxyConsoleFunctions();

            // Then
            expect(console.level1).toBeDefined();
            expect(console.level2).toBeDefined();
            expect(console.level1).not.toBe(console.level2);
        });

        it("creates a function for log level, even when not specified", function () {
            // When
            console.readConfig(config)
                .proxyConsoleFunctions();

            // Then
            expect(console.log).toBe(console[console.config.levelForConsoleLog]);
        });

        describe("proxy functions", function () {

            it("call and return the result of the original function", function () {
                // Given
                var error = Error("Oops");
                spyOn(console, "warn").and.returnValue("warn");
                console.readConfig(config)
                    .proxyConsoleFunctions();

                // When
                var returns = console.warn("Message1", "Message2", error);

                // Then
                expect(returns).toEqual("warn");
                expect(console.original.warn).toHaveBeenCalledWith("Message1", "Message2", error);
            });

            it("call the 'send' function", function () {
                // Given
                console.readConfig(config)
                    .proxyConsoleFunctions();
                spyOn(console, "send").and.stub();

                // When
                console.warn("Message");

                // Then
                expect(console.send).toHaveBeenCalledWith({level: "warn", message: "Message"});
            });

            it("adds a stack trace when an error is given in the arguments", function () {
                // Given
                var error = Error("Oops!");
                console.readConfig(config)
                    .proxyConsoleFunctions();
                spyOn(console, "send").and.stub();
                spyOn(console, "addStackTrace").and.callFake(function (data, e) {
                    if (e === error) {
                        data.stackTrace = "Oops!";
                    }
                    return data;
                });

                // When
                console.warn("Message1", "Message2", error);

                // Then
                expect(console.send).toHaveBeenCalledWith({level: "warn", message: "Message1, Message2, Error: Oops!", stackTrace: "Oops!"});
            });

            it("do not break on error", function () {
                // Given
                console.readConfig(config)
                    .proxyConsoleFunctions();
                spyOn(console.original, "error").and.throwError();

                // When
                var onError = function() {
                    console.error("Message")
                };

                // Then
                expect(onError).not.toThrow();
            });

        });
    });

    describe("handleJavaScriptErrorsLogging", function () {

        it("is chainable", function () {
            // When
            var returns = console
                .readConfig(config)
                .handleJavaScriptErrorsLogging();

            // Then
            expect(returns).toBe(console);
        });

        it("replaces and writes a log when there is already a handler", function () {
            // Given
            var originalOnErrorHandler = function () {
            };
            window.onerror = originalOnErrorHandler;
            spyOn(console, "log").and.stub();

            // When
            console.readConfig(config)
                .handleJavaScriptErrorsLogging();

            // Then
            expect(window.onerror).toBeDefined();
            expect(window.onerror).not.toBe(originalOnErrorHandler);
            expect(console.log).toHaveBeenCalledWith("window.onerror will be overriden; you can prevent this by setting 'logJavaScriptErrors' to false");
        });

        it("creates a 'window.onerror' handler", function () {
            // When
            console.readConfig(config)
                .handleJavaScriptErrorsLogging();

            // Then
            expect(window.onerror).toBeDefined();
            expect(window.onerror).toBe(console.onError);
        });

        it("'window.onerror' handler sends error details to the server", function () {
            // Given
            console.readConfig(config)
                .handleJavaScriptErrorsLogging();
            spyOn(console, "addStackTrace").and.callFake(function (data) {
                data.stackTrace = "stackTrace";
                return data;
            });
            spyOn(console, "send");

            // When
            window.onerror("message", "fileName", "lineNumber", "columnNumber", "error");

            // Then
            expect(console.send).toHaveBeenCalledWith({
                level: "error",
                message: "[fileName:lineNumber:columnNumber] message",
                stackTrace: "stackTrace"
            });
        });

        it("does not create a 'window.onerror' handler when 'logJavaScriptErrors' is false", function () {
            // Given
            console.readConfig(config)
                .handleJavaScriptErrorsLogging();
            config.logJavaScriptErrors = false;

            // When
            console.readConfig(config)
                .handleJavaScriptErrorsLogging();

            // Then
            expect(window.onerror).toBeNull();
            expect(console.onError).toBeUndefined();
        });

        it("preserves the existing 'window.onerror' handler when 'logJavaScriptErrors' is false", function () {
            // Given
            var originalOnErrorHandler = function () {
            };
            window.onerror = originalOnErrorHandler;
            config.logJavaScriptErrors = false;

            // When
            console.readConfig(config)
                .handleJavaScriptErrorsLogging();

            // Then
            expect(window.onerror).toBe(originalOnErrorHandler);
            expect(console.onError).toBeUndefined();
            window.onerror = null;
        });

    });

    describe("send", function () {

        it("is chainable", function () {
            // When
            var returns = console
                .readConfig(config)
                .send();

            // Then
            expect(returns).toBe(console);
        });

        it("does not send if 'serverUrl' is not specified", function () {
            // Given
            spyOn(console, "createHttp");
            delete config.serverUrl;

            // When
            console.readConfig(config)
                .send({level: "info", message: "message"});

            // Then
            expect(console.createHttp).not.toHaveBeenCalled();
        });

        it("does not send if the level does not exist", function () {
            // Given
            spyOn(console, "createHttp");

            // When
            console.readConfig(config)
                .send({level: "fatal", message: "message"});

            // Then
            expect(console.createHttp).not.toHaveBeenCalled();
        });

        it("does not send if the level is lower than the 'levelEnabledOnServer'", function () {
            // Given
            spyOn(console, "createHttp");
            config.levelEnabledOnServer = "warn";

            // When
            console.readConfig(config)
                .send({level: "info", message: "message"});

            // Then
            expect(console.createHttp).not.toHaveBeenCalled();
        });

        it("sends the log to the server if the level is equal to the 'levelEnabledOnServer'", function () {
            // Given
            var http = jasmine.createSpyObj("http", ["open", "setRequestHeader", "send"]);
            spyOn(console, "createHttp").and.returnValue(http);
            config.levelEnabledOnServer = "warn";

            // When
            console.readConfig(config)
                .send({level: "warn", message: "messageWarn"});

            // Then
            expect(console.createHttp).toHaveBeenCalled();
            expect(http.open).toHaveBeenCalledWith("POST", config.serverUrl, true);
            expect(http.setRequestHeader).toHaveBeenCalledWith("Content-Type", "application/json");
            expect(http.send).toHaveBeenCalledWith('{"level":"warn","message":"messageWarn"}');
        });

        it("sends the log to the server if the level is greater than the 'levelEnabledOnServer'", function () {
            // Given
            var http = jasmine.createSpyObj("http", ["open", "setRequestHeader", "send"]);
            spyOn(console, "createHttp").and.returnValue(http);
            config.levelEnabledOnServer = "warn";

            // When
            console.readConfig(config)
                .send({level: "error", message: "messageError"});

            // Then
            expect(console.createHttp).toHaveBeenCalled();
            expect(http.open).toHaveBeenCalledWith("POST", config.serverUrl, true);
            expect(http.setRequestHeader).toHaveBeenCalledWith("Content-Type", "application/json");
            expect(http.send).toHaveBeenCalledWith('{"level":"error","message":"messageError"}');
        });


        it("does not break if 'createHttp' does not work", function () {
            // Given
            spyOn(console, "createHttp").and.returnValue(null);
            config.levelEnabledOnServer = "warn";

            // When
            var returns = console.readConfig(config)
                .send({level: "error", message: "messageError"});

            // Then
            expect(returns).toBe(console);
        });
    });

    describe("init", function () {

        it("is chainable", function () {
            // When
            var returns = console.init(config);

            // Then
            expect(returns).toBe(console);
        });

        it("first restores the original console", function () {
            // Given
            spyOn(console, "restore").and.callThrough();

            // When
            console.init(config);

            // Then
            expect(console.restore).toHaveBeenCalled();
        });

        it("reads the given configuration", function () {
            // Given
            spyOn(console, "readConfig").and.callThrough();

            // When
            console.init(config);

            // Then
            expect(console.readConfig).toHaveBeenCalledWith(config);
        });

        it("creates or overrides log functions", function () {
            // Given
            spyOn(console, "proxyConsoleFunctions").and.callThrough();

            // When
            console.init(config);

            // Then
            expect(console.proxyConsoleFunctions).toHaveBeenCalled();
        });

        it("handles JavaScript errors logging", function () {
            // Given
            spyOn(console, "handleJavaScriptErrorsLogging").and.callThrough();

            // When
            console.init(config);

            // Then
            expect(console.handleJavaScriptErrorsLogging).toHaveBeenCalled();
        });

    });

    describe("restore", function () {

        it("is chainable", function () {
            // When
            var returns = console.restore();

            // Then
            expect(returns).toBe(console);
        });

        it("disables JavaScript errors handling", function () {
            // Given
            console.readConfig(config)
                .handleJavaScriptErrorsLogging();
            spyOn(console, "handleJavaScriptErrorsLogging").and.callFake(function () {
                expect(console.config.logJavaScriptErrors).toBe(false);
            });

            // When
            console.restore();

            // Then
            expect(console.handleJavaScriptErrorsLogging).toHaveBeenCalled();
        });

        it("restores original log functions", function () {
            // Given
            var originalConsoleLog = console.log,
                originalConsoleInfo = console.info,
                originalConsoleWarn = console.warn,
                originalConsoleError = console.error;

            console.readConfig(config)
                .proxyConsoleFunctions();

            // When
            console.restore();

            // Then
            expect(console.original).toBeUndefined();
            expect(console.log).toBe(originalConsoleLog);
            expect(console.info).toBe(originalConsoleInfo);
            expect(console.warn).toBe(originalConsoleWarn);
            expect(console.error).toBe(originalConsoleError);
        });

        it("cleans up the configuration", function () {
            // Given
            console.readConfig(config);

            // When
            console.restore();

            // Then
            expect(console.config).toBeUndefined();
        });

        it("keeps functions needed for re-initiating the console", function () {
            // When
            console.restore();

            // Then
            expect(console.init).toBeDefined();
        });

    });
});