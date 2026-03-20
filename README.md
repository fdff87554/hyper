# Hyper

> A terminal built on web technologies

[![Node CI](https://github.com/fdff87554/hyper/workflows/Node%20CI/badge.svg?event=push)](https://github.com/fdff87554/hyper/actions?query=workflow%3A%22Node+CI%22+branch%3Acanary+event%3Apush)

This is a maintained fork of [Vercel's Hyper](https://github.com/vercel/hyper), focused on security, stability, and modernization. The upstream project has been unmaintained since 2023.

**Version:** 4.0.0-canary.5 | **Branch:** `canary`

For the original project site, see: https://hyper.is

## Project goals

The goal of the project is to create a beautiful and extensible experience for command-line interface users, built on open web standards. This fork prioritizes:

- **Security** - Fixing vulnerabilities and keeping dependencies updated
- **Stability** - Improving error handling and crash recovery
- **Modernization** - Adding features expected in modern terminal emulators (OSC 7, layout persistence, etc.)
- **Extensibility** - Preserving and improving the 41-hook plugin system

## Usage

Currently this fork is available by building from source. See the [Contribute](#contribute) section below.

### Linux
#### Arch and derivatives
The upstream Hyper is available in the [AUR](https://aur.archlinux.org/packages/hyper/). Use an AUR [package manager](https://wiki.archlinux.org/index.php/AUR_helpers) e.g. [paru](https://github.com/Morganamilo/paru)

```sh
paru -S hyper
```

#### NixOS
The upstream Hyper is available as [Nix package](https://github.com/NixOS/nixpkgs/blob/master/pkgs/applications/misc/hyper/default.nix), to install the app run this command:

```sh
nix-env -i hyper
```

### macOS

Use [Homebrew Cask](https://brew.sh) to download the upstream app by running these commands:

```bash
brew update
brew install --cask hyper
```

### Windows

Use [chocolatey](https://chocolatey.org/) to install the upstream app by running the following command (package information can be found [here](https://chocolatey.org/packages/hyper/)):

```bash
choco install hyper
```

## Contribute

### Prerequisites

This project uses [mise](https://mise.jdx.dev/) to manage tool versions. Install mise first, then run:

```bash
mise install
```

This will set up the correct Node.js version (see `mise.toml`).

You will also need [Yarn](https://yarnpkg.com/en/docs/install) installed.

### Platform-specific dependencies

  * **Windows** - Run `yarn global add windows-build-tools` from an elevated prompt (as an administrator).
  * **macOS** - No additional dependencies needed.
  * **Linux (RPM-based)** - `GraphicsMagick`, `libicns-utils`, `xz`
  * **Linux (Debian-based)** - `graphicsmagick`, `icnsutils`, `xz-utils`

### Development workflow

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository and [clone](https://help.github.com/articles/cloning-a-repository/) it locally
2. Install the dependencies: `yarn`
3. Build the code and watch for changes: `yarn run dev`
4. In another terminal, run the app: `yarn run app`

If you are using **Visual Studio Code**, select `Launch Hyper` in debugger configuration to launch a new Hyper instance with debugger attached.

To generate distribution binaries:

```bash
yarn run dist
```

After that, you will see the binary in the `./dist` folder.

### Configuration

Hyper stores its configuration in `~/.hyper.json` (or `~/.hyper.js`). Key options include:

- `shell` - Path to the shell executable
- `shellArgs` - Arguments to pass to the shell
- `fontSize`, `fontFamily` - Terminal font settings
- `colors` - Color scheme (16 ANSI colors)
- `plugins` - List of plugins to install from npm
- `localPlugins` - List of local plugins to load

Run `hyper` CLI with `hyper docs <plugin-name>` to view any plugin's documentation.

#### Known issues that can happen during development

##### Error building `node-pty`

If after building during development you get an alert dialog related to `node-pty` issues,
make sure its build process is working correctly by running `yarn run rebuild-node-pty`.

If you are on macOS, this typically is related to Xcode issues (like not having agreed
to the Terms of Service by running `sudo xcodebuild` after a fresh Xcode installation).

##### Error with `C++` on macOS when running `yarn`

If you are getting compiler errors when running `yarn` add the environment variable `export CXX=clang++`

##### Error with `codesign` on macOS when running `yarn run dist`

If you have issues in the `codesign` step when running `yarn run dist` on macOS, you can temporarily disable code signing locally by setting
`export CSC_IDENTITY_AUTO_DISCOVERY=false` for the current terminal session.

## Related Repositories

- [Upstream Hyper](https://github.com/vercel/hyper) - Original project by Vercel
- [Upstream Website](https://github.com/vercel/hyper-site)
- [Sample Extension](https://github.com/vercel/hyperpower)
- [Sample Theme](https://github.com/vercel/hyperyellow)
- [Awesome Hyper](https://github.com/bnb/awesome-hyper)
