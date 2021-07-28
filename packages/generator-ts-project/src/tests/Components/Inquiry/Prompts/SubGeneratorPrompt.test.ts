import { ok, strictEqual } from "assert";
import { DistinctQuestion, prompt, registerPrompt, restoreDefaultPrompts } from "inquirer";
import mock = require("mock-require");
import { SubGeneratorPrompt } from "../../../../Components/Inquiry/Prompts/SubGeneratorPrompt";
import { ISubGenerator } from "../../../../generators/generator/Settings/ISubGenerator";
import { TestContext } from "../../../TestContext";

/**
 * Provides tests for the {@link SubGeneratorPrompt `SubGeneratorPrompt<T>`} class.
 */
export function SubGeneratorPromptTests(): void
{
    suite(
        nameof(SubGeneratorPrompt),
        () =>
        {
            let inquirerModuleName = "inquirer";
            let context = TestContext.Default;
            let repeat: (answers: any) => boolean;
            let length: number;
            let questions: DistinctQuestion[];
            let testKey = "test" as const;

            /**
             * Provides an implementation of the {@link SubGeneratorPrompt `SubGeneratorPrompt<T>`} class for testing.
             */
            class TestSubGeneratorPrompt extends SubGeneratorPrompt<any>
            {
                /**
                 * @inheritdoc
                 *
                 * @returns
                 * The result of the prompt.
                 */
                public override Run(): Promise<ISubGenerator[]>
                {
                    return super.Run();
                }
            }

            setup(
                () =>
                {
                    length = context.Random.integer(1, 10);
                    context.RegisterTestPrompt();
                    context.RegisterTestPrompt("confirm");
                    mock(inquirerModuleName, require.resolve(inquirerModuleName));
                    registerPrompt(SubGeneratorPrompt.TypeName, SubGeneratorPrompt);
                    repeat = (answers) => (answers[testKey] as ISubGenerator[]).length < length;

                    questions = [
                        {
                            type: SubGeneratorPrompt.TypeName,
                            defaultRepeat: (answers) => repeat(answers),
                            name: testKey
                        }
                    ];
                });

            teardown(
                () =>
                {
                    restoreDefaultPrompts();
                    mock.stop(inquirerModuleName);
                });

            suite(
                nameof<TestSubGeneratorPrompt>((prompt) => prompt.Run),
                () =>
                {
                    test(
                        "Checking whether sub-generators can be prompted…",
                        async () =>
                        {
                            let result = await prompt(questions);
                            let value = result[testKey] as ISubGenerator[];
                            ok(nameof<ISubGenerator>((g) => g.name) in value[0]);
                            ok(nameof<ISubGenerator>((g) => g.displayName) in value[0]);
                        });

                    test(
                        "Checking whether any number of sub-generators can be prompted…",
                        async () =>
                        {
                            let result = await prompt(questions);
                            let value = result[testKey] as ISubGenerator[];
                            strictEqual(value.length, length);
                        });
                });
        });
}
