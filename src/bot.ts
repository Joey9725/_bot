import { loginToSteam } from './steamClient';
import { NetworkError, TradeError } from './errorHandler';
import { unregisterAgent } from './bptf-web';


try {
  loginToSteam();
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle network errors specifically
    console.error('Network error during login:', error);
  } else {
    // Handle generic errors
    console.error('Failed to login:', error);
  }
}

function gracefulShutdown() {
  console.log("Gracefully shutting down. Unregistering agent from backpack.tf...");

  unregisterAgent().then(() => {
    console.log("Successfully unregistered. Exiting now.");
    process.exit(0);
  }).catch((err) => {
    console.log("Failed to unregister: ", err);
    process.exit(1);
  });
}

// Listen for shutdown signals
process.on('SIGINT', gracefulShutdown);  // For Ctrl+C event
process.on('SIGTERM', gracefulShutdown); // For `kill` command
