import Assert = require("assert");
import { spawnSync } from "child_process";
import Path = require("path");
import { GeneratorSettingKey } from "@manuth/extended-yo-generator";
import npmWhich = require("npm-which");
import { run, RunContext } from "yeoman-test";
import { LintRuleset } from "../../Linting/LintRuleset";
import { TSGeneratorComponent } from "../../generators/app/TSGeneratorComponent";
import { TSGeneratorSettingKey } from "../../generators/app/TSGeneratorSetting";

suite(
    "TSGenerator-Generator",
    () =>
    {
        let currentDir: string;
        let generatorDir: string;
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
                            [TSGeneratorSettingKey.Destination]: "./",
                            [TSGeneratorSettingKey.DisplayName]: generatorName,
                            [TSGeneratorSettingKey.Name]: generatorName,
                            [GeneratorSettingKey.Components]: [
                                TSGeneratorComponent.Linting,
                                TSGeneratorComponent.VSCode,
                                TSGeneratorComponent.GeneratorExample
                            ],
                            [TSGeneratorSettingKey.LintRuleset]: LintRuleset.Weak
                        }).withOptions(
                            {
                                "skip-install": false
                            });
            });

        suiteTeardown(
            function(): void
            {
                this.timeout(60 * 1000);
                this.slow(30 * 1000);
                process.chdir(currentDir);
                runContext.cleanTestDirectory();
            });

        test(
            "Checking whether the generator can be executed…",
            async function()
            {
                this.timeout(7 * 60 * 1000);
                this.slow(6.5 * 60 * 1000);
                generatorDir = await runContext.toPromise();
            });

        test(
            "Checking whether the generated module can be installed…",
            function()
            {
                this.timeout(6.5 * 60 * 1000);
                this.slow(3.25 * 60 * 1000);

                let result = spawnSync(
                    npmWhich(__dirname).sync("npm"),
                    [
                        "install",
                        "--silent"
                    ],
                    {
                        cwd: generatorDir
                    });

                Assert.strictEqual(result.status === 0, true);
            });

        test(
            "Checking whether the generated module can be compiled using typescript…",
            async function()
            {
                this.timeout(15.5 * 1000);
                this.slow(7.75 * 1000);

                let result = spawnSync(
                    npmWhich(__dirname).sync("tsc"),
                    [
                        "-p",
                        generatorDir
                    ]);

                Assert.strictEqual(result.status === 0, true);
            });

        test(
            "Checking whether the generated module can be used as a generator…",
            async function()
            {
                this.timeout(20 * 1000);
                this.slow(10 * 1000);
                let testContext = run(Path.join(generatorDir, "lib", "generators", "app"));
                await Assert.doesNotReject(testContext.toPromise());
                process.chdir(generatorDir);
                testContext.cleanTestDirectory();
            });
    });
