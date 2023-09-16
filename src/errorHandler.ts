import { Logger } from "./logger";

// Base Error class
class BaseError extends Error {
  constructor(message: string, public code: number) {
    super(message);
    this.name = "BaseError";
    Logger.error(`[BaseError] ${message} (Code: ${code})`);
  }
}

class NetworkError extends BaseError {
  constructor(message: string, public statusCode: number) {
    super(message, 1001); // 1001 is a custom error code for network errors
    this.name = "NetworkError";
    Logger.error(`[NetworkError] ${message} (Status Code: ${statusCode})`);
  }
}

// Trade Error class
class TradeError extends BaseError {
  constructor(message: string) {
    super(message, 1000);
    this.name = "TradeError";
    Logger.error(`[TradeError] ${message}`);
  }
}

// Authentication Error class
class AuthenticationError extends BaseError {
  constructor(message: string) {
    super(message, 1000);
    this.name = "AuthenticationError";
    Logger.error(`[AuthenticationError] ${message}`);
  }
}

export { BaseError, NetworkError, TradeError, AuthenticationError };