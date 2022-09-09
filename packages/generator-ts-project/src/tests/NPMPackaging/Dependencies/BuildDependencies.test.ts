import { DependencyCollectionTester } from "@manuth/generator-ts-project-test";
import { BuildDependencies } from "../../../NPMPackaging/Dependencies/BuildDependencies.js";

/**
 * Registers tests for the {@link BuildDependencies `BuildDependencies`} class.
 */
export function BuildDependencyTests(): void
{
    suite(
        nameof(BuildDependencies),
        () =>
        {
            let dependencies: BuildDependencies;
            let tester: DependencyCollectionTester;

            suiteSetup(
                async function()
                {
                    this.timeout(30 * 1000);
                    dependencies = new BuildDependencies();
                    tester = new DependencyCollectionTester(dependencies);
                });

            suite(
                nameof(BuildDependencies.constructor),
                () =>
                {
                    test(
                        "Checking whether all required dependencies are present…",
                        async function()
                        {
                            this.timeout(4 * 1000);
                            this.slow(2 * 1000);

                            await tester.AssertDependencyNames(
                                {
                                    devDependencies: [
                                        "@manuth/tsconfig",
                                        "typescript"
                                    ]
                                });
                        });
                });
        });
}
