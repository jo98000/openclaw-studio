#!/usr/bin/env node

const COMMANDS = {
  setup: () => require("./commands/setup"),
  connect: () => require("./commands/connect"),
  "import-env": () => require("./commands/import-env"),
  status: () => require("./commands/status"),
  services: () => require("./commands/services"),
  help: () => ({ run: printHelp }),
};

function printHelp() {
  console.log(`
  openclaw - OpenClaw Studio CLI

  Usage:
    openclaw <command> [options]

  Commands:
    setup            Interactive wizard — detect CLIs, import credentials
    connect <svc>    Connect a specific service (e.g. github, slack, openai)
    import-env       Import credentials/providers from a .env file
    status           Show all configured connections
    status --test    Test all configured connections
    services         List all supported services

  Options:
    --help, -h       Show this help message

  Examples:
    openclaw setup
    openclaw connect github
    openclaw connect openai
    openclaw import-env
    openclaw import-env --file .env.prod
    openclaw status --test
    openclaw services
  `);
}

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "--help" || command === "-h") {
  printHelp();
  process.exit(0);
}

const loader = COMMANDS[command];
if (!loader) {
  console.error(`Unknown command: ${command}`);
  console.error(`Run "openclaw help" for usage.`);
  process.exit(1);
}

const mod = loader();
mod.run(args.slice(1)).catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
