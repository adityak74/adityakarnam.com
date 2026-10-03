use coding_harness_reference::agent::{Agent, AgentConfig, Outcome};
use coding_harness_reference::context::Context;
use coding_harness_reference::model::{
    AssistantMessage, Message, Model, ModelError, ToolCall,
};
use coding_harness_reference::tools::{
    Tool, ToolError, ToolOutput, ToolRegistry, ToolResult,
};
use serde_json::{json, Value};
use std::collections::VecDeque;
use tempfile::tempdir;

struct ScriptedModel {
    replies: VecDeque<AssistantMessage>,
}

impl ScriptedModel {
    fn new(replies: Vec<AssistantMessage>) -> Self {
        Self {
            replies: replies.into(),
        }
    }
}

impl Model for ScriptedModel {
    fn complete(
        &mut self,
        _messages: &[Message],
        _tools: &[Value],
    ) -> Result<AssistantMessage, ModelError> {
        self.replies
            .pop_front()
            .ok_or_else(|| ModelError::Transport("script exhausted".to_owned()))
    }
}

struct EchoTool;

impl Tool for EchoTool {
    fn name(&self) -> &'static str {
        "echo"
    }

    fn description(&self) -> &'static str {
        "Echo a text value"
    }

    fn schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {"text": {"type": "string"}},
            "required": ["text"]
        })
    }

    fn run(&self, args: &Value, _cx: &mut Context) -> ToolResult {
        let text = args
            .get("text")
            .and_then(Value::as_str)
            .ok_or_else(|| ToolError::InvalidArguments("text must be a string".to_owned()))?;
        Ok(ToolOutput::new(text, "echoed text"))
    }
}

struct ZetaTool;

impl Tool for ZetaTool {
    fn name(&self) -> &'static str {
        "zeta"
    }

    fn description(&self) -> &'static str {
        "Second alphabetically"
    }

    fn schema(&self) -> Value {
        json!({"type": "object"})
    }

    fn run(&self, _args: &Value, _cx: &mut Context) -> ToolResult {
        Ok(ToolOutput::new("z", "z"))
    }
}

fn call(id: &str, text: &str) -> ToolCall {
    ToolCall {
        id: id.to_owned(),
        name: "echo".to_owned(),
        arguments: json!({"text": text}),
    }
}

fn tool_reply(call: ToolCall) -> AssistantMessage {
    AssistantMessage {
        content: String::new(),
        tool_calls: vec![call],
        finish_reason: "tool_calls".to_owned(),
    }
}

fn text_reply(text: &str) -> AssistantMessage {
    AssistantMessage {
        content: text.to_owned(),
        tool_calls: Vec::new(),
        finish_reason: "stop".to_owned(),
    }
}

fn config(max_steps: usize, repeat_limit: usize) -> AgentConfig {
    AgentConfig {
        system_prompt: "You are a coding agent.".to_owned(),
        max_steps,
        repeat_limit,
        denial_limit: 0,
    }
}

fn registry() -> ToolRegistry {
    let mut registry = ToolRegistry::new();
    registry.register(Box::new(EchoTool));
    registry
}

#[test]
fn registry_emits_schemas_in_name_order() {
    let mut registry = ToolRegistry::new();
    registry.register(Box::new(ZetaTool));
    registry.register(Box::new(EchoTool));

    let names: Vec<String> = registry
        .schemas()
        .into_iter()
        .map(|schema| schema["function"]["name"].as_str().unwrap().to_owned())
        .collect();

    assert_eq!(names, vec!["echo".to_owned(), "zeta".to_owned()]);
}

#[test]
fn registry_returns_structured_unknown_tool_error() {
    let temp = tempdir().unwrap();
    let mut context = Context::new(temp.path().to_owned()).unwrap();
    let unknown = ToolCall {
        id: "missing-1".to_owned(),
        name: "not_registered".to_owned(),
        arguments: json!({}),
    };

    let error = registry().execute(&unknown, &mut context).unwrap_err();

    assert!(matches!(error, ToolError::Unknown(name) if name == "not_registered"));
}

#[test]
fn tool_returns_structured_invalid_arguments_error() {
    let temp = tempdir().unwrap();
    let mut context = Context::new(temp.path().to_owned()).unwrap();

    let error = registry()
        .execute(
            &ToolCall {
                id: "echo-1".to_owned(),
                name: "echo".to_owned(),
                arguments: json!({"text": 42}),
            },
            &mut context,
        )
        .unwrap_err();

    assert!(matches!(error, ToolError::InvalidArguments(message) if message.contains("string")));
}

#[test]
fn agent_returns_ordinary_model_completion() {
    let temp = tempdir().unwrap();
    let model = ScriptedModel::new(vec![text_reply("finished")]);
    let mut agent = Agent::new(
        Box::new(model),
        registry(),
        Context::new(temp.path().to_owned()).unwrap(),
        config(4, 3),
    );

    let outcome = agent.run("solve the task");

    assert!(matches!(outcome, Outcome::Complete(text) if text == "finished"));
    assert_eq!(agent.messages()[0], Message::system("You are a coding agent."));
    assert_eq!(agent.messages()[1], Message::user("solve the task"));
}

#[test]
fn agent_stops_at_step_limit_after_tool_use() {
    let temp = tempdir().unwrap();
    let model = ScriptedModel::new(vec![tool_reply(call("call-1", "one"))]);
    let mut agent = Agent::new(
        Box::new(model),
        registry(),
        Context::new(temp.path().to_owned()).unwrap(),
        config(1, 3),
    );

    let outcome = agent.run("keep working");

    assert!(matches!(outcome, Outcome::StepLimit));
    assert_eq!(agent.messages().last().unwrap().role, "tool");
}

#[test]
fn agent_stops_after_three_identical_tool_observations() {
    let temp = tempdir().unwrap();
    let repeated = tool_reply(call("same-call", "same"));
    let model = ScriptedModel::new(vec![repeated.clone(), repeated.clone(), repeated]);
    let mut agent = Agent::new(
        Box::new(model),
        registry(),
        Context::new(temp.path().to_owned()).unwrap(),
        config(10, 3),
    );

    let outcome = agent.run("repeat forever");

    assert!(matches!(outcome, Outcome::RepeatedAction));
    let tool_results = agent
        .messages()
        .iter()
        .filter(|message| message.role == "tool")
        .count();
    assert_eq!(tool_results, 3);
}
