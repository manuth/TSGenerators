import Path = require("path");
import { Generator, GeneratorOptions, IComponentCollection, Question } from "@manuth/extended-yo-generator";
import chalk = require("chalk");
import Dedent = require("dedent");
import YoSay = require("yosay");
import { AppSetting } from "./AppSetting";
import { IAppSettings } from "./IAppSettings";
import { LicenseType } from "./LicenseType";

/**
 * Provides the functionality to generate a generator written in TypeScript.
 */
export class AppGenerator extends Generator<IAppSettings, GeneratorOptions>
{
    /**
     * Initializes a new instance of the `AppGenerator` class.
     *
     * @param args
     * A set of arguments for the generator.
     *
     * @param options
     * A set of options for the generator.
     */
    public constructor(args: string | string[], options: GeneratorOptions)
    {
        super(args, options);
    }

    /**
     * @inheritdoc
     */
    public get TemplateRoot(): string
    {
        return "app";
    }

    /**
     * @inheritdoc
     */
    public get Questions(): Array<Question<IAppSettings>>
    {
        return [
            {
                type: "input",
                name: AppSetting.Destination,
                message: "Where do you want to save your project to?",
                default: "./",
                filter: async (input) =>
                {
                    let destination = Path.isAbsolute(input) ? input : Path.resolve(process.cwd(), input);
                    this.destinationRoot(destination);
                    return destination;
                }
            },
            {
                type: "input",
                name: AppSetting.Name,
                message: "What's the name of your project?",
                default: (answers: IAppSettings) => Path.basename(answers[AppSetting.Destination])
            },
            {
                type: "input",
                name: AppSetting.Description,
                message: "Please enter a description."
            }
        ];
    }

    /**
     * @inheritdoc
     */
    public get Components(): IComponentCollection<IAppSettings, GeneratorOptions>
    {
        return {
            Question: "What do you want to include in your workspace?",
            Categories: [
                {
                    DisplayName: "General",
                    Components: [
                        {
                            ID: "readme",
                            DisplayName: "README.md-File",
                            DefaultEnabled: true,
                            FileMappings: [
                                {
                                    Source: "README.md.ejs",
                                    Destination: "README.md",
                                    Context: () =>
                                    {
                                        return {
                                            Name: this.Settings[AppSetting.Name],
                                            Description: this.Settings[AppSetting.Description]
                                        };
                                    }
                                }
                            ]
                        },
                        {
                            ID: "license",
                            DisplayName: "License-File",
                            Questions: [
                                {
                                    name: AppSetting.LicenseType,
                                    type: "list",
                                    message: "What license do you want to use?",
                                    choices: [
                                        {
                                            value: LicenseType.Apache,
                                            name: "Apache-2.0 License"
                                        },
                                        {
                                            value: LicenseType.GPL,
                                            name: "GNU GPL License"
                                        }
                                    ],
                                    default: LicenseType.GPL
                                }
                            ],
                            FileMappings: [
                                {
                                    Source: () =>
                                        {
                                            switch (this.Settings[AppSetting.LicenseType])
                                            {
                                                case LicenseType.Apache:
                                                    return "Apache.txt";
                                                case LicenseType.GPL:
                                                default:
                                                    return "GPL.txt";
                                            }
                                        },
                                    Destination: "LICENSE"
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }

    /**
     * @inheritdoc
     */
    public async prompting(): Promise<void>
    {
        this.log(YoSay(`Welcome to the ${chalk.whiteBright("MyTSProjectGenerator")} generator!`));
        return super.prompting();
    }

    /**
     * @inheritdoc
     */
    public async writing(): Promise<void>
    {
        return super.writing();
    }

    /**
     * @inheritdoc
     */
    public async end(): Promise<void>
    {
        this.log(
            Dedent(`
                Your project is ready!

                It lives in "${this.Settings[AppSetting.Destination]}"`));
    }
}