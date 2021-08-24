import { strictEqual } from "assert";
import { createPromptModule, PromptModule } from "inquirer";
import { PromptBase } from "../../../../Components/Inquiry/Prompts/PromptBase";
import { TestContext } from "../../../TestContext";

/**
 * Registers tests for the {@link PromptBase `PromptBase<T>`} class.
 */
export function PromptBaseTests(): void
{
    suite(
        nameof<PromptBase<any>>(),
        () =>
        {
            let promptModule: PromptModule;
            let type = "test" as undefined;
            let testKey = "test" as const;
            let testValue = TestContext.Default.RandomString;

            /**
             * Provides an implementation of the {@link PromptBase `PromptBase<T>`} class for testing.
             */
            class TestPrompt extends PromptBase<any>
            {
                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The result.
                 */
                public async Run(): Promise<unknown>
                {
                    await new Promise((resolve) => setTimeout(resolve, 1));
                    return testValue;
                }
            }

            setup(
                () =>
                {
                    promptModule = createPromptModule();
                    promptModule.registerPrompt(type, TestPrompt);
                });

            suite(
                nameof<TestPrompt>((prompt) => prompt.Run),
                () =>
                {
                    test(
                        "Checking whether the prompt can be executed using an async method instead of a callback…",
                        async () =>
                        {
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
