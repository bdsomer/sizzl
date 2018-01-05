# sizzl
> Generate boilerplace Node.js workspaces in seconds

## Installation
```
npm i -g sizzl
```

## Usage
```bash
sizzl [flags]
```

### `flags`

`h` - Displays the help menu and exits the program.

`d` - Skips questions with default values.

`r` - Creates a boilerplate `README.md` file.

`l` - Creates a `LICENSE.md` file.

`w` - Creates a `site/host` directory with boilerplate `index.html` and `404.html` files.

`t` - Creates a `tests` directory with an empty `test.js` file.

`n` - Creates a `lib` directory with an empty `index.js` file, intended for writing Node.js.

## Examples

### Initialize a workspace with a README.md file, LICENSE.md file, test files, and Node.js boilerplate directory. Skip all defaults.

```bash
sizzl rltnd
```

### Initialize a workspace with a Node.js boilerplate directory and boilerplate web application files.

```bash
sizzl nw
```