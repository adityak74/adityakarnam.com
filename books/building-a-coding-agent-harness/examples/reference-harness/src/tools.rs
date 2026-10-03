use crate::context::Context;
use crate::model::ToolCall;
use serde_json::{json, Value};
use std::collections::BTreeMap;
use std::error::Error;
use std::fmt;
use std::fs;
use std::io::Write as _;

#[derive(Clone, Debug, PartialEq)]
pub struct ToolOutput {
    pub content: String,
    pub summary: String,
}

impl ToolOutput {
    pub fn new(content: impl Into<String>, summary: impl Into<String>) -> Self {
        Self {
            content: content.into(),
            summary: summary.into(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ToolError {
    Unknown(String),
    InvalidArguments(String),
    Failed(String),
}

impl fmt::Display for ToolError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> Result<(), fmt::Error> {
        match self {
            Self::Unknown(name) => write!(formatter, "unknown tool '{name}'"),
            Self::InvalidArguments(message) => write!(formatter, "invalid arguments: {message}"),
            Self::Failed(message) => write!(formatter, "tool failed: {message}"),
        }
    }
}

impl Error for ToolError {}

pub type ToolResult = Result<ToolOutput, ToolError>;

// ANCHOR: tool-trait
pub trait Tool: Send + Sync {
    fn name(&self) -> &'static str;
    fn description(&self) -> &'static str;
    fn schema(&self) -> Value;
    fn run(&self, args: &Value, cx: &mut Context) -> ToolResult;
}
// ANCHOR_END: tool-trait

#[derive(Default)]
pub struct ToolRegistry {
    tools: BTreeMap<String, Box<dyn Tool>>,
}

// ANCHOR: tool-registry
impl ToolRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn register(&mut self, tool: Box<dyn Tool>) {
        self.tools.insert(tool.name().to_owned(), tool);
    }

    pub fn schemas(&self) -> Vec<Value> {
        self.tools
            .values()
            .map(|tool| {
                json!({
                    "type": "function",
                    "function": {
                        "name": tool.name(),
                        "description": tool.description(),
                        "parameters": tool.schema(),
                    }
                })
            })
            .collect()
    }

    pub fn execute(&self, call: &ToolCall, cx: &mut Context) -> ToolResult {
        let tool = self
            .tools
            .get(&call.name)
            .ok_or_else(|| ToolError::Unknown(call.name.clone()))?;
        tool.run(&call.arguments, cx)
    }
}

// ReadFile: read a file within the repo.

pub struct ReadFile;

impl Tool for ReadFile {
    fn name(&self) -> &'static str {
        "read_file"
    }

    fn description(&self) -> &'static str {
        "Read a file by path within the repository."
    }

    fn schema(&self) -> Value {
        json!({
            "type": "object",
            "required": ["path"],
            "properties": {
                "path": {"type": "string"},
            },
        })
    }

    fn run(&self, args: &Value, cx: &mut Context) -> ToolResult {
        let path_str = args.get("path").and_then(Value::as_str).ok_or_else(|| {
            ToolError::InvalidArguments("missing path".to_owned())
        })?;

        let resolved = cx.resolve_existing(path_str).map_err(|e| ToolError::Failed(e.0))?;
        let content = fs::read(&resolved).map_err(|e| ToolError::Failed(e.to_string()))?;
        let text = String::from_utf8_lossy(&content).to_string();

        Ok(ToolOutput::new(
            text,
            format!("read {} bytes from {path_str}", content.len()),
        ))
    }
}

// WriteFile: write a file within the repo, recording an undo snapshot.

pub struct WriteFile;

impl Tool for WriteFile {
    fn name(&self) -> &'static str {
        "write_file"
    }

    fn description(&self) -> &'static str {
        "Write (overwrite) a file within the repository. Creates the file if it does not exist."
    }

    fn schema(&self) -> Value {
        json!({
            "type": "object",
            "required": ["path", "content"],
            "properties": {
                "path": {"type": "string"},
                "content": {"type": "string"},
            },
        })
    }

    fn run(&self, args: &Value, cx: &mut Context) -> ToolResult {
        let path_str = args.get("path").and_then(Value::as_str).ok_or_else(|| {
            ToolError::InvalidArguments("missing path".to_owned())
        })?;
        let content = args.get("content").and_then(Value::as_str).ok_or_else(|| {
            ToolError::InvalidArguments("missing content".to_owned())
        })?;

        let resolved = cx.resolve_for_create(path_str).map_err(|e| ToolError::Failed(e.0))?;
        let before = fs::read(&resolved).ok();

        let mut file = fs::File::create(&resolved).map_err(|e| ToolError::Failed(e.to_string()))?;
        file.write_all(content.as_bytes())
            .map_err(|e| ToolError::Failed(e.to_string()))?;

        cx.record_change(crate::context::FileChange {
            path: resolved,
            before,
            after: Some(content.as_bytes().to_vec()),
        });

        Ok(ToolOutput::new(
            content.to_owned(),
            format!("wrote {} bytes to {path_str}", content.len()),
        ))
    }
}

// ApplyPatch: replace the first occurrence of `old` inside a file with `new`.

pub struct ApplyPatch;

impl Tool for ApplyPatch {
    fn name(&self) -> &'static str {
        "apply_patch"
    }

    fn description(&self) -> &'static str {
        "Replace the first occurrence of `old` in a file with `new`."
    }

    fn schema(&self) -> Value {
        json!({
            "type": "object",
            "required": ["path", "old", "new"],
            "properties": {
                "path": {"type": "string"},
                "old": {"type": "string"},
                "new": {"type": "string"},
            },
        })
    }

    fn run(&self, args: &Value, cx: &mut Context) -> ToolResult {
        let path_str = args.get("path").and_then(Value::as_str).ok_or_else(|| {
            ToolError::InvalidArguments("missing path".to_owned())
        })?;
        let old = args.get("old").and_then(Value::as_str).ok_or_else(|| {
            ToolError::InvalidArguments("missing old".to_owned())
        })?;
        let new = args.get("new").and_then(Value::as_str).ok_or_else(|| {
            ToolError::InvalidArguments("missing new".to_owned())
        })?;

        let resolved = cx.resolve_existing(path_str).map_err(|e| ToolError::Failed(e.0))?;
        let original = fs::read_to_string(&resolved).map_err(|e| ToolError::Failed(e.to_string()))?;

        let patched = match original.find(old) {
            Some(pos) => {
                let mut out = original[..pos].to_string();
                out.push_str(new);
                out.push_str(&original[pos + old.len()..]);
                out
            }
            None => {
                return Err(ToolError::Failed(format!(
                    "old text not found in file"
                )));
            }
        };

        fs::write(&resolved, &patched).map_err(|e| ToolError::Failed(e.to_string()))?;

        cx.record_change(crate::context::FileChange {
            path: resolved,
            before: Some(original.as_bytes().to_vec()),
            after: Some(patched.as_bytes().to_vec()),
        });

        Ok(ToolOutput::new(
            patched,
            format!("patched 1 occurrence in {path_str}"),
        ))
    }
}

// RunCommand: run a shell command with configured limits.

pub struct RunCommand;

impl Tool for RunCommand {
    fn name(&self) -> &'static str {
        "run_command"
    }

    fn description(&self) -> &'static str {
        "Run a shell command with timeout and output limits."
    }

    fn schema(&self) -> Value {
        json!({
            "type": "object",
            "required": ["command"],
            "properties": {
                "command": {"type": "string"},
            },
        })
    }

    fn run(&self, args: &Value, cx: &mut Context) -> ToolResult {
        let command = args.get("command").and_then(Value::as_str).ok_or_else(|| {
            ToolError::InvalidArguments("missing command".to_owned())
        })?;

        let summary = cx.run_command(command).map_err(|e| ToolError::Failed(e.0))?;

        let stdout = summary.stdout.unwrap_or_default();
        let summary_str = if summary.timed_out {
            "timed out".to_owned()
        } else if summary.cancelled {
            "cancelled".to_owned()
        } else {
            format!("exited {}", summary.exit_code.unwrap_or(-1))
        };

        Ok(ToolOutput::new(stdout, summary_str))
    }
}
