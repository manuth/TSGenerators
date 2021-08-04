import { dirname, relative } from "path";
import { Generator, GeneratorOptions, IGeneratorSettings } from "@manuth/extended-yo-generator";
import { ArrowFunction, printNode, StatementStructures, ts, WriterFunction } from "ts-morph";
import { ISuiteContext } from "../../../../Project/FileMappings/TypeScript/ISuiteContext";
import { GeneratorSuiteFileMappingBase } from "./GeneratorSuiteFileMappingBase";
import { GeneratorTestFileMapping } from "./GeneratorTestFileMapping";
import { NamingContext } from "./NamingContext";

/**
 * Provides the functionality to create a file which contains test-suites for generators.
 *
 * @template TSettings
 * The type of the settings of the generator.
 *
 * @template TOptions
 * The type of the options of the generator.
 */
export class GeneratorSuiteFileMapping<TSettings extends IGeneratorSettings, TOptions extends GeneratorOptions> extends GeneratorSuiteFileMappingBase<TSettings, TOptions>
{
    /**
     * Initializes a new instance of the {@link GeneratorSuiteFileMapping `GeneratorSuiteFileMapping<TSettings, TOptions>`} class.
     *
     * @param generator
     * The generator of this file-mapping.
     *
     * @param namingContext
     * A component which provides constants for the file-mapping.
     */
    public constructor(generator: Generator<TSettings, TOptions>, namingContext: NamingContext)
    {
        super(generator, namingContext);
    }

    /**
     * @inheritdoc
     */
    public override get Generator(): Generator<TSettings, TOptions>
    {
        return super.Generator as Generator<TSettings, TOptions>;
    }

    /**
     * @inheritdoc
     */
    public get Destination(): string
    {
        return this.NamingContext.GeneratorSuiteFileName;
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The context.
     */
    public async Context(): Promise<ISuiteContext>
    {
        return {
            SuiteName: "Generators"
        };
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The function for registering the suite.
     */
    protected override async GetSuiteFunction(): Promise<ArrowFunction>
    {
        let result = await super.GetSuiteFunction();
        let statements: Array<string | WriterFunction | StatementStructures> = [];

        for (let fileMapping of this.Generator.FileMappingCollection.Items)
        {
            if (fileMapping.Object instanceof GeneratorTestFileMapping)
            {
                statements.push(
                    printNode(
                        ts.factory.createExpressionStatement(
                            ts.factory.createCallExpression(
                                ts.factory.createIdentifier(nameof(require)),
                                [],
                                [
                                    ts.factory.createStringLiteral(
                                        (await this.GetSourceObject()).getRelativePathAsModuleSpecifierTo(
                                            relative(
                                                dirname(this.Destination),
                                                fileMapping.Object.Destination)))
                                ]))));
            }
        }

        result.addStatements(statements);
        return result;
    }
}