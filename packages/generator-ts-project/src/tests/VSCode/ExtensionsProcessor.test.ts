import { ok } from "assert";
import { GeneratorOptions } from "@manuth/extended-yo-generator";
import { ITestGeneratorOptions, ITestGeneratorSettings, ITestOptions, TestGenerator } from "@manuth/extended-yo-generator-test";
import { ExtensionsProcessor } from "../../VSCode/ExtensionsProcessor";
import { IExtensionSettings } from "../../VSCode/IExtensionSettings";
import { TestContext } from "../TestContext";
import { TestCodeWorkspaceComponent } from "./Components/TestCodeWorkspaceComponent";

/**
 * Registers tests for the {@link ExtensionsProcessor `ExtensionsProcessor<TSettings, TOptions>`} class.
 *
 * @param context
 * The test-context.
 */
export function ExtensionsProcessorTests(context: TestContext<TestGenerator, ITestGeneratorOptions<ITestOptions>>): void
{
    suite(
        nameof(ExtensionsProcessor),
        () =>
        {
            let includedExtension: string;
            let excludedExtension: string;
            let processor: ExtensionsProcessor<ITestGeneratorSettings, GeneratorOptions>;

            /**
             * Provides an implementation of the {@link ExtensionsProcessor `ExtensionsProcessor<TSettings, TOptions>`} class for testing.
             */
            class TestExtensionsProcessor extends ExtensionsProcessor<ITestGeneratorSettings, GeneratorOptions>
            {
                /**
                 * @inheritdoc
                 *
                 * @param recommendations
                 * The recommendations to filter.
                 *
                 * @returns
                 * All necessary recommendations.
                 */
                protected override async FilterRecommendations(recommendations: string[]): Promise<string[]>
                {
                    return recommendations.filter((extension) => extension !== excludedExtension);
                }
            }

            suiteSetup(
                async function()
                {
                    this.timeout(30 * 1000);
                    processor = new TestExtensionsProcessor(new TestCodeWorkspaceComponent(await context.Generator));
                });

            setup(
                () =>
                {
                    includedExtension = context.RandomString;
                    excludedExtension = context.RandomString;
                });

            suite(
                nameof<ExtensionsProcessor<any, any>>((processor) => processor.Process),
                () =>
                {
                    test(
                        "Checking whether recommendations can be filtered…",
                        async () =>
                        {
                            ok(!(
                                await processor.Process(
                                    {
                                        recommendations: [
                                            includedExtension,
                                            excludedExtension
                                        ]
                                    })).recommendations.includes(excludedExtension));
                        });

                    test(
                        "Checking whether recommendations are only processed if existent…",
                        async () =>
                        {
                            ok(!(nameof<IExtensionSettings>((e) => e.recommendations) in await processor.Process({})));
                        });
                });
        });
}
