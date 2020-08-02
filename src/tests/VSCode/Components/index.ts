import { TestContext, TestGenerator } from "@manuth/extended-yo-generator-test";
import { CodeWorkspaceComponentTests } from "./CodeWorkspaceComponent.test";

/**
 * Registers tests for vscode-components.
 *
 * @param context
 * The test-context.
 */
export function ComponentTests(context: TestContext<TestGenerator>): void
{
    suite(
        "Components",
        () =>
        {
            CodeWorkspaceComponentTests(context);
        });
}
