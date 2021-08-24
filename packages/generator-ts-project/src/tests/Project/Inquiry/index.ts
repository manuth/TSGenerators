import { basename } from "path";
import { TSProjectGenerator } from "../../../Project/TSProjectGenerator";
import { TestContext } from "../../TestContext";
import { TSProjectDescriptionQuestionTests } from "./TSProjectDescriptionQuestion.test";
import { TSProjectDestinationQuestionTests } from "./TSProjectDestinationQuestion.test";
import { TSProjectDisplayNameQuestionTests } from "./TSProjectDisplayNameQuestion.test";
import { TSProjectModuleNameQuestionTests } from "./TSProjectModuleNameQuestion.test";
import { TSProjectQuestionCollectionTests } from "./TSProjectQuestionCollection.test";

/**
 * Registers tests for inquiry-components for {@link TSProjectGenerator `TSProjectGenerator<TSettings, TOptions>`}s.
 *
 * @param context
 * The test-context.
 */
export function InquiryTests(context: TestContext<TSProjectGenerator>): void
{
    suite(
        basename(__dirname),
        () =>
        {
            TSProjectDestinationQuestionTests(context);
            TSProjectDisplayNameQuestionTests(context);
            TSProjectModuleNameQuestionTests(context);
            TSProjectDescriptionQuestionTests(context);
            TSProjectQuestionCollectionTests(context);
        });
}
