import { ComponentCollection, GeneratorOptions, IComponentCategory, IComponentCollection, IGenerator, IGeneratorSettings } from "@manuth/extended-yo-generator";
import { GeneratorComponent } from "./GeneratorComponent";

/**
 * Represents a collection of components.
 *
 * @template TSettings
 * The type of the settings of the generator.
 *
 * @template TOptions
 * The type of the options of the generator.
 */
export abstract class ComponentCollectionBase<TSettings extends IGeneratorSettings, TOptions extends GeneratorOptions> extends GeneratorComponent<TSettings, TOptions, ComponentCollection<TSettings, TOptions>> implements IComponentCollection<TSettings, TOptions>
{
    /**
     * Initializes a new instance of the {@link ComponentCollectionBase `ComponentCollectionBase<TSettings, TOptions>`} class.
     *
     * @param generator
     * The generator of the collection.
     */
    public constructor(generator: IGenerator<TSettings, TOptions>)
    {
        super(generator);
    }

    /**
     * @inheritdoc
     */
    public abstract get Question(): string;

    /**
     * @inheritdoc
     */
    public abstract get Categories(): Array<IComponentCategory<TSettings, TOptions>>;

    /**
     * @inheritdoc
     */
    public get Resolved(): ComponentCollection<TSettings, TOptions>
    {
        return new ComponentCollection(this.Generator, this);
    }
}
