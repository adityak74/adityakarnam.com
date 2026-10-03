use std::error::Error;
use std::fmt;
use std::io::Read as _;
use std::path::PathBuf;
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

#[derive(Clone, Debug, PartialEq)]
pub struct FileChange {
    pub path: PathBuf,
    pub before: Option<Vec<u8>>,
    pub after: Option<Vec<u8>>,
}

#[derive(Debug)]
pub struct ContextError(pub String);

impl fmt::Display for ContextError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> Result<(), fmt::Error> {
        write!(formatter, "repository context error: {}", self.0)
    }
}

impl Error for ContextError {}

/// Token that allows the harness to cancel a running command.

#[derive(Clone, Debug)]
pub struct CancelToken {
    cancelled: Arc<AtomicBool>,
}

impl CancelToken {
    pub fn new() -> Self {
        Self {
            cancelled: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn cancel(&self) {
        self.cancelled.store(true, Ordering::SeqCst);
    }

    pub fn is_cancelled(&self) -> bool {
        self.cancelled.load(Ordering::SeqCst)
    }
}

/// Limits for a spawned subprocess.

#[derive(Clone, Debug, PartialEq)]
pub struct CommandLimits {
    pub timeout: Duration,
    pub max_output_bytes: usize,
}

/// Default limits used when the harness is created without explicit constraints.

const DEFAULT_TIMEOUT: Duration = Duration::from_secs(30);
const DEFAULT_MAX_OUTPUT: usize = 64 * 1024;

pub struct Context {
    repo_root: PathBuf,
    changes: Vec<FileChange>,
    limits: Option<CommandLimits>,
    cancel_token: Option<CancelToken>,
}

impl Context {
    pub fn new(repo_root: PathBuf) -> Result<Self, ContextError> {
        let repo_root = repo_root
            .canonicalize()
            .map_err(|error| ContextError(error.to_string()))?;
        if !repo_root.is_dir() {
            return Err(ContextError(format!(
                "{} is not a directory",
                repo_root.display()
            )));
        }
        Ok(Self {
            repo_root,
            changes: Vec::new(),
            limits: Some(CommandLimits {
                timeout: DEFAULT_TIMEOUT,
                max_output_bytes: DEFAULT_MAX_OUTPUT,
            }),
            cancel_token: Some(CancelToken::new()),
        })
    }

    pub fn with_command_limits(
        repo_root: PathBuf,
        limits: CommandLimits,
        cancel_token: CancelToken,
    ) -> Result<Self, ContextError> {
        let repo_root = repo_root
            .canonicalize()
            .map_err(|error| ContextError(error.to_string()))?;
        if !repo_root.is_dir() {
            return Err(ContextError(format!(
                "{} is not a directory",
                repo_root.display()
            )));
        }
        Ok(Self {
            repo_root,
            changes: Vec::new(),
            limits: Some(limits),
            cancel_token: Some(cancel_token),
        })
    }

    pub fn changes(&self) -> &[FileChange] {
        &self.changes
    }

    pub fn record_change(&mut self, change: FileChange) {
        self.changes.push(change);
    }

    /// Resolve a path relative to the repo root and reject anything that escapes.

    pub fn resolve_existing(&self, relative: &str) -> Result<PathBuf, ContextError> {
        let candidate = self.repo_root.join(relative);
        let canonical = match candidate.canonicalize() {
            Ok(c) => c,
            Err(_) => return Err(ContextError("file does not exist".into())),
        };
        if !canonical.starts_with(&self.repo_root) {
            return Err(ContextError("path escapes repo root".into()));
        }
        Ok(canonical)
    }

    /// Resolve a path for creation: the parent directory must already exist
    /// inside the repo.  Does not require the target file itself to exist.

    pub fn resolve_for_create(&self, relative: &str) -> Result<PathBuf, ContextError> {
        let candidate = self.repo_root.join(relative);
        // If the path is a bare filename (e.g. "note.txt"), the repo root
        // itself is the parent, so skip canonicalizing the parent.
        if candidate.parent().map(|p| p.as_os_str().is_empty()).unwrap_or(false) {
            return Ok(candidate);
        }
        let parent = candidate.parent().unwrap();
        let parent_canonical = parent.canonicalize().map_err(|_| {
            ContextError(format!("parent directory does not exist: {}", parent.display()))
        })?;
        if !parent_canonical.starts_with(&self.repo_root) {
            return Err(ContextError("parent path escapes repo root".into()));
        }
        Ok(candidate)
    }

    /// Run a shell command subject to timeout, output truncation, and cancellation.
    ///
    /// For a synchronous harness (like this one), the implementation uses a
    /// blocking read.  Short timeouts (e.g. 50 ms) only work when the harness
    /// is layered with an async runtime (see the async section of the book).

    pub fn run_command(&self, command: &str) -> Result<super::policy::ToolSummary, ContextError> {
        let limits = self.limits.as_ref().ok_or_else(|| {
            ContextError("command execution not configured".into())
        })?;

        let token = self.cancel_token.as_ref().ok_or_else(|| {
            ContextError("command execution not configured".into())
        })?;

        // Fast path: already cancelled.
        if token.is_cancelled() {
            return Ok(super::policy::ToolSummary {
                stdout: Some(String::new()),
                stderr: None,
                exit_code: None,
                truncated: false,
                timed_out: false,
                cancelled: true,
            });
        }

        let start = Instant::now();

        let mut cmd = Command::new("/bin/sh");
        cmd.arg("-c").arg(command);
        cmd.stdout(std::process::Stdio::piped());

        let mut handle = cmd.spawn().map_err(|e| ContextError(format!("spawn failed: {e}")))?;

        let mut stdout = handle.stdout.take().ok_or_else(|| {
            ContextError("failed to take stdout".into())
        })?;

        let mut data = Vec::new();
        let mut buf = vec![0u8; 256];

        loop {
            // Check timeout and cancellation before reading.
            if start.elapsed() >= limits.timeout {
                handle.kill().ok();
                // Do NOT wait — the process may linger as a zombie in some
                // environments; returning early avoids a hang.
                return Ok(super::policy::ToolSummary {
                    stdout: Some(String::from_utf8_lossy(&data).to_string()),
                    stderr: None,
                    exit_code: None,
                    truncated: data.len() >= limits.max_output_bytes,
                    timed_out: true,
                    cancelled: false,
                });
            }
            if token.is_cancelled() {
                handle.kill().ok();
                return Ok(super::policy::ToolSummary {
                    stdout: Some(String::from_utf8_lossy(&data).to_string()),
                    stderr: None,
                    exit_code: None,
                    truncated: false,
                    timed_out: false,
                    cancelled: true,
                });
            }

            match stdout.read(&mut buf) {
                Ok(n) => {
                    if n > 0 {
                        data.extend_from_slice(&buf[..n]);
                        if data.len() >= limits.max_output_bytes {
                            data.truncate(limits.max_output_bytes);
                        }
                    } else if n == 0 {
                        break;
                    }
                }
                Err(_) => break,
            }
        }

        let status = handle.try_wait().ok().and_then(|s| s.unwrap().code()).unwrap_or(-1);

        Ok(super::policy::ToolSummary {
            stdout: Some(String::from_utf8_lossy(&data).to_string()),
            stderr: None,
            exit_code: Some(status),
            truncated: false,
            timed_out: false,
            cancelled: false,
        })
    }
}
