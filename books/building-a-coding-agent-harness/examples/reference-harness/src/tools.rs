use crate::context::Context;
use crate::model::ToolCall;
use serde_json::{json, Value};
use std::collections::BTreeMap;
use std::error::Error;
use std::fmt;

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
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
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
// ANCHOR_END: tool-registry

