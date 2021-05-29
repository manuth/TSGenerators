import { GeneratorOptions } from "@manuth/extended-yo-generator";
import { CodeWorkspaceComponent } from "../../VSCode/Components/CodeWorkspaceComponent";
import { ExtensionsProcessor } from "../../VSCode/ExtensionsProcessor";
import { ITSProjectSettings } from "../Settings/ITSProjectSettings";

/**
 * Provides the functionality to process extensions for `TSProject`s.
 */
export class TSProjectExtensionsProcessor<TSettings extends ITSProjectSettings, TOptions extends GeneratorOptions> extends ExtensionsProcessor<TSettings, TOptions>
{
    /**
     * Initializes a new instance of the `TSProjectExtensionsProcessor` class.
     *
     * @param component
     * The component of the processor.
     */
    public constructor(component: CodeWorkspaceComponent<TSettings, TOptions>)
    {
        super(component);
    }

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
        return recommendations.filter(
            (extension) =>
            {
                return extension !== "digitalbrainstem.javascript-ejs-support";
            });
    }
}
