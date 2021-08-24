import { doesNotReject, strictEqual } from "assert";
import { spawnSync } from "child_process";
import { GeneratorSettingKey } from "@manuth/extended-yo-generator";
import { IRunContext, TestContext as GeneratorContext } from "@manuth/extended-yo-generator-test";
import { TempDirectory } from "@manuth/temp-files";
import npmWhich = require("npm-which");
import { Project, SyntaxKind } from "ts-morph";
import { GeneratorName } from "../../../Core/GeneratorName";
import { NamingContext } from "../../../generators/generator/FileMappings/TypeScript/NamingContext";
import { ITSGeneratorSettings } from "../../../generators/generator/Settings/ITSGeneratorSettings";
import { SubGeneratorSettingKey } from "../../../generators/generator/Settings/SubGeneratorSettingKey";
import { TSGeneratorComponent } from "../../../generators/generator/Settings/TSGeneratorComponent";
import { TSGeneratorSettingKey } from "../../../generators/generator/Settings/TSGeneratorSettingKey";
import { TSGeneratorGenerator } from "../../../generators/generator/TSGeneratorGenerator";
import { TSProjectSettingKey } from "../../../Project/Settings/TSProjectSettingKey";
import { TestContext } from "../../TestContext";

/**
 * Registers tests for the {@link TSGeneratorGenerator `TSGeneratorGenerator<TSettings, TOptions>`} class.
 *
 * @param context
 * The test-context.
 */
export function TSGeneratorGeneratorTests(context: TestContext<TSGeneratorGenerator>): void
{
    suite(
        nameof(TSGeneratorGenerator),
        () =>
        {
            let tempDir: TempDirectory;
            let runContext: IRunContext<TSGeneratorGenerator>;
            let generator: TSGeneratorGenerator;
            let settings: ITSGeneratorSettings;

            suiteSetup(
                async function()
                {
                    this.timeout(5 * 60 * 1000);

                    settings = {
                        ...(await context.Generator).Settings,
                        [TSProjectSettingKey.DisplayName]: "Z",
                        [GeneratorSettingKey.Components]: [
                            TSGeneratorComponent.GeneratorExample,
                            TSGeneratorComponent.SubGeneratorExample
                        ],
                        [TSGeneratorSettingKey.SubGenerators]: [
                            {
                                [SubGeneratorSettingKey.DisplayName]: "A",
                                [SubGeneratorSettingKey.Name]: "a"
                            },
                            {
                                [SubGeneratorSettingKey.DisplayName]: "B",
                                [SubGeneratorSettingKey.Name]: "b"
                            }
                        ]
                    };

                    runContext = context.ExecuteGenerator();
                    runContext.withPrompts(settings);
                    await runContext.toPromise();
                    generator = runContext.generator;

                    spawnSync(
                        npmWhich(__dirname).sync("npm"),
                        [
                            "install",
                            "--silent"
                        ],
                        {
                            cwd: generator.destinationPath()
                        });

                    spawnSync(
                        npmWhich(__dirname).sync("npm"),
                        [
                            "run",
                            "build"
                        ],
                        {
                            cwd: generator.destinationPath()
                        });
                });

            suiteTeardown(
                function()
                {
                    this.timeout(1 * 60 * 1000);
                    runContext.cleanTestDirectory();
                });

            setup(
                () =>
                {
                    tempDir = new TempDirectory();
                });

            suite(
                "General",
                () =>
                {
                    test(
                        "Checking whether the generated project can be installed…",
                        function()
                        {
                            this.timeout(10 * 60 * 1000);
                            this.slow(5 * 60 * 1000);

                            let installationResult = spawnSync(
                                npmWhich(__dirname).sync("npm"),
                                [
                                    "install",
                                    "--silent"
                                ],
                                {
                                    cwd: generator.destinationPath()
                                });

                            let buildResult = spawnSync(
                                npmWhich(__dirname).sync("npm"),
                                [
                                    "run",
                                    "build"
                                ],
                                {
                                    cwd: generator.destinationPath()
                                });

                            strictEqual(installationResult.status, 0);
                            strictEqual(buildResult.status, 0);
                        });

                    test(
                        "Checking whether the main generator can be executed…",
                        async function()
                        {
                            this.timeout(1 * 60 * 1000);
                            this.slow(30 * 1000);
                            let testContext = new GeneratorContext(GeneratorPath(generator, GeneratorName.Main));
                            return doesNotReject(async () => testContext.ExecuteGenerator().inDir(tempDir.FullName).toPromise());
                        });

                    test(
                        "Checking whether the sub-generators can be executed…",
                        async function()
                        {
                            this.timeout(20 * 1000);
                            this.slow(10 * 1000);

                            for (let subGeneratorOptions of settings[TSGeneratorSettingKey.SubGenerators])
                            {
                                let testContext = new GeneratorContext(GeneratorPath(generator, subGeneratorOptions[SubGeneratorSettingKey.Name]));
                                await doesNotReject(async () => testContext.ExecuteGenerator().inDir(tempDir.FullName).toPromise());
                            }
                        });

                    test(
                        "Checking whether mocha can be executed…",
                        function()
                        {
                            this.timeout(8 * 1000);
                            this.slow(4 * 1000);

                            let result = spawnSync(
                                npmWhich(generator.destinationPath()).sync("mocha"),
                                {
                                    cwd: generator.destinationPath()
                                });

                            strictEqual(result.status, 0);
                        });
                });

            suite(
                nameof<TSGeneratorGenerator>((generator) => generator.FileMappings),
                () =>
                {
                    test(
                        "Checking whether all tests of the generated project are being included…",
                        () =>
                        {
                            let sourceFile = new Project().addSourceFileAtPath(generator.destinationPath("src", "tests", "Generators", "index.ts"));

                            let functionCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).filter(
                                (functionCall) =>
                                {
                                    return functionCall.getExpression().getText() === nameof(require);
                                });

                            for (
                                let generatorName of
                                [
                                    GeneratorName.Main,
                                    ...generator.Settings[TSGeneratorSettingKey.SubGenerators].map(
                                        (subGenerator) =>
                                        {
                                            return subGenerator[SubGeneratorSettingKey.Name];
                                        })
                                ])
                            {
                                strictEqual(
                                    functionCalls.filter(
                                        (functionCall) =>
                                        {
                                            let namingContext = new NamingContext(generatorName, context.RandomString, generator.SourceRoot);
                                            let argument = functionCall.getArguments()[0];

                                            return argument.getKind() === SyntaxKind.StringLiteral &&
                                                argument.asKind(SyntaxKind.StringLiteral).getLiteralValue().endsWith(`/${namingContext.GeneratorClassName}.test`);
                                        }).length,
                                    1);
                            }
                        });
                });
        });
}

/**
 * Joins the specified {@link path `path`} relative to the generator-directory.
 *
 * @param generator
 * The generator that created the generator-directory.
 *
 * @param path
 * The path to join.
 *
 * @returns
 * The joined path.
 */
export function GeneratorPath(generator: TSGeneratorGenerator, ...path: string[]): string
{
    return generator.destinationPath("lib", "generators", ...path);
}
