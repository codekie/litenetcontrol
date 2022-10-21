# Litenetcontrol

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

This is a interactive shell to control the [LITENET operation](https://www.zumtobel.com/com-en/products/litenet.html#Operating%20software%20(running%20on%20network%20PC))
web interface. As this web interface is rather old and somewhat cumbersome to handle, the shell-approach provides a
(faster) alternative to control the luminaires.


## Status of this project

At this point, this is just a project for educational purposes and not to be used in a productive environment. Also, the
configuration for the luminaire setup is hard-coded yet and only will work for one certain setup
(see also the `LuminairePatternBuilder`-class in
[luminaire-pattern-builder.ts](src/lighting/luminaire-pattern-builder.ts)).


## Documentation

[Documentation](docs/index.md)


## Features

- Control luminaires over a terminal
- Pipe a text file with the commands into the CLI to apply a certain setup with one single command
  (see [examples](etc/examples))


## Related

Here are some related projects:

- [lite_netmockserver](https://github.com/codekie/litenet_mockserver) is a mockserver with a GUI, which can be used
  to test this CLI with.


## License

[MIT](https://choosealicense.com/licenses/mit/)


## Requirements

To run this project, the [Deno](https://deno.land/)-runtime is required.


## Run Locally

Clone the project

```bash
  git clone https://github.com/codekie/litenetcontrol
```

Run the CLI (the following command attempt to connect to the locally running
[lite_netmockserver](https://github.com/codekie/litenet_mockserver). The mockserver ignores the values of username and
password)

```bash
  deno run --allow-net --allow-env --allow-read src/repl/index.ts -u username -p password http://127.0.0.1:8000
```

## Run tests

To run the tests in this project, run following command:

```bash
  deno test --allow-read
```

To determine the code coverage, run following commands:

```bash
  deno test --allow-read --coverage=coverage
  deno coverage coverage --lcov --output=lcov.info
```

To view the coverage, you might want to have a look at the "Coverage Gutters" plugin in VS Code. Or use the `genhtml`-
tool to generate a HTML-report.


## Usage/Examples

Usage:

```
Usage: index [options] <url>

Options:
  -V, --version              output the version number
  -u, --username <username>  Username for the login
  -p, --password <password>  Password for the login
  -r, --record <file-path>   Records commands and writes them to file
  -h, --help                 display help for command
```

The following command replays a pre-recorded set of commands:

```bash
    cat etc/examples/demo-pattern.txt | deno run --allow-net --allow-env --allow-read src/repl/index.ts -u username \
    -p password http://127.0.0.1:8000
```

## Motivation

- Provide a (faster) alternative for controlling multiple luminaires to the outdated (and tedious to handle) web
  interface
- Try the Deno-runtime
- Practice Typescript-skills
