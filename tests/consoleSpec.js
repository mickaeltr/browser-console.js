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

        describe("disableJavaScriptErrorsLogging", function () {

            it("sets a default value when not specified", function () {
                expect(console.readConfig(config).config.disableJavaScriptErrorsLogging).toEqual(false);

                config.disableJavaScriptErrorsLogging = "invalid";
                expect(console.readConfig(config).config.disableJavaScriptErrorsLogging).toEqual(false);
            });

            it("cleans up given values", function () {
                config.disableJavaScriptErrorsLogging = " true ";
                expect(console.readConfig(config).config.disableJavaScriptErrorsLogging).toEqual(true);

                config.disableJavaScriptErrorsLogging = " false ";
                expect(console.readConfig(config).config.disableJavaScriptErrorsLogging).toEqual(false);
            });

        });

    });

    describe("createOrOverrideLogFunctions", function () {

        it("is chainable", function () {
            // When
            var returns = console.readConfig(config)
                .createOrOverrideLogFunctions();

            // Then
            expect(returns).toBe(console);
        });

        it("creates a console.log function when it does not exist", function () {
            // Given
            var consoleLog = console.log;
            delete console.log;

            // When
            console.readConfig(config)
                .createOrOverrideLogFunctions();

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
                .createOrOverrideLogFunctions();

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
                .createOrOverrideLogFunctions();

            // Then
            expect(console.level1).toBeDefined();
            expect(console.level2).toBeDefined();
            expect(console.level1).not.toBe(console.level2);
        });

        it("creates a function for log level, even when not specified", function () {
            // When
            console.readConfig(config)
                .createOrOverrideLogFunctions();

            // Then
            expect(console.log).toBe(console[console.config.levelForConsoleLog]);
        });

        describe("new functions", function () {

            it("call and return the result of the original function", function () {
                // Given
                spyOn(console, "warn").and.returnValue("warn");
                console.readConfig(config)
                    .createOrOverrideLogFunctions();

                // When
                var returns = console.warn("Message", "[1]");

                // Then
                expect(returns).toEqual("warn");
                expect(console.original.warn).toHaveBeenCalledWith("Message, [1]");
            });

            it("call the 'send' function", function () {
                // Given
                console.readConfig(config)
                    .createOrOverrideLogFunctions();
                spyOn(console, "send").and.stub();

                // When
                console.warn("Message", "[2]");

                // Then
                expect(console.send).toHaveBeenCalledWith("warn", "Message, [2]");
            });

            it("do not break on error", function () {
                // Given
                console.readConfig(config)
                    .createOrOverrideLogFunctions();
                spyOn(console.original, "error").and.throwError("error");

                // When
                console.error("Message");
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
            expect(console.log).toHaveBeenCalledWith("window.onerror will be overriden; you can prevent this by setting 'disableJavaScriptErrorsLogging' to true");
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
            spyOn(console, "send");
            console.readConfig(config)
                .handleJavaScriptErrorsLogging();

            // When
            window.onerror("message", "fileName", "lineNumber", "columnNumber", "error");

            // Then
            expect(console.send).toHaveBeenCalledWith("error", "message (error) - fileName:lineNumber:columnNumber");
        });

        it("does not create a 'window.onerror' handler when 'disableJavaScriptErrorsLogging' is truthy", function () {
            // Given
            console.readConfig(config)
                .handleJavaScriptErrorsLogging();
            config.disableJavaScriptErrorsLogging = true;

            // When
            console.readConfig(config)
                .handleJavaScriptErrorsLogging();

            // Then
            expect(window.onerror).toBeNull();
            expect(console.onError).toBeUndefined();
        });

        it("preserves the existing 'window.onerror' handler when 'disableJavaScriptErrorsLogging' is truthy", function () {
            // Given
            var originalOnErrorHandler = function () {
            };
            window.onerror = originalOnErrorHandler;
            config.disableJavaScriptErrorsLogging = true;

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
                .send("info", "message");

            // Then
            expect(console.createHttp).not.toHaveBeenCalled();
        });

        it("does not send if there is no message", function () {
            // Given
            spyOn(console, "createHttp");

            // When
            console.readConfig(config)
                .send("info", "");

            // Then
            expect(console.createHttp).not.toHaveBeenCalled();
        });

        it("does not send if the level is lower than the 'levelEnabledOnServer'", function () {
            // Given
            spyOn(console, "createHttp");
            config.levelEnabledOnServer = "warn";

            // When
            console.readConfig(config)
                .send("info", "message");

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
                .send("warn", "messageWarn");

            // Then
            expect(console.createHttp).toHaveBeenCalled();
            expect(http.open).toHaveBeenCalledWith("POST", config.serverUrl, true);
            expect(http.setRequestHeader).toHaveBeenCalledWith("Content-Type", "application/json");
            expect(http.send).toHaveBeenCalledWith('{"level":"warn","message":"[' + window.location + '] messageWarn"}');
        });

        it("sends the log to the server if the level is greater than the 'levelEnabledOnServer'", function () {
            // Given
            var http = jasmine.createSpyObj("http", ["open", "setRequestHeader", "send"]);
            spyOn(console, "createHttp").and.returnValue(http);
            config.levelEnabledOnServer = "warn";

            // When
            console.readConfig(config)
                .send("error", "messageError");

            // Then
            expect(console.createHttp).toHaveBeenCalled();
            expect(http.open).toHaveBeenCalledWith("POST", config.serverUrl, true);
            expect(http.setRequestHeader).toHaveBeenCalledWith("Content-Type", "application/json");
            expect(http.send).toHaveBeenCalledWith('{"level":"error","message":"[' + window.location + '] messageError"}');
        });


        it("does not break if 'createHttp' does not work", function() {
            // Given
            spyOn(console, "createHttp").and.returnValue(null);
            config.levelEnabledOnServer = "warn";

            // When
            console.readConfig(config)
                .send("error", "messageError");
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
            spyOn(console, "createOrOverrideLogFunctions").and.callThrough();

            // When
            console.init(config);

            // Then
            expect(console.createOrOverrideLogFunctions).toHaveBeenCalled();
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
                expect(console.config.disableJavaScriptErrorsLogging).toBe(true);
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
                .createOrOverrideLogFunctions();

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
            expect(console.config).toBe(undefined);
        });

        it("keeps functions needed for re-initiating the console", function () {
            // When
            console.restore();

            // Then
            expect(console.init).toBeDefined();
        });

    });
});