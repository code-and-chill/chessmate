import { spawn, spawnSync, ChildProcess } from "child_process";
import { logger, serviceLogger } from "./logger";

export interface ExecOptions {
  cwd?: string;
  env?: Record<string, string>;
  serviceName?: string;
  useMise?: boolean;
  timeout?: number;
  ignoreErrors?: boolean;
}

export interface ExecResult {
  code: number;
  stdout: string;
  stderr: string;
  success: boolean;
}

/**
 * Execute a command with streaming output
 * Returns promise that resolves when command exits
 */
export async function execStream(
  command: string,
  args: string[],
  options: ExecOptions = {}
): Promise<ExecResult> {
  const {
    cwd = process.cwd(),
    serviceName,
    useMise = true,
    timeout = 0,
    ignoreErrors = false,
  } = options;

  const slog = serviceName ? serviceLogger(serviceName) : logger;

  // Wrap command with mise if available
  let finalCommand = command;
  let finalArgs = args;

  if (useMise) {
    finalCommand = "mise";
    finalArgs = ["exec", "--", command, ...args];
  }

  slog.debug(`Executing: ${finalCommand} ${finalArgs.join(" ")}`);

  return new Promise((resolve) => {
    const child = spawn(finalCommand, finalArgs, {
      cwd,
      stdio: ["inherit", "pipe", "pipe"],
      env: { ...process.env, ...options.env },
    });

    let stdout = "";
    let stderr = "";
    let timeoutHandle: NodeJS.Timeout | null = null;

    if (timeout > 0) {
      timeoutHandle = setTimeout(() => {
        child.kill();
        slog.error(`Command timed out after ${timeout}ms`);
      }, timeout);
    }

    if (child.stdout) {
      child.stdout.on("data", (data) => {
        const str = data.toString();
        stdout += str;
        process.stdout.write(str);
      });
    }

    if (child.stderr) {
      child.stderr.on("data", (data) => {
        const str = data.toString();
        stderr += str;
        process.stderr.write(str);
      });
    }

    child.on("close", (code) => {
      if (timeoutHandle) clearTimeout(timeoutHandle);

      const success = code === 0;
      if (!success && !ignoreErrors) {
        slog.error(`Command failed with exit code ${code}`);
      }

      resolve({
        code: code || 1,
        stdout,
        stderr,
        success,
      });
    });

    child.on("error", (err) => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      slog.error(`Failed to execute command: ${err.message}`);
      resolve({
        code: 1,
        stdout,
        stderr: err.message,
        success: false,
      });
    });
  });
}

/**
 * Execute a command synchronously
 */
export function execSync(
  command: string,
  args: string[],
  options: ExecOptions = {}
): ExecResult {
  const {
    cwd = process.cwd(),
    serviceName,
    useMise = true,
    ignoreErrors = false,
  } = options;

  const slog = serviceName ? serviceLogger(serviceName) : logger;

  let finalCommand = command;
  let finalArgs = args;

  if (useMise) {
    finalCommand = "mise";
    finalArgs = ["exec", "--", command, ...args];
  }

  slog.debug(`Executing (sync): ${finalCommand} ${finalArgs.join(" ")}`);

  try {
    const result = spawnSync(finalCommand, finalArgs, {
      cwd,
      encoding: "utf-8",
      env: { ...process.env, ...options.env },
    });

    const success = result.status === 0;
    if (!success && !ignoreErrors) {
      slog.error(`Command failed with exit code ${result.status}`);
    }

    return {
      code: result.status || 1,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      success,
    };
  } catch (err) {
    slog.error(`Failed to execute command: ${(err as Error).message}`);
    return {
      code: 1,
      stdout: "",
      stderr: (err as Error).message,
      success: false,
    };
  }
}

/**
 * Execute multiple commands in sequence
 */
export async function execSequence(
  commands: Array<{ cmd: string; args: string[]; opts?: ExecOptions }>,
  stopOnError = true
): Promise<ExecResult[]> {
  const results: ExecResult[] = [];

  for (const { cmd, args, opts } of commands) {
    const result = await execStream(cmd, args, opts);
    results.push(result);

    if (stopOnError && !result.success) {
      logger.error("Stopping sequence due to error");
      break;
    }
  }

  return results;
}

/**
 * Execute multiple commands in parallel (respecting max concurrency)
 */
export async function execParallel(
  commands: Array<{ cmd: string; args: string[]; opts?: ExecOptions }>,
  concurrency = 4
): Promise<ExecResult[]> {
  const results: ExecResult[] = [];
  const running: Promise<void>[] = [];

  let index = 0;

  const execNext = async () => {
    while (index < commands.length) {
      const cmdIndex = index;
      index++;

      const { cmd, args, opts } = commands[cmdIndex];
      const result = await execStream(cmd, args, opts);
      results[cmdIndex] = result;
    }
  };

  // Start concurrency workers
  for (let i = 0; i < Math.min(concurrency, commands.length); i++) {
    running.push(execNext());
  }

  await Promise.all(running);
  return results;
}
