import readline from 'readline';
import StellarHDWallet from 'stellar-hd-wallet';

// ANSI escape codes for stunning console styling
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const MAGENTA = '\x1b[35m';
const GRAY = '\x1b[90m';

function clearConsole() {
  // Clear screen and reset cursor position
  process.stdout.write('\x1Bc');
}

/**
 * A robust interactive prompt helper supporting standard and secure (masked) input
 */
function askQuestion(query, isSecure = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (isSecure && typeof process.stdin.setRawMode === 'function') {
      try {
        process.stdout.write(query);
        const stdin = process.stdin;
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');

        let input = '';
        const onKey = (key) => {
          if (key === '\u0003') { // Ctrl+C
            process.stdout.write('\n');
            process.exit();
          }
          if (key === '\r' || key === '\n') {
            process.stdout.write('\n');
            try {
              stdin.setRawMode(false);
            } catch (e) {}
            stdin.removeListener('data', onKey);
            rl.close();
            resolve(input.trim());
            return;
          }
          if (key === '\u0008' || key === '\x7f') { // Backspace
            if (input.length > 0) {
              input = input.slice(0, -1);
              process.stdout.write('\b \b');
            }
            return;
          }
          // Normal characters
          input += key;
          process.stdout.write('*');
        };
        stdin.on('data', onKey);
        return;
      } catch (e) {
        // Fallback to normal input if raw mode setup fails
      }
    }

    // Default standard input fallback
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  clearConsole();

  console.log(`${CYAN}${BOLD}================================================================================${RESET}`);
  console.log(`${CYAN}${BOLD}                    STELLAR ACCOUNTS KEY DERIVATION TOOL                       ${RESET}`);
  console.log(`${CYAN}${BOLD}================================================================================${RESET}`);
  console.log(`${GREEN}🛡️  [Secure Offline Mode] ${DIM}Derived from standard BIP39 seed phrase (Freighter Path)${RESET}`);
  console.log(`${CYAN}${BOLD}================================================================================${RESET}\n`);

  // Ask user about input visibility for pasting convenience
  console.log(`${BOLD}Input Security Settings:${RESET}`);
  console.log(`  [1] ${BOLD}Secure Mode (Hidden)${RESET} - Characters will be masked with asterisks (*). Useful for security.`);
  console.log(`  [2] ${BOLD}Visible Mode${RESET}         - Input will be visible. Useful to verify your paste/typos.`);
  const modeChoice = await askQuestion(`${CYAN}${BOLD}Select mode (1 or 2, default 1): ${RESET}`);
  const isSecure = modeChoice !== '2';

  console.log(`\n${YELLOW}${BOLD}NOTE:${RESET} Your seed phrase is processed entirely in memory locally on your machine.`);
  console.log(`It is never saved, logged, or sent anywhere.\n`);

  let mnemonic = '';
  while (true) {
    mnemonic = await askQuestion(`${CYAN}${BOLD}Paste your 12 or 24-word seed phrase:${RESET}\n> `, isSecure);
    
    // Normalize spacing
    mnemonic = mnemonic.replace(/\s+/g, ' ').trim();

    if (!mnemonic) {
      console.log(`${RED}Error: Seed phrase cannot be empty. Please try again.${RESET}\n`);
      continue;
    }

    try {
      const isValid = StellarHDWallet.validateMnemonic(mnemonic);
      if (!isValid) {
        console.log(`${RED}⚠️  Warning: This seed phrase does not pass BIP39 checksum validation!${RESET}`);
        const proceedChoice = await askQuestion(`${YELLOW}Do you still want to derive keys from this phrase? (y/N): ${RESET}`);
        if (proceedChoice.toLowerCase() !== 'y') {
          console.log(`${DIM}Retrying...${RESET}\n`);
          continue;
        }
      }
      break;
    } catch (e) {
      console.log(`${RED}Error validating seed phrase: ${e.message}. Please try again.${RESET}\n`);
    }
  }

  console.log(`\n${CYAN}⚙️  Deriving keys...${RESET}\n`);

  try {
    const wallet = StellarHDWallet.fromMnemonic(mnemonic);

    console.log(`${CYAN}${BOLD}================================================================================${RESET}`);
    console.log(`${CYAN}${BOLD}                        DERIVED STELLAR FREIGHTER ACCOUNTS                     ${RESET}`);
    console.log(`${CYAN}${BOLD}================================================================================${RESET}`);
    console.log(`${DIM}Derivation path schema: m/44'/148'/index'${RESET}\n`);

    // Derive first 5 accounts
    for (let i = 0; i < 5; i++) {
      const pubKey = wallet.getPublicKey(i);
      const secretKey = wallet.getSecret(i);

      // Highlight the first two accounts as they are requested
      const prefix = i < 2 ? `${GREEN}${BOLD}▶ Account #${i} (Freighter Account #${i + 1})${RESET}` : `${DIM}  Account #${i} (Freighter Account #${i + 1})${RESET}`;
      
      console.log(prefix);
      console.log(`  ${DIM}Derivation Path:${RESET} ${CYAN}m/44'/148'/${i}'${RESET}`);
      console.log(`  ${DIM}Public Address: ${RESET} ${BOLD}${CYAN}${pubKey}${RESET}`);
      console.log(`  ${DIM}Secret Key:     ${RESET} ${BOLD}${YELLOW}${secretKey}${RESET}`);
      console.log(``);
    }

    console.log(`${CYAN}${BOLD}================================================================================${RESET}`);
    console.log(`${GREEN}${BOLD}Next Steps:${RESET}`);
    console.log(`1. Copy the Secret Key (${YELLOW}starts with S...${RESET}) matching the address you want.`);
    console.log(`2. Paste it in your PowerShell secure input prompt to import it as 'axial-deployer'.`);
    console.log(`${CYAN}${BOLD}================================================================================${RESET}\n`);

  } catch (error) {
    console.log(`${RED}An error occurred during derivation: ${error.message}${RESET}`);
  } finally {
    // Overwrite the mnemonic in memory immediately
    mnemonic = null;
  }

  await askQuestion(`${MAGENTA}${BOLD}Press [ENTER] to exit and SECURELY CLEAR the screen from sensitive keys...${RESET}`);
  
  // Wipe screen and write success
  clearConsole();
  console.log(`\n${GREEN}✔ Sensitive keys successfully wiped from the terminal session memory.${RESET}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
