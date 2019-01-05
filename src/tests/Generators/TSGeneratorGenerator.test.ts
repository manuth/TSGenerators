import Assert = require("assert");
import ChildProcess = require("child_process");
import { GeneratorSetting } from "extended-yo-generator";
import FileSystem = require("fs-extra");
import Path = require("path");
import TypeScript = require("typescript");
import { promisify } from "util";
import { run, RunContext } from "yeoman-test";
import { LintMode } from "../../generators/app/LintMode";
import { TSGeneratorComponent } from "../../generators/app/TSGeneratorComponent";
import { TSGeneratorSetting } from "../../generators/app/TSGeneratorSetting";

suite(
    "TSGenerator-Generator",
    () =>
    {
        let currentDir: string;
        let generatorDir: string;
        let tsConfigFile: string;
        let runContext: RunContext;
        let generatorName: string;

        suiteSetup(
            () =>
            {
                currentDir = process.cwd();
                generatorName = "generator-test";
                runContext = run(
                    Path.join(__dirname, "..", "..", "generators", "app")).withPrompts(
                        {
                            [TSGeneratorSetting.Destination]: "./",
                            [TSGeneratorSetting.DisplayName]: generatorName,
                            [TSGeneratorSetting.Name]: generatorName,
                            [GeneratorSetting.Components]: [
                                TSGeneratorComponent.TSLint,
                                TSGeneratorComponent.VSCode,
                                TSGeneratorComponent.GeneratorExample
                            ],
                            [TSGeneratorSetting.LintMode]: LintMode.Weak
                        });
            });

        suiteTeardown(
            function (): void
            {
                this.timeout(60 * 1000);
                this.slow(30 * 1000);
                process.chdir(currentDir);
                runContext.cleanTestDirectory();
            });

        test(
            "Checking whether the generator can be executed…",
            async function ()
            {
                this.timeout(18 * 1000);
                this.slow(6 * 1000);
                generatorDir = await runContext.toPromise();
                tsConfigFile = Path.join(generatorDir, "tsconfig.json");
            });

        test(
            "Checking whether the generated module can be installed…",
            async function ()
            {
                this.timeout(6.5 * 60 * 1000);
                this.slow(3.25 * 60 * 1000);

                await promisify(ChildProcess.exec)(
                    "npm install",
                    {
                        cwd: generatorDir
                    });
            });

        test(
            "Checking whether the generated module contains a typescript-configuration…",
            async () => Assert.strictEqual(await FileSystem.pathExists(tsConfigFile), true));

        test(
            "Checking whether the generated module can be compiled using typescript…",
            function ()
            {
                this.timeout(15.5 * 1000);
                this.slow(7.75 * 1000);

                let host: TypeScript.ParseConfigFileHost = {
                    ...TypeScript.sys,
                    onUnRecoverableConfigFileDiagnostic: (diagnostic) =>
                    {
                        throw diagnostic;
                    }
                };

                let config: TypeScript.ParsedCommandLine = TypeScript.getParsedCommandLineOfConfigFile(tsConfigFile, {}, host);
                let compilerResult = TypeScript.createProgram(
                    {
                        rootNames: config.fileNames,
                        options: config.options
                    }).emit();

                Assert.strictEqual(compilerResult.emitSkipped, false);
            });

        test(
            "Checking whether the generated module can be used as a generator…",
            async function ()
            {
                this.timeout(20 * 1000);
                this.slow(10 * 1000);
                let testContext = run(Path.join(generatorDir, "lib", "generators", "app"));
                await Assert.doesNotReject(testContext.toPromise());
                process.chdir(generatorDir);
                testContext.cleanTestDirectory();
            });
    });