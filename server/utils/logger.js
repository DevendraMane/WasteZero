const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

const DEFAULT_LEVEL = process.env.NODE_ENV === "production" ? "warn" : "debug";
const ACTIVE_LEVEL = (process.env.LOG_LEVEL || DEFAULT_LEVEL).toLowerCase();
const ACTIVE_LEVEL_VALUE = LEVELS[ACTIVE_LEVEL] ?? LEVELS[DEFAULT_LEVEL];

const SENSITIVE_KEY_PATTERN =
  /password|token|secret|authorization|cookie|api[_-]?key|email/i;

const maskEmail = (value) => {
  if (!value || typeof value !== "string" || !value.includes("@")) return value;

  const [name, domain] = value.split("@");
  if (!name || !domain) return "[REDACTED_EMAIL]";

  if (name.length <= 2) return `**@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
};

const redactString = (value) => {
  if (typeof value !== "string") return value;

  return value
    .replace(/(mongodb(?:\+srv)?:\/\/)([^@\s]+)@/gi, "$1[REDACTED]@")
    .replace(/(Bearer\s+)[A-Za-z0-9\-._~+/]+=*/gi, "$1[REDACTED_TOKEN]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (email) =>
      maskEmail(email),
    );
};

const redactValue = (value, depth = 0) => {
  if (depth > 3) return "[REDACTED_DEPTH]";

  if (value == null) return value;

  if (typeof value === "string") return redactString(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, depth + 1));
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactString(value.message),
      stack: process.env.NODE_ENV === "production" ? undefined : value.stack,
    };
  }

  if (typeof value === "object") {
    const output = {};

    for (const [key, nested] of Object.entries(value)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        output[key] = "[REDACTED]";
      } else {
        output[key] = redactValue(nested, depth + 1);
      }
    }

    return output;
  }

  return value;
};

const shouldLog = (level) =>
  (LEVELS[level] ?? LEVELS.silent) >= ACTIVE_LEVEL_VALUE;

const emit = (method, level, ...args) => {
  if (!shouldLog(level)) return;
  console[method](...args.map((arg) => redactValue(arg)));
};

const logger = {
  debug: (...args) => emit("debug", "debug", ...args),
  log: (...args) => emit("log", "debug", ...args),
  info: (...args) => emit("info", "info", ...args),
  warn: (...args) => emit("warn", "warn", ...args),
  error: (...args) => emit("error", "error", ...args),
  redact: (value) => redactValue(value),
  maskEmail,
};

export default logger;
