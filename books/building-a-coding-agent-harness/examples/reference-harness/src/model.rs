use serde_json::{json, Map, Value};
use std::error::Error;
use std::fmt;
use std::time::Duration;

// ANCHOR: message-types
#[derive(Clone, Debug, PartialEq)]
pub struct Message {
    pub role: String,
    pub content: String,
    pub tool_calls: Vec<ToolCall>,
    pub tool_call_id: Option<String>,
}

impl Message {
    fn plain(role: &str, content: impl Into<String>) -> Self {
        Self {
            role: role.to_owned(),
            content: content.into(),
            tool_calls: Vec::new(),
            tool_call_id: None,
        }
    }

    pub fn system(content: impl Into<String>) -> Self {
        Self::plain("system", content)
    }

    pub fn user(content: impl Into<String>) -> Self {
        Self::plain("user", content)
    }

    pub fn assistant(content: impl Into<String>) -> Self {
        Self::plain("assistant", content)
    }

    pub fn assistant_with_calls(
        content: impl Into<String>,
        tool_calls: Vec<ToolCall>,
    ) -> Self {
        Self {
            role: "assistant".to_owned(),
            content: content.into(),
            tool_calls,
            tool_call_id: None,
        }
    }

    pub fn tool_result(tool_call_id: impl Into<String>, content: impl Into<String>) -> Self {
        Self {
            role: "tool".to_owned(),
            content: content.into(),
            tool_calls: Vec::new(),
            tool_call_id: Some(tool_call_id.into()),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ToolCall {
    pub id: String,
    pub name: String,
    pub arguments: Value,
}

#[derive(Clone, Debug, PartialEq)]
pub struct AssistantMessage {
    pub content: String,
    pub tool_calls: Vec<ToolCall>,
    pub finish_reason: String,
}
// ANCHOR_END: message-types

// ANCHOR: model-config
#[derive(Clone, Debug)]
pub struct ModelConfig {
    pub base_url: String,
    pub api_key: Option<String>,
    pub model: String,
    pub timeout_secs: u64,
}
// ANCHOR_END: model-config

#[derive(Debug)]
pub enum ModelError {
    InvalidConfig(String),
    Transport(String),
    HttpStatus { status: u16, body: String },
    InvalidResponse(String),
}

impl fmt::Display for ModelError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidConfig(message) => write!(formatter, "invalid model config: {message}"),
            Self::Transport(message) => write!(formatter, "model transport failed: {message}"),
            Self::HttpStatus { status, body } => {
                write!(formatter, "model returned HTTP {status}: {body}")
            }
            Self::InvalidResponse(message) => {
                write!(formatter, "invalid model response: {message}")
            }
        }
    }
}

impl Error for ModelError {}

// ANCHOR: model-trait
pub trait Model: Send {
    fn complete(
        &mut self,
        messages: &[Message],
        tools: &[Value],
    ) -> Result<AssistantMessage, ModelError>;
}
// ANCHOR_END: model-trait

pub struct HttpModel {
    config: ModelConfig,
    agent: ureq::Agent,
}

impl HttpModel {
    pub fn new(mut config: ModelConfig) -> Result<Self, ModelError> {
        config.base_url = config.base_url.trim_end_matches('/').to_owned();
        if config.base_url.is_empty() {
            return Err(ModelError::InvalidConfig(
                "base_url cannot be empty".to_owned(),
            ));
        }
        if config.model.trim().is_empty() {
            return Err(ModelError::InvalidConfig(
                "model cannot be empty".to_owned(),
            ));
        }
        if config.timeout_secs == 0 {
            return Err(ModelError::InvalidConfig(
                "timeout_secs must be greater than zero".to_owned(),
            ));
        }

        let agent = ureq::AgentBuilder::new()
            .timeout(Duration::from_secs(config.timeout_secs))
            .build();
        Ok(Self { config, agent })
    }

    fn endpoint(&self) -> String {
        if self.config.base_url.ends_with("/v1") {
            format!("{}/chat/completions", self.config.base_url)
        } else {
            format!("{}/v1/chat/completions", self.config.base_url)
        }
    }
}

// ANCHOR: http-completion
impl Model for HttpModel {
    fn complete(
        &mut self,
        messages: &[Message],
        tools: &[Value],
    ) -> Result<AssistantMessage, ModelError> {
        let mut body = Map::new();
        body.insert("model".to_owned(), Value::String(self.config.model.clone()));
        body.insert(
            "messages".to_owned(),
            Value::Array(messages.iter().map(message_to_json).collect()),
        );
        if !tools.is_empty() {
            body.insert("tools".to_owned(), Value::Array(tools.to_vec()));
        }

        let mut request = self
            .agent
            .post(&self.endpoint())
            .set("content-type", "application/json");
        if let Some(api_key) = self.config.api_key.as_deref() {
            request = request.set("authorization", &format!("Bearer {api_key}"));
        }

        let response_text = match request.send_json(Value::Object(body)) {
            Ok(response) => response
                .into_string()
                .map_err(|error| ModelError::Transport(error.to_string()))?,
            Err(ureq::Error::Status(status, response)) => {
                let body = response.into_string().unwrap_or_default();
                return Err(ModelError::HttpStatus { status, body });
            }
            Err(ureq::Error::Transport(error)) => {
                return Err(ModelError::Transport(error.to_string()));
            }
        };

        let response: Value = serde_json::from_str(&response_text)
            .map_err(|error| ModelError::InvalidResponse(error.to_string()))?;
        parse_assistant(&response)
    }
}
// ANCHOR_END: http-completion

fn message_to_json(message: &Message) -> Value {
    let mut value = Map::new();
    value.insert("role".to_owned(), Value::String(message.role.clone()));
    value.insert(
        "content".to_owned(),
        Value::String(message.content.clone()),
    );
    if let Some(tool_call_id) = message.tool_call_id.as_deref() {
        value.insert(
            "tool_call_id".to_owned(),
            Value::String(tool_call_id.to_owned()),
        );
    }
    if !message.tool_calls.is_empty() {
        value.insert(
            "tool_calls".to_owned(),
            Value::Array(
                message
                    .tool_calls
                    .iter()
                    .map(|call| {
                        json!({
                            "id": call.id,
                            "type": "function",
                            "function": {
                                "name": call.name,
                                "arguments": call.arguments.to_string(),
                            }
                        })
                    })
                    .collect(),
            ),
        );
    }
    Value::Object(value)
}

// ANCHOR: parse-assistant
fn parse_assistant(response: &Value) -> Result<AssistantMessage, ModelError> {
    let choice = response
        .get("choices")
        .and_then(Value::as_array)
        .and_then(|choices| choices.first())
        .ok_or_else(|| ModelError::InvalidResponse("missing choices[0]".to_owned()))?;
    let message = choice
        .get("message")
        .and_then(Value::as_object)
        .ok_or_else(|| ModelError::InvalidResponse("missing choice message".to_owned()))?;
    let content = match message.get("content") {
        None | Some(Value::Null) => String::new(),
        Some(Value::String(content)) => content.clone(),
        Some(_) => {
            return Err(ModelError::InvalidResponse(
                "message content is not a string or null".to_owned(),
            ));
        }
    };

    let mut tool_calls = Vec::new();
    if let Some(calls) = message.get("tool_calls") {
        let calls = calls.as_array().ok_or_else(|| {
            ModelError::InvalidResponse("message tool_calls is not an array".to_owned())
        })?;
        for call in calls {
            let id = call
                .get("id")
                .and_then(Value::as_str)
                .ok_or_else(|| ModelError::InvalidResponse("tool call missing id".to_owned()))?;
            let function = call
                .get("function")
                .and_then(Value::as_object)
                .ok_or_else(|| {
                    ModelError::InvalidResponse("tool call missing function".to_owned())
                })?;
            let name = function
                .get("name")
                .and_then(Value::as_str)
                .ok_or_else(|| {
                    ModelError::InvalidResponse("tool call missing function name".to_owned())
                })?;
            let arguments = match function.get("arguments") {
                Some(Value::String(arguments)) => serde_json::from_str(arguments).map_err(|error| {
                    ModelError::InvalidResponse(format!(
                        "tool call arguments are not valid JSON: {error}"
                    ))
                })?,
                Some(Value::Object(arguments)) => Value::Object(arguments.clone()),
                _ => {
                    return Err(ModelError::InvalidResponse(
                        "tool call missing arguments".to_owned(),
                    ));
                }
            };
            tool_calls.push(ToolCall {
                id: id.to_owned(),
                name: name.to_owned(),
                arguments,
            });
        }
    }

    Ok(AssistantMessage {
        content,
        tool_calls,
        finish_reason: choice
            .get("finish_reason")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_owned(),
    })
}
// ANCHOR_END: parse-assistant
