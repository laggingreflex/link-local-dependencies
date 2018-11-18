# link-local-dependencies

Link your local paths as dependencies.

[npm lets you do this too][npm-local-paths] but unfortunately [it breaks in certain cases][breaks].

[npm-local-paths]: https://docs.npmjs.com/files/package.json#local-paths
[breaks]: https://github.com/npm/npm/issues/18266

## Install

```
npm i link-local-dependencies
```

## Usage

In your `package.json`

* Put your local dependencies in `"localDependencies"`

* Call `link-local-dependencies` in `"postinstall"` script

```json
{
  "scripts": {
    "postinstall": "link-local-dependencies"
  },
  "localDependencies": {
    "root": "./root",
    "home": "~",
  }
}
```
