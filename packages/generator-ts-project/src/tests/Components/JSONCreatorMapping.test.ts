import { deepStrictEqual } from "assert";
import { GeneratorOptions } from "@manuth/extended-yo-generator";
import { ITestGeneratorOptions, ITestGeneratorSettings, ITestOptions, JSONFileMappingTester, TestContext, TestGenerator } from "@manuth/extended-yo-generator-test";
import { TempFile } from "@manuth/temp-files";
import { JSONCreatorMapping } from "../../Components/JSONCreatorMapping";

/**
 * Registers tests for the {@link JSONCreatorMapping `JSONCreatorMapping<TSettings, TOptions>`} class.
 *
 * @param context
 * The test-context.
 */
export function JSONCreatorMappingTests(context: TestContext<TestGenerator, ITestGeneratorOptions<ITestOptions>>): void
{
    suite(
        nameof(JSONCreatorMapping),
        () =>
        {
            let generator: TestGenerator;
            let tempFile: TempFile;
            let fileMappingOptions: JSONCreatorMapping<ITestGeneratorSettings, GeneratorOptions, any>;
            let tester: JSONFileMappingTester<TestGenerator, ITestGeneratorSettings, GeneratorOptions, JSONCreatorMapping<ITestGeneratorSettings, GeneratorOptions, any>>;
            let randomObject: any;

            suiteSetup(
                async function()
                {
                    this.timeout(30 * 1000);
                    generator = await context.Generator;
                    tempFile = new TempFile();
                });

            setup(
                () =>
                {
                    randomObject = context.RandomObject;
                    fileMappingOptions = new JSONCreatorMapping(generator, tempFile.FullName, randomObject);
                    tester = new JSONFileMappingTester(generator, fileMappingOptions);
                });

            suite(
                nameof<JSONCreatorMapping<any, any, any>>((mapping) => mapping.Processor),
                () =>
                {
                    test(
                        "Checking whether the json-data is written correctly…",
                        async () =>
                        {
                            await tester.Run();
                            deepStrictEqual(await tester.Metadata, randomObject);
                        });
                });
        });
}
