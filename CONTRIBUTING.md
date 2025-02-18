# Contributing
Code contributions are most certainly welcome! Before you do so, you should read this document and abide by it in order to have the best chances for your changes to be committed.

## Local development
### Prerequesites
Development is supported using the [latest Node.js LTS](https://nodejs.org/download). Yarn is also required in order to manage the multiple workspaces in this repo, so [make sure you have it on your PATH](https://yarnpkg.com/getting-started/install).

### Readying the repo
1. Fork the repo and clone it
2. Run `yarn`

That's it, you're ready to begin development.

### Useful commands
- `yarn build:plugin`, `yarn build:site`
	- Builds the plugin and site respectively
- `yarn develop:plugin`, `yarn develop:site`
	- Runs the TypeScript compiler in development mode and the Gatsby CLI in development mode respectively
- `yarn clean`, `yarn clean:plugin`, `yarn clean:site`
	- Deletes all files produced by the build and/or develop commands
- `yarn serve`
	- Serves a site built using `yarn build:site`

## Preparing your PR
Once you've made changes you're happy with, ensure you have

 1. Maintained good JSDoc type annotations
 2. Included code comments where necessary
 3. Ensured the test site builds and develops without any errors relating to the plugin
 4. Thoroughly documented your changes in the PR
 5. Included your rationale for why the change would be beneficial for users