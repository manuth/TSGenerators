import { doesNotReject, strictEqual } from "assert";
import { EOL } from "os";
import { createPromptModule, PromptModule } from "inquirer";
import { SuspendablePrompt } from "../../../../Components/Inquiry/Prompts/SuspendablePrompt";
import { TestContext } from "../../../TestContext";

/**
 * Registers tests for the {@link SuspendablePrompt `SuspendablePrompt<T>`} class.
 */
export function SuspendablePromptTests(): void
{
    suite(
        nameof<SuspendablePrompt<any>>(),
        () =>
        {
            let type: undefined;
            let testKey = "test" as const;
            let testValue: string;
            let promptModule: PromptModule;

            suiteSetup(
                () =>
                {
                    type = "test" as undefined;
                });

            setup(
                () =>
                {
                    promptModule = createPromptModule();
                    testValue = TestContext.Default.RandomString;
                });

            suite(
                "General",
                () =>
                {
                    test(
                        "Checking whether prompts can be suspended and resumed without an error…",
                        async () =>
                        {
                            promptModule.registerPrompt(
                                type,
                                class extends SuspendablePrompt<any>
                                {
                                    /**
                                     * @inheritdoc
                                     *
                                     * @returns
                                     * The result of the prompt.
                                     */
                                    protected async Run(): Promise<unknown>
                                    {
                                        await this.Suspend();

                                        let result = await TestContext.Default.MockPrompts(
                                            createPromptModule(),
                                            [
                                                {
                                                    name: testKey,
                                                    message: "Specify random alphanumerical characters"
                                                }
                                            ],
                                            [
                                                [
                                                    testValue,
                                                    EOL
                                                ]
                                            ]);

                                        await this.Resume();
                                        return result[testKey];
                                    }
                                });

                            doesNotReject(
                                async () =>
                                {
                                    await promptModule(
                                        [
                                            {
                                                type,
                                                name: testKey
                                            }
                                        ]);
                                });

                            strictEqual(
                                (
                                    await promptModule(
                                        [
                                            {
                                                type,
                                                name: testKey
                                            }
                                        ]))[testKey],
                                testValue);
                        });
                });
        });
}