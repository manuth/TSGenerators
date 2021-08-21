import { notStrictEqual, ok, strictEqual } from "assert";
import { EOL } from "os";
import { isAbsolute, join, normalize, sep } from "path";
import { createInterface, Interface, ReadLine } from "readline";
import inquirer = require("inquirer");
import mock = require("mock-require");
import { MockSTDIN, stdin } from "mock-stdin";
import MuteStream = require("mute-stream");
import { createSandbox, SinonExpectation, SinonMock, SinonSandbox, stub } from "sinon";
import { IPathPromptRootDescriptor } from "../../../../Components/Inquiry/Prompts/IPathPromptRootDescriptor";
import { IPathQuestion } from "../../../../Components/Inquiry/Prompts/IPathQuestion";
import { PathPrompt } from "../../../../Components/Inquiry/Prompts/PathPrompt";
import { PromptCallback } from "../../../../Components/Inquiry/Prompts/PromptCallback";
import { TestContext } from "../../../TestContext";

/**
 * Registers tests for the {@link PathPrompt `PathPrompt<T>`}
 */
export function PathPromptTests(): void
{
    suite(
        nameof(PathPrompt),
        () =>
        {
            /**
             * Provides an implementation of the {@link PathPrompt `PathPrompt<T>`} class for testing.
             */
            class TestPathPrompt extends PathPrompt<IPathQuestion>
            {
                /**
                 * @inheritdoc
                 */
                public override rl: Interface;

                /**
                 * @inheritdoc
                 */
                public override opt: inquirer.prompts.PromptOptions<IPathQuestion>;

                /**
                 * @inheritdoc
                 */
                public override get Initialized(): boolean
                {
                    return super.Initialized;
                }

                /**
                 * @inheritdoc
                 */
                public override get InitialInput(): boolean
                {
                    return super.InitialInput;
                }

                /**
                 * @inheritdoc
                 */
                public override get RootDir(): string
                {
                    return super.RootDir;
                }

                /**
                 * @inheritdoc
                 */
                public override set RootDir(value: string)
                {
                    super.RootDir = value;
                }

                /**
                 * @inheritdoc
                 */
                public override get AllowOutside(): boolean
                {
                    return super.AllowOutside;
                }

                /**
                 * @inheritdoc
                 */
                public override set AllowOutside(value: boolean)
                {
                    super.AllowOutside = value;
                }

                /**
                 * @inheritdoc
                 *
                 * @param callback
                 * The callback for resolving the result.
                 */
                public override async _run(callback: PromptCallback): Promise<void>
                {
                    super._run(callback);
                }

                /**
                 * @inheritdoc
                 */
                public override async Initialize(): Promise<void>
                {
                    return super.Initialize();
                }

                /**
                 * @inheritdoc
                 *
                 * @param error
                 * The last error that occurred.
                 */
                public override render(error?: any): void
                {
                    super.render(error);
                }

                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The question-string.
                 */
                public override getQuestion(): string
                {
                    return super.getQuestion();
                }

                /**
                 * @inheritdoc
                 */
                public override ProcessAnswer(): void
                {
                    super.ProcessAnswer();
                }

                /**
                 * @inheritdoc
                 */
                public override ClearLine(): void
                {
                    super.ClearLine();
                }

                /**
                 * @inheritdoc
                 */
                public override OnInitialInputPerformed(): void
                {
                    super.OnInitialInputPerformed();
                }

                /**
                 * @inheritdoc
                 *
                 * @param input
                 * The input to filter.
                 *
                 * @returns
                 * The filtered input.
                 */
                public override filterInput(input: string): string
                {
                    return super.filterInput(input);
                }

                /**
                 * @inheritdoc
                 *
                 * @param path
                 * The path to validate.
                 *
                 * @returns
                 * Either a {@link Boolean `boolean`} indicating whether an error occurred or a {@link String `string`} describing an error.
                 */
                public override ValidatePath(path: string): boolean | string
                {
                    return super.ValidatePath(path);
                }

                /**
                 * @inheritdoc
                 *
                 * @param eventArgs
                 * An object which contains event-data.
                 */
                public override onError(eventArgs: inquirer.prompts.FailedPromptStateData): void
                {
                    super.onError(eventArgs);
                }

                /**
                 * @inheritdoc
                 *
                 * @param eventArgs
                 * An object which contains event-data.
                 */
                public override onEnd(eventArgs: inquirer.prompts.SuccessfulPromptStateData): void
                {
                    super.onEnd(eventArgs);
                }
            }

            let context = TestContext.Default;
            let mockedInput: MockSTDIN;
            let readLine: ReadLine;
            let question: IPathQuestion;
            let prompt: TestPathPrompt;
            let runner: Promise<any>;

            /**
             * Creates a new {@link PathPrompt `PathPrompt<T>`}.
             *
             * @returns
             * The new prompt.
             */
            function GetPrompt(): TestPathPrompt
            {
                return new TestPathPrompt(question, readLine, {});
            }

            /**
             * Starts running the prompt.
             */
            function StartPrompt(): void
            {
                runner = prompt.run();
            }

            /**
             * Types the specified {@link text `text`}.
             *
             * @param text
             * The text to type.
             */
            async function Type(text: string): Promise<void>
            {
                return new Promise(
                    (resolve) =>
                    {
                        process.nextTick(
                            () =>
                            {
                                mockedInput.send(text);
                                resolve();
                            });
                    });
            }

            /**
             * Sends an enter key-press to the prompt.
             */
            async function Enter(): Promise<void>
            {
                return Type(EOL);
            }

            /**
             * Finishes running the prompt.
             */
            async function EndPrompt(): Promise<void>
            {
                Enter();
                await runner;
            }

            /**
             * Runs the prompt.
             */
            async function RunPrompt(): Promise<void>
            {
                StartPrompt();
                Type("test");
                await EndPrompt();
            }

            setup(
                () =>
                {
                    let muteStream = new MuteStream();
                    muteStream.pipe(process.stdout);
                    mockedInput = stdin();

                    readLine = createInterface(
                        {
                            terminal: true,
                            input: process.stdin,
                            output: muteStream
                        });

                    question = {
                        type: PathPrompt.TypeName,
                        name: "test"
                    };

                    prompt = GetPrompt();
                });

            teardown(
                async () =>
                {
                    await EndPrompt();
                    readLine.close();
                    mockedInput.restore();
                });

            suite(
                nameof(PathPrompt.constructor),
                () =>
                {
                    let sandbox: SinonSandbox;
                    let mockedPrompt: SinonMock;
                    let mockedValidator: SinonExpectation;

                    setup(
                        () =>
                        {
                            sandbox = createSandbox();
                            mockedPrompt = sandbox.mock(prompt);
                            mockedValidator = mockedPrompt.expects(nameof<TestPathPrompt>((prompt) => prompt.ValidatePath));
                        });

                    teardown(
                        () =>
                        {
                            sandbox.restore();
                        });

                    test(
                        `Checking whether the user-input is validated using the \`${nameof<TestPathPrompt>((p) => p.ValidatePath)}\`-method…`,
                        async () =>
                        {
                            mockedValidator.returns(true);
                            mockedValidator.once();
                            await RunPrompt();
                            mockedPrompt.verify();
                        });

                    test(
                        `Checking whether the user-defined \`${nameof<IPathQuestion>((q) => q.validate)}\`-option is used if the path is valid…`,
                        async function()
                        {
                            let customValidator = stub();
                            question.validate = customValidator;
                            prompt = GetPrompt();
                            mockedPrompt = sandbox.mock(prompt);
                            mockedValidator = mockedPrompt.expects(nameof<TestPathPrompt>((prompt) => prompt.ValidatePath));
                            mockedValidator.atLeast(0);
                            mockedValidator.returns(false);
                            customValidator.returns(true);

                            let resolver = new Promise<void>(
                                (resolve) =>
                                {
                                    mockedPrompt.expects(nameof<TestPathPrompt>((p) => p.onError)).callsFake(
                                        () =>
                                        {
                                            resolve();
                                        });
                                });

                            StartPrompt();
                            Type("test");
                            Enter();
                            await resolver;
                            strictEqual(customValidator.callCount, 0);
                            mockedValidator.returns(true);
                            await EndPrompt();
                            ok(customValidator.calledOnce);
                        });
                });

            suite(
                nameof<TestPathPrompt>((prompt) => prompt.Initialize),
                () =>
                {
                    test(
                        `Checking whether the \`${nameof<IPathQuestion>((q) => q.rootDir)}\`-option is processed during the initialization…`,
                        async () =>
                        {
                            let path = context.RandomString;

                            for (let allowOutside of [undefined, true, false])
                            {
                                let value: IPathPromptRootDescriptor | string;

                                if (allowOutside === undefined)
                                {
                                    value = path;
                                }
                                else
                                {
                                    value = {
                                        path,
                                        allowOutside
                                    };
                                }

                                for (let option of [
                                    value,
                                    context.CreatePromise(value),
                                    context.CreateFunction(value),
                                    context.CreatePromiseFunction(value)
                                ])
                                {
                                    question.rootDir = option;
                                    prompt = GetPrompt();
                                    await prompt.Initialize();
                                    strictEqual(prompt.RootDir, path);
                                    strictEqual(prompt.AllowOutside, allowOutside ?? true);
                                }
                            }
                        });

                    test(
                        `Checking whether the \`${nameof<IPathQuestion>((q) => q.default)}\`-option is resolved to the \`${nameof<TestPathPrompt>((p) => p.RootDir)}\` if not absolute…`,
                        async () =>
                        {
                            let rootDir = context.RandomString;
                            question.rootDir = rootDir;

                            for (let path of ["/test", "C:/test", "test"])
                            {
                                question.default = path;
                                prompt = GetPrompt();
                                await prompt.Initialize();

                                if (isAbsolute(path))
                                {
                                    strictEqual(prompt.opt.default, normalize(path));
                                }
                                else
                                {
                                    strictEqual(prompt.opt.default, normalize(join(rootDir, path)));
                                }
                            }
                        });
                });

            suite(
                nameof<TestPathPrompt>((prompt) => prompt.render),
                () =>
                {
                    let sandbox: SinonSandbox;
                    let mockedPrompt: SinonMock;
                    let mockedProcessor: SinonExpectation;
                    let initialized: boolean;

                    setup(
                        () =>
                        {
                            sandbox = createSandbox();
                            mockedPrompt = sandbox.mock(prompt);
                            mockedProcessor = mockedPrompt.expects(nameof<TestPathPrompt>((prompt) => prompt.ProcessAnswer));
                            initialized = false;
                            sandbox.replaceGetter(prompt, "Initialized", () => initialized);
                        });

                    teardown(
                        () =>
                        {
                            sandbox.restore();
                        });

                    test(
                        `Checking whether \`${nameof<TestPathPrompt>((p) => p.ProcessAnswer)}\` is called only if the prompt has been initialized…`,
                        () =>
                        {
                            initialized = false;
                            prompt.render(undefined);
                            ok(mockedProcessor.notCalled);
                            initialized = true;
                            prompt.render(undefined);
                            ok(mockedProcessor.calledOnce);
                        });
                });

            suite(
                nameof<TestPathPrompt>((prompt) => prompt.getQuestion),
                () =>
                {
                    test(
                        `Checking whether the \`${nameof<TestPathPrompt>((p) => p.RootDir)}\` is appended to the question…`,
                        () =>
                        {
                            let sandbox = createSandbox();
                            sandbox.replaceGetter(prompt, "Initialized", () => false);
                            prompt.RootDir = "./this/is/a/test";
                            ok(prompt.getQuestion().includes(normalize(join(prompt.RootDir, "./"))));
                            sandbox.restore();
                        });
                });

            suite(
                nameof<TestPathPrompt>((prompt) => prompt.ProcessAnswer),
                () =>
                {
                    let sandbox: SinonSandbox;
                    let initialInput: boolean;

                    setup(
                        () =>
                        {
                            sandbox = createSandbox();
                            initialInput = false;
                            sandbox.replaceGetter(prompt, "InitialInput", () => initialInput);
                        });

                    teardown(
                        () =>
                        {
                            sandbox.restore();
                        });

                    test(
                        `Checking whether the \`${nameof<TestPathPrompt>((p) => p.RootDir)}\` is appended during the initial input…`,
                        async () =>
                        {
                            let path = join("this", "is", "a", "test");
                            let value = "Hello";
                            initialInput = true;
                            prompt.RootDir = path;
                            await Type(value);
                            prompt.ProcessAnswer();
                            strictEqual(prompt.rl.line, join(path, value));
                            prompt.ClearLine();

                            initialInput = false;
                            await Type(value);
                            prompt.ProcessAnswer();
                            strictEqual(prompt.rl.line, value);
                        });

                    test(
                        "Checking whether leading dots are preserved…",
                        async () =>
                        {
                            let path = [".", "Test"].join(sep);
                            await Type(path);
                            prompt.ProcessAnswer();
                            strictEqual(prompt.rl.line, path);
                        });

                    test(
                        "Checking whether trailing slashes are preserved…",
                        async () =>
                        {
                            let value = `${context.RandomString}${sep}`;
                            await Type(value);
                            prompt.ProcessAnswer();
                            strictEqual(prompt.rl.line, value);
                        });

                    test(
                        "Checking whether windows drive-letters are treated correctly…",
                        async () =>
                        {
                            let pathModuleName = "path";
                            mock(pathModuleName, require.resolve("path/win32"));

                            for (let value of ["C:", "C:\\", "C:\\Test"])
                            {
                                await Type(value);
                                prompt.ProcessAnswer();
                                strictEqual(prompt.rl.line, value);
                                prompt.ClearLine();
                            }

                            mock.stop(pathModuleName);
                        });

                    test(
                        "Checking whether the input is normalized correctly…",
                        async function()
                        {
                            this.timeout(4 * 1000);
                            this.slow(2 * 1000);

                            for (let slash of ["/", "\\", sep])
                            {
                                let path = ["This", "Is", "A", "Test"];
                                let value = path.join(slash);
                                await Type(value);
                                prompt.ProcessAnswer();
                                strictEqual(prompt.rl.line, path.join(sep));
                                prompt.ClearLine();
                            }

                            let value = "This/Is/Not/../A/Test";
                            await Type(value);
                            prompt.ProcessAnswer();
                            strictEqual(prompt.rl.line, normalize(value));
                        });
                });

            suite(
                nameof<TestPathPrompt>((prompt) => prompt.ClearLine),
                () =>
                {
                    test(
                        `Checking whether the input can be cleared using the \`${nameof<TestPathPrompt>((p) => p.ClearLine)}\`-method…`,
                        async () =>
                        {
                            let value = "Hello World";
                            StartPrompt();
                            await Type(value);
                            strictEqual(prompt.rl.line, value);
                            prompt.ClearLine();
                            strictEqual(prompt.rl.line, "");
                        });
                });

            suite(
                nameof<TestPathPrompt>((prompt) => prompt.OnInitialInputPerformed),
                () =>
                {
                    test(
                        `Checking whether \`${nameof<TestPathPrompt>((p) => p.InitialInput)}\` can be set to \`${false}\` using this method…`,
                        () =>
                        {
                            ok(prompt.InitialInput);
                            prompt.OnInitialInputPerformed();
                            ok(!prompt.InitialInput);
                        });
                });

            suite(
                nameof<TestPathPrompt>((prompt) => prompt.filterInput),
                () =>
                {
                    let sandbox: SinonSandbox;
                    let mockedPrompt: SinonMock;
                    let mockedValidator: SinonExpectation;
                    let valid: boolean;
                    let rootDir: string;
                    let defaultValue: string;
                    let errorHandler: SinonExpectation;

                    setup(
                        () =>
                        {
                            sandbox = createSandbox();
                            rootDir = join("hello", "world");
                            defaultValue = context.RandomString;
                            question.rootDir = rootDir;
                            question.default = defaultValue;
                            prompt = GetPrompt();
                            mockedPrompt = sandbox.mock(prompt);
                            mockedValidator = mockedPrompt.expects(nameof<TestPathPrompt>((prompt) => prompt.ValidatePath));
                            valid = true;
                            mockedValidator.atLeast(0);
                            mockedValidator.callsFake(() => valid);
                            errorHandler = mockedPrompt.expects(nameof<TestPathPrompt>((prompt) => prompt.onError));
                            errorHandler.atLeast(0);
                        });

                    teardown(
                        () =>
                        {
                            sandbox.restore();
                        });

                    /**
                     * Gets a {@link Promise `Promise`} for waiting for an error.
                     */
                    function GetResolver(): Promise<void>
                    {
                        return new Promise<void>(
                            (resolve) =>
                            {
                                errorHandler.callsFake(
                                    (...args: any[]) =>
                                    {
                                        let method = errorHandler.wrappedMethod;
                                        method = method.bind(prompt);
                                        method(...args);
                                        resolve();
                                    });
                            });
                    }

                    test(
                        `Checking whether pressing enter immediately doesn't cause unwanted output of ${nameof<TestPathPrompt>((p) => p.RootDir)}\`…`,
                        async () =>
                        {
                            let resolver = GetResolver();
                            valid = false;
                            StartPrompt();
                            await prompt.Initialization;
                            await Enter();
                            await resolver;
                            prompt.render();
                            strictEqual(prompt.rl.line, prompt.opt.default);
                        });
                });

            suite(
                nameof<TestPathPrompt>((prompt) => prompt.ValidatePath),
                () =>
                {
                    let sandbox: SinonSandbox;
                    let rootDir: string;
                    let allowOutside: boolean;

                    setup(
                        () =>
                        {
                            sandbox = createSandbox();
                            rootDir = join("this", "is", "a", "test");
                            allowOutside = true;
                            prompt = GetPrompt();
                            sandbox.replaceGetter(prompt, "AllowOutside", () => allowOutside);
                            sandbox.replaceGetter(prompt, "RootDir", () => rootDir);
                        });

                    teardown(
                        () =>
                        {
                            sandbox.restore();
                        });

                    test(
                        `Checking whether all paths are valid if \`${nameof<TestPathPrompt>((p) => p.AllowOutside)}\` is set to ${true}…`,
                        () =>
                        {
                            allowOutside = true;
                            ok(prompt.ValidatePath("test"));
                            ok(prompt.ValidatePath(rootDir));
                            ok(prompt.ValidatePath(`${rootDir}${sep}`));
                            ok(prompt.ValidatePath(join(rootDir, "test")));
                        });

                    test(
                        `Checking whether paths outside the \`${nameof<TestPathPrompt>((p) => p.RootDir)}\` are disallowed if \`${nameof<TestPathPrompt>((p) => p.AllowOutside)}\` is set to ${false}…`,
                        () =>
                        {
                            allowOutside = false;

                            for (
                                let invalidPath of [
                                    "test",
                                    rootDir,
                                    `${rootDir}${sep}`,
                                    join(rootDir, "test", "..", "..", "test")
                                ])
                            {
                                notStrictEqual(prompt.ValidatePath(invalidPath), true);
                            }

                            ok(prompt.ValidatePath(join(rootDir, "test")));

                            rootDir = ".";

                            for (
                                let invalidPath of [
                                    ".",
                                    join("..", "test")
                                ])
                            {
                                notStrictEqual(prompt.ValidatePath(invalidPath), true);
                            }

                            ok(prompt.ValidatePath(join(".", "test")));
                            ok(prompt.ValidatePath("test"));
                        });
                });
        });
}