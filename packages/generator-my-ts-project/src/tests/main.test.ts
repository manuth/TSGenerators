import { TestContext } from "@manuth/extended-yo-generator-test";
import { join } from "upath";
import { MyTSModuleGenerator } from "../generators/module/MyTSModuleGenerator";
import { DependabotFileMappingTests } from "./DependabotFileMapping.test";
import { DroneFileMappingTests } from "./DroneFileMapping.test";
import { MarkdownFileProcessorTests } from "./MarkdownFileProcessor.test";
import { MyTSProjectGeneratorTests } from "./MyTSProjectGenerator.test";
import { MyTSProjectPackageFileMappingTests } from "./MyTSProjectPackageFileMapping.test";

suite(
    "MyTSProjectGenerator",
    () =>
    {
        let context = TestContext.Default;
        let projectContext = new TestContext<MyTSModuleGenerator>(join(__dirname, "..", "generators", "module"));

        suiteTeardown(
            () =>
            {
                for (let testContext of [context, projectContext])
                {
                    testContext.Dispose();
                }
            });

        MyTSProjectGeneratorTests(projectContext);
        MarkdownFileProcessorTests(context);
        DroneFileMappingTests(projectContext);
        DependabotFileMappingTests(projectContext);
        MyTSProjectPackageFileMappingTests(projectContext);
    });
