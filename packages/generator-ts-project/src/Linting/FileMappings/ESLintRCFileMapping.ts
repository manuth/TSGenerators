import ESLintPresets = require("@manuth/eslint-plugin-typescript");
import { GeneratorOptions, IGenerator } from "@manuth/extended-yo-generator";
// eslint-disable-next-line node/no-unpublished-import
import type { Linter } from "eslint";
import { ExportAssignment, Node, SourceFile } from "ts-morph";
import { fileName } from "types-eslintrc";
import { changeExt } from "upath";
import { TypeScriptTransformMapping } from "../../Components/Transformation/TypeScriptTransformMapping";
import { ITSProjectSettings } from "../../Project/Settings/ITSProjectSettings";
import { TSProjectSettingKey } from "../../Project/Settings/TSProjectSettingKey";
import { LintRuleset } from "../LintRuleset";

/**
 * Provides a file-mapping for the `.eslintrc.js` file.
 *
 * @template TSettings
 * The type of the settings of the generator.
 *
 * @template TOptions
 * The type of the options of the generator.
 */
export class ESLintRCFileMapping<TSettings extends ITSProjectSettings, TOptions extends GeneratorOptions> extends TypeScriptTransformMapping<TSettings, TOptions>
{
    /**
     * Initializes a new instance of the {@link ESLintRCFileMapping `ESLintRCFileMapping<TSettings, TOptions>`} class.
     *
     * @param generator
     * The generator of the file-mapping.
     */
    public constructor(generator: IGenerator<TSettings, TOptions>)
    {
        super(generator);
    }

    /**
     * Gets the default base-name of the file.
     */
    public get DefaultBaseName(): string
    {
        return fileName;
    }

    /**
     * Gets the base-name of the file.
     */
    public get BaseName(): string
    {
        return changeExt(this.DefaultBaseName, ".js");
    }

    /**
     * @inheritdoc
     */
    public get Source(): string
    {
        return this.Generator.modulePath(this.BaseName);
    }

    /**
     * @inheritdoc
     */
    public get Destination(): string
    {
        return this.BaseName;
    }

    /**
     * Processes the specified {@link sourceFile `sourceFile`}.
     *
     * @param sourceFile
     * The source-file to process.
     *
     * @returns
     * The processed source-file.
     */
    protected override async Transform(sourceFile: SourceFile): Promise<SourceFile>
    {
        let preset: string;

        switch (this.Generator.Settings[TSProjectSettingKey.LintRuleset])
        {
            case LintRuleset.Weak:
                preset = nameof(ESLintPresets.PresetName.WeakWithTypeChecking);
                break;
            case LintRuleset.Recommended:
            default:
                preset = nameof(ESLintPresets.PresetName.RecommendedWithTypeChecking);
                break;
        }

        let statement = sourceFile.getStatements().find(
            (statement): statement is ExportAssignment =>
            {
                if (Node.isExpressionStatement(statement))
                {
                    let expression = statement.getExpression();

                    if (Node.isBinaryExpression(expression))
                    {
                        return expression.getLeft().getText() === `${nameof(module)}.${nameof(module.exports)}`;
                    }
                }

                return false;
            });

        let expression = statement.getExpression();

        if (Node.isBinaryExpression(expression))
        {
            let right = expression.getRight();

            if (Node.isObjectLiteralExpression(right))
            {
                let extendsProperty = right.getProperty(nameof<Linter.Config>((config) => config.extends));
                right.getProperty(nameof<Linter.Config>((config) => config.root)).remove();

                if (Node.isPropertyAssignment(extendsProperty))
                {
                    let extendsValue = extendsProperty.getInitializer();

                    if (Node.isArrayLiteralExpression(extendsValue))
                    {
                        for (let item of extendsValue.getElements())
                        {
                            if (Node.isTemplateExpression(item))
                            {
                                for (let templateSpan of item.getTemplateSpans())
                                {
                                    let outerProperty = templateSpan.getExpression();

                                    if (Node.isPropertyAccessExpression(outerProperty))
                                    {
                                        let presetNameProperty = outerProperty.getExpression();

                                        if (
                                            Node.isPropertyAccessExpression(presetNameProperty) &&
                                            presetNameProperty.getName() === nameof(ESLintPresets.PresetName))
                                        {
                                            outerProperty.getNameNode().replaceWithText(preset);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return sourceFile;
    }
}
