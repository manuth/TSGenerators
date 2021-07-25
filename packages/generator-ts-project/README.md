# TSProjectGenerator
A Set of Generators for Creating Projects Written in TypeScript

## Usage
### Install TSProjectGenerator
You can install `TSProjectGenerator` using the following command:

```bash
npm install -g yo @manuth/generator-ts-project
```

### Generate a Generator Written in TypeScript
You can create a generator written in TypeScript using this command:

```bash
yo @manuth/ts-project
```

It is recommended to use a code-editor which provides TypeScript-support (like, for example [VSCode] or [Atom]).

## Generator Output
  - A basic folder-structure for keeping `TypeScript`-code and `JavaScript`-builds separate
  - Linting-rules _(optional)_
    - Either weak rules…
    - …or strong rules
  - A node-package with required dependencies
  - Mocha test-environment
  - NPM-Scripts for…
    - Compiling the TypeScript-code
    - Cleaning compiled TypeScript-code
    - Linting the package
    - Testing the package
 - Visual Studio Code workspace _(optional)_
    - Settings
    - Task for building the generator (by pressing <kbd>CTRL</kbd>, <kbd>SHIFT</kbd> + <kbd>B</kbd>)
    - Task for linting the generator
    - Debug-settings

When generating a module you'll additionally get:
  - An empty `index` script

When generating a generator you'll get following in addition:
  - An `EJS`-extension for [VSCode]
  - An example-generator including template-files
  - As many sub-generators as you bother to create

<!--- References -->
[VSCode]: https://code.visualstudio.com/
[Atom]: https://atom.io/
