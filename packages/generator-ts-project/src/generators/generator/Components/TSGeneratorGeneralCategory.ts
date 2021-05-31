import { GeneratorOptions, IComponent, IGenerator } from "@manuth/extended-yo-generator";
import { TSProjectGeneralCategory } from "../../../Project/Components/TSProjectGeneralCategory";
import { ITSGeneratorSettings } from "../Settings/ITSGeneratorSettings";
import { TSGeneratorCodeWorkspaceFolder } from "./TSGeneratorCodeWorkspaceFolder";

/**
 * Provides general components for `TSGenerator`s.
 */
export class TSGeneratorGeneralCategory<TSettings extends ITSGeneratorSettings, TOptions extends GeneratorOptions> extends TSProjectGeneralCategory<TSettings, TOptions>
{
    /**
     * Initializes a new instance of the `TSGeneratorGeneralCategory` class.
     *
     * @param generator
     * The generator of the category.
     */
    public constructor(generator: IGenerator<TSettings, TOptions>)
    {
        super(generator);
    }

    /**
     * @inheritdoc
     */
    protected override get WorkspaceComponent(): IComponent<TSettings, TOptions>
    {
        return new TSGeneratorCodeWorkspaceFolder(this.Generator);
    }
}
