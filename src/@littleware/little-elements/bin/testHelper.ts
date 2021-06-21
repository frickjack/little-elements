import readline = require('readline');

export interface Result {
  didPass: boolean;
  details: string;
}

/**
 * Little helper gives the user some instructions to
 * walk through interactively, then prompts the
 * user whether it went ok or not, and if not - asks
 * for a one line explanation.
 *
 * @param instructions
 * @return Promise<Result>
 */
export function interactive(instructions: string): Promise<Result> {
  return new Promise(
    (resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(`\n**** ${instructions}\nDid the test pass Y|n ? `, (didPass) => {
        if (!didPass || didPass === 'y' || didPass === 'Y') {
          rl.close();
          resolve({ didPass: true, details: '' });
        } else {
          rl.question('Give a one-line explanation of what went wrong : ', (details) => {
            rl.close();
            resolve({ didPass: false, details });
          });
        }
      });
    },
  );
}

const lambdaNotInteractive = () => {
  expect(!!'skipping interactive test').toBe(true);
};

/**
 * Little helper to detect if the test is running in interactive mode
 * (process.env[LITTLE_INTERACTIVE] === "false")
 */
export function isInteractive(): boolean {
  return process.env.LITTLE_INTERACTIVE !== 'false';
}

/**
 * Little helper passes through the given lambda and
 * timeout if the LITTLE_INTERACTIVE environment variable
 * is not false, otherwise returns a lambda with a do-nothing
 * body, so interactive tests can be disabled in non-interactive
 * environments
 *
 * return [lambda, timeoutMs?]
 */
// eslint-disable-next-line
export function ifInteractive(lambda: Function, timeoutMs: number): [Function, number] {
  if (isInteractive()) {
    return [lambda, timeoutMs];
  }
  return [lambdaNotInteractive, undefined];
}
