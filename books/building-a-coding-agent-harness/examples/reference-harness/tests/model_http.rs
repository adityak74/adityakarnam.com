use coding_harness_reference::model::{
    AssistantMessage, HttpModel, Message, Model, ModelConfig, ModelError,
};
use serde_json::{json, Value};
use std::sync::mpsc;
use std::thread;
use std::time::Duration;
use tiny_http::{Header, Response, Server};

#[derive(Debug)]
struct SeenRequest {
    path: String,
    authorization: Option<String>,
    body: Value,
}

fn serve_once(status: u16, body: Value) -> (String, mpsc::Receiver<SeenRequest>) {
    let server = Server::http("127.0.0.1:0").expect("bind mock model server");
    let address = format!("http://{}", server.server_addr());
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let mut request = server.recv().expect("receive model request");
        let authorization = request
            .headers()
            .iter()
            .find(|header| header.field.equiv("authorization"))
            .map(|header| header.value.as_str().to_owned());
        let mut raw_body = String::new();
        request
            .as_reader()
            .read_to_string(&mut raw_body)
            .expect("read request body");
        let seen = SeenRequest {
            path: request.url().to_owned(),
            authorization,
            body: serde_json::from_str(&raw_body).expect("request body is JSON"),
        };
        tx.send(seen).expect("send captured request");

        let response = Response::from_string(body.to_string())
            .with_status_code(status)
            .with_header(
                Header::from_bytes("content-type", "application/json")
                    .expect("valid response header"),
            );
        request.respond(response).expect("respond to model request");
    });

    (address, rx)
}

fn config(base_url: String, api_key: Option<&str>) -> ModelConfig {
    ModelConfig {
        base_url,
        api_key: api_key.map(str::to_owned),
        model: "test-model".to_owned(),
        timeout_secs: 2,
    }
}

fn complete_once(response: Value, api_key: Option<&str>) -> (AssistantMessage, SeenRequest) {
    let (base_url, seen) = serve_once(200, response);
    let mut model = HttpModel::new(config(base_url, api_key)).expect("construct model");
    let reply = model
        .complete(&[Message::user("hello")], &[])
        .expect("model completion");
    let request = seen
        .recv_timeout(Duration::from_secs(2))
        .expect("captured request");
    (reply, request)
}

#[test]
fn returns_text_reply_and_sends_openai_compatible_body() {
    let (reply, request) = complete_once(
        json!({
            "choices": [{
                "message": {"role": "assistant", "content": "done"},
                "finish_reason": "stop"
            }]
        }),
        Some("secret"),
    );

    assert_eq!(reply.content, "done");
    assert!(reply.tool_calls.is_empty());
    assert_eq!(reply.finish_reason, "stop");
    assert_eq!(request.path, "/v1/chat/completions");
    assert_eq!(request.authorization.as_deref(), Some("Bearer secret"));
    assert_eq!(request.body["model"], "test-model");
    assert_eq!(request.body["messages"][0]["role"], "user");
    assert_eq!(request.body["messages"][0]["content"], "hello");
}

#[test]
fn parses_multiple_tool_calls_when_content_is_null() {
    let (reply, _) = complete_once(
        json!({
            "choices": [{
                "message": {
                    "role": "assistant",
                    "content": null,
                    "tool_calls": [
                        {"id": "call-1", "type": "function", "function": {"name": "read_file", "arguments": "{\"path\":\"src/lib.rs\"}"}},
                        {"id": "call-2", "type": "function", "function": {"name": "search_text", "arguments": "{\"query\":\"needle\"}"}}
                    ]
                },
                "finish_reason": "tool_calls"
            }]
        }),
        None,
    );

    assert_eq!(reply.content, "");
    assert_eq!(reply.tool_calls.len(), 2);
    assert_eq!(reply.tool_calls[0].id, "call-1");
    assert_eq!(reply.tool_calls[0].name, "read_file");
    assert_eq!(reply.tool_calls[0].arguments, json!({"path": "src/lib.rs"}));
    assert_eq!(reply.tool_calls[1].name, "search_text");
    assert_eq!(reply.finish_reason, "tool_calls");
}

#[test]
fn rejects_response_without_choices() {
    let (base_url, seen) = serve_once(200, json!({"id": "missing-choices"}));
    let mut model = HttpModel::new(config(base_url, None)).expect("construct model");

    let error = model
        .complete(&[Message::user("hello")], &[])
        .expect_err("missing choices must fail");
    seen.recv_timeout(Duration::from_secs(2))
        .expect("captured request");

    assert!(matches!(error, ModelError::InvalidResponse(message) if message.contains("choices")));
}

#[test]
fn returns_provider_status_and_body_for_non_success_response() {
    let (base_url, seen) = serve_once(429, json!({"error": {"message": "slow down"}}));
    let mut model = HttpModel::new(config(base_url, None)).expect("construct model");

    let error = model
        .complete(&[Message::user("hello")], &[])
        .expect_err("non-success response must fail");
    seen.recv_timeout(Duration::from_secs(2))
        .expect("captured request");

    assert!(matches!(error, ModelError::HttpStatus { status: 429, body } if body.contains("slow down")));
}

#[test]
fn omits_authorization_header_when_api_key_is_absent() {
    let (_, request) = complete_once(
        json!({
            "choices": [{
                "message": {"role": "assistant", "content": "local"},
                "finish_reason": "stop"
            }]
        }),
        None,
    );

    assert_eq!(request.authorization, None);
}

#[test]
fn message_constructors_preserve_tool_protocol_fields() {
    let system = Message::system("rules");
    let assistant = Message::assistant("answer");
    let tool = Message::tool_result("call-7", "contents");

    assert_eq!(system.role, "system");
    assert_eq!(system.content, "rules");
    assert_eq!(assistant.role, "assistant");
    assert_eq!(tool.role, "tool");
    assert_eq!(tool.tool_call_id.as_deref(), Some("call-7"));
    assert_eq!(tool.content, "contents");
}
