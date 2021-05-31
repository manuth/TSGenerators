import { notStrictEqual, ok, strictEqual } from "assert";
import { GeneratorOptions } from "@manuth/extended-yo-generator";
import { join, normalize } from "upath";
import { DebugConfiguration } from "vscode";
import { TSProjectCodeWorkspaceFolder } from "../../../Project/Components/TSProjectCodeWorkspaceFolder";
import { ITSProjectSettings } from "../../../Project/Settings/ITSProjectSettings";
import { TSProjectGenerator } from "../../../Project/TSProjectGenerator";
import { TSProjectLaunchSettingsProcessor } from "../../../Project/VSCode/TSProjectLaunchSettingsProcessor";
import { ILaunchSettings } from "../../../VSCode/ILaunchSettings";
import { TestContext } from "../../TestContext";

/**
 * Registers tests for the `TSProjectLaunchSettingsProcessor` class.
 *
 * @param context
 * The test-context.
 */
export function TSProjectLaunchSettingsProcessorTests(context: TestContext<TSProjectGenerator>): void
{
    suite(
        "TSProjectLaunchSettingsProcessor",
        () =>
        {
            let cwdOption: string;
            let programOption: string;
            let argsOption: string;
            let outFilesOption: string;
            let component: TSProjectCodeWorkspaceFolder<ITSProjectSettings, GeneratorOptions>;
            let processor: TSProjectLaunchSettingsProcessor<ITSProjectSettings, GeneratorOptions>;

            suiteSetup(
                async function()
                {
                    this.timeout(2 * 60 * 1000);
                    cwdOption = "cwd";
                    programOption = "program";
                    argsOption = "args";
                    outFilesOption = "outFiles";
                    component = new TSProjectCodeWorkspaceFolder(await context.Generator);
                    processor = new TSProjectLaunchSettingsProcessor(component);
                });

            test(
                "Checking whether `yeoman` debug-configurations are not present…",
                async () =>
                {
                    let launchSettings = await processor.Process(await component.Source.LaunchMetadata);

                    ok(
                        launchSettings.configurations.every(
                            (debugConfig) => !normalize(debugConfig.program ?? "").toLowerCase().endsWith(
                                join("yo", "lib", "cli.js"))));
                });

            test(
                "Checking whether unnecessary settings are being removed…",
                async () =>
                {
                    let launchSettings = await processor.Process(await component.Source.LaunchMetadata);

                    ok(
                        launchSettings.configurations.every(
                            (debugConfig) =>
                            {
                                return (
                                    debugConfig.presentation === undefined &&
                                    debugConfig.autoAttachChildProcesses === undefined &&
                                    debugConfig.SkipFiles === undefined);
                            }));
                });

            test(
                "Checking whether named workspace-directives are stripped properly…",
                async () =>
                {
                    let folderName = context.RandomString;
                    let namedPath = join(context.NamedWorkspaceFolderDirective, folderName);
                    let path = join(context.WorkspaceFolderDirective, folderName);

                    let testSettings: ILaunchSettings = {
                        version: "",
                        configurations: [
                            {
                                type: "",
                                name: programOption,
                                request: "",
                                [programOption]: namedPath
                            },
                            {
                                type: "",
                                name: argsOption,
                                request: "",
                                [argsOption]: [
                                    namedPath
                                ]
                            },
                            {
                                type: "",
                                name: cwdOption,
                                request: "",
                                [cwdOption]: namedPath
                            },
                            {
                                type: "",
                                name: outFilesOption,
                                request: "",
                                [outFilesOption]: [
                                    namedPath
                                ]
                            }
                        ]
                    };

                    let processedSettings = await processor.Process(testSettings);

                    for (let name of [programOption, argsOption, cwdOption])
                    {
                        let debugConfig = processedSettings.configurations.find((config) => config.name === name);
                        let actual: string;

                        switch (debugConfig.name)
                        {
                            case programOption:
                                actual = debugConfig[programOption];
                                break;
                            case argsOption:
                                actual = debugConfig[argsOption][0];
                                break;
                            case cwdOption:
                                actual = debugConfig.cwd;
                                break;
                            case outFilesOption:
                                actual = debugConfig[outFilesOption][0];
                                break;
                        }

                        strictEqual(actual, path);
                    }
                });

            test(
                "Checking whether duplicate values insied the `outFiles`-option are stripped…",
                async () =>
                {
                    let testName = context.RandomString;
                    let workspaceDirective = context.GetWorkspaceFolderDirective(context.RandomString);
                    let otherWorkspaceDirective = context.GetWorkspaceFolderDirective(context.RandomString);
                    let namedPath = join(workspaceDirective, "**", "*.js");
                    let otherNamedPath = join(otherWorkspaceDirective, "**", "*.js");
                    let localPath = join("**", "!node_modules", "**");

                    let outFiles = [
                        namedPath,
                        otherNamedPath,
                        localPath,
                        localPath
                    ];

                    let configuration: DebugConfiguration = {
                        name: testName,
                        request: "",
                        type: "",
                        [outFilesOption]: outFiles
                    };

                    let testSettings: ILaunchSettings = {
                        version: "",
                        configurations: [
                            configuration
                        ]
                    };

                    let processedSettings = await processor.Process(testSettings);

                    let processedOutFiles: string[] = processedSettings.configurations.filter(
                        (config) => config.name === configuration.name)[0][outFilesOption];

                    notStrictEqual(outFiles.length, processedOutFiles.length);

                    strictEqual(
                        processedOutFiles.filter(
                            (outFilesEntry) =>
                            {
                                return outFilesEntry.includes(context.WorkspaceFolderDirective);
                            }).length,
                            1);

                    strictEqual(processedOutFiles.filter((outFilesEntry) => outFilesEntry === localPath).length, 1);
                });
        });
}
