const readline = require("node:readline");

/**
 * Ask a question and return the answer.
 */
const ask = (question) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

/**
 * Ask for a secret (hidden input on supporting terminals).
 */
const askSecret = async (question) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    // Try to hide input
    const origWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk) => {
      if (typeof chunk === "string" && chunk.includes(question)) {
        return origWrite(chunk);
      }
      // Hide typed characters
      return origWrite("*");
    };
    rl.question(question, (answer) => {
      process.stdout.write = origWrite;
      process.stdout.write("\n");
      rl.close();
      resolve(answer.trim());
    });
  });
};

/**
 * Ask a yes/no question. Returns true for yes.
 */
const confirm = async (question, defaultYes = true) => {
  const hint = defaultYes ? "[Y/n]" : "[y/N]";
  const answer = await ask(`${question} ${hint} `);
  if (!answer) return defaultYes;
  return answer.toLowerCase().startsWith("y");
};

/**
 * Let the user pick from a list.
 */
const choose = async (question, options) => {
  console.log(`\n${question}`);
  options.forEach((opt, i) => {
    console.log(`  ${i + 1}. ${opt}`);
  });
  const answer = await ask(`\nChoice (1-${options.length}): `);
  const idx = parseInt(answer, 10) - 1;
  if (idx >= 0 && idx < options.length) return idx;
  return 0;
};

module.exports = { ask, askSecret, confirm, choose };
