import { TaskDefinition } from "vscode";
import { CodeWorkspaceComponent } from "../../Components/CodeWorkspaceComponent";
import { ITSProjectSettings } from "../../ITSProjectSettings";
import { VSCodeTasksFileMapping } from "./VSCodeTasksFileMapping";

/**
 * Provides a file-mapping for copying the `tasks.json` file.
 */
export class ProjectTasksFileMapping<T extends ITSProjectSettings> extends VSCodeTasksFileMapping<T>
{
    /**
     * Initializes a new instance of the `ProjectTasksFileMapping` class.
     *
     * @param settingsFolderName
     * The name of the folder which contains the settings (such as `.vscode`, `.vscode-insiders` or `.vscodium`).
     */
    public constructor(settingsFolderName: string)
    {
        super(settingsFolderName);
    }

    /**
     * Processes a task-configuration.
     *
     * @param task
     * The task to process.
     *
     * @returns
     * The processed task.
     */
    protected async ProcessTask(task: TaskDefinition): Promise<TaskDefinition>
    {
        if (
            typeof task.label === "string" &&
            task.label.toLowerCase() === "lint")
        {
            if (
                typeof task.problemMatcher === "object" &&
                Array.isArray(task.problemMatcher))
            {
                task.problemMatcher = task.problemMatcher[0];
            }
        }

        return task;
    }
}
