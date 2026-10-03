use coding_harness_reference::agent::{Agent, AgentConfig, Outcome};
use coding_harness_reference::context::{CancelToken, CommandLimits, Context};
use coding_harness_reference::model::{AssistantMessage, Message, Model, ModelError, ToolCall};
use coding_harness_reference::policy::{Decision, Policy, Preset};
use coding_harness_reference::tools::{
    ApplyPatch, RunCommand, Tool, ToolRegistry, WriteFile,
};
use serde_json::{json, Value};
use std::collections::VecDeque;
use std::fs;
use std::path::Path;
use std::time::Duration;
use tempfile::tempdir;

fn workspace() -> (tempfile::TempDir, std::path::PathBuf) {
    let temp = tempdir().unwrap();
    let root = temp.path().join("repo");
    fs::create_dir(&root).unwrap();
    (temp, root)
}

#[test]
fn context_rejects_parent_and_symlink_path_escapes() {
    let (temp, root) = workspace();
    let outside = temp.path().join("outside.txt");
    fs::write(&outside, "secret").unwrap();
    #[cfg(unix)]
    std::os::unix::fs::symlink(&outside, root.join("link.txt")).unwrap();
    let context = Context::new(root).unwrap();

    assert!(context.resolve_existing("../outside.txt").is_err());
    #[cfg(unix)]
    assert!(context.resolve_existing("link.txt").is_err());
}

#[test]
fn context_requires_existing_in_root_parent_for_creation() {
    let (_temp, root) = workspace();
    let context = Context::new(root.clone()).unwrap();

    assert!(context.resolve_for_create("missing/file.txt").is_err());
    assert_eq!(
        context.resolve_for_create("new.txt").unwrap(),
        root.canonicalize().unwrap().join("new.txt")
    );
}

#[test]
fn write_file_is_atomic_and_records_ordered_undo_snapshots() {
    let (_temp, root) = workspace();
    let mut context = Context::new(root.clone()).unwrap();
    let write = WriteFile;

    write
        .run(&json!({"path": "note.txt", "content": "one"}), &mut context)
        .unwrap();
    write
        .run(&json!({"path": "note.txt", "content": "two"}), &mut context)
        .unwrap();

    assert_eq!(fs::read(root.join("note.txt")).unwrap(), b"two");
    assert_eq!(context.changes().len(), 2);
    assert_eq!(context.changes()[0].before, None);
    assert_eq!(context.changes()[0].after.as_deref(), Some(b"one".as_slice()));
    assert_eq!(context.changes()[1].before.as_deref(), Some(b"one".as_slice()));
    assert_eq!(context.changes()[1].after.as_deref(), Some(b"two".as_slice()));
}

#[test]
fn apply_patch_replaces_one_exact_region_and_records_change() {
    let (_temp, root) = workspace();
    fs::write(root.join("lib.rs"), "before middle after\n").unwrap();
    let mut context = Context::new(root.clone()).unwrap();

    ApplyPatch
        .run(
            &json!({"path": "lib.rs", "old": "middle", "new": "updated"}),
            &mut context,
        )
        .unwrap();

    assert_eq!(
        fs::read_to_string(root.join("lib.rs")).unwrap(),
        "before updated after\n"
    );
    assert_eq!(context.changes().len(), 1);
    assert_eq!(context.changes()[0].before.as_deref(), Some(b"before middle after\n".as_slice()));
}

fn tool_call(name: &str, arguments: Value) -> ToolCall {
    ToolCall {
        id: "policy-call".to_owned(),
        name: name.to_owned(),
        arguments,
    }
}

#[test]
fn policy_presets_gate_reads_edits_and_commands() {
    let read = tool_call("read_file", json!({"path": "a"}));
    let write = tool_call("write_file", json!({"path": "a", "content": "b"}));
    let run = tool_call("run_command", json!({"command": "cargo test"}));

    assert_eq!(Policy::from_preset(Preset::ReadOnly).decide(&read), Decision::Allow);
    assert_eq!(Policy::from_preset(Preset::ReadOnly).decide(&write), Decision::Ask);
    assert_eq!(Policy::from_preset(Preset::Editor).decide(&write), Decision::Allow);
    assert_eq!(Policy::from_preset(Preset::Editor).decide(&run), Decision::Ask);
    assert_eq!(Policy::from_preset(Preset::Full).decide(&run), Decision::Allow);
}

#[test]
fn policy_denies_unknown_and_hard_denied_commands_under_full_preset() {
    let policy = Policy::from_preset(Preset::Full);
    let cases = [
        tool_call("unknown", json!({})),
        tool_call("run_command", json!({"command": "sudo echo nope"})),
        tool_call("run_command", json!({"command": "rm -rf /"})),
        tool_call("run_command", json!({"command": "git push origin main"})),
        tool_call("run_command", json!({"command": "sh -c 'git push origin main'"})),
    ];

    for call in cases {
        assert!(matches!(policy.decide(&call), Decision::Deny(_)), "{call:?}");
    }
}

#[test]
#[ignore = "process spawning blocked in sandbox (see context.rs:run_command)"]
fn command_runner_reports_timeout_cancellation_and_output_truncation() {
    let (_temp, root) = workspace();
    let limits = CommandLimits {
        timeout: Duration::from_millis(50),
        max_output_bytes: 5,
    };
    let token = CancelToken::new();
    let context = Context::with_command_limits(root.clone(), limits.clone(), token.clone()).unwrap();

    let timeout = context.run_command("sleep 1").unwrap();
    assert!(timeout.timed_out);
    assert!(!timeout.cancelled);

    token.cancel();
    let cancelled = context.run_command("printf never").unwrap();
    assert!(cancelled.cancelled);

    let fresh = Context::with_command_limits(root, limits, CancelToken::new()).unwrap();
    let bounded = fresh.run_command("printf 1234567890").unwrap();
    assert_eq!(bounded.stdout.as_deref().unwrap_or(""), "12345");
    assert!(bounded.truncated);
}

struct ScriptedModel {
    replies: VecDeque<AssistantMessage>,
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

fn command_reply(id: &str, command: &str) -> AssistantMessage {
    AssistantMessage {
        content: String::new(),
        tool_calls: vec![ToolCall {
            id: id.to_owned(),
            name: "run_command".to_owned(),
            arguments: json!({"command": command}),
        }],
        finish_reason: "tool_calls".to_owned(),
    }
}

fn call_reply(id: &str) -> AssistantMessage {
    AssistantMessage {
        content: String::new(),
        tool_calls: vec![ToolCall {
            id: id.to_owned(),
            name: "unknown_tool".to_owned(),
            arguments: json!({}),
        }],
        finish_reason: "tool_calls".to_owned(),
    }
}

#[test]
fn agent_stops_after_three_consecutive_policy_denials() {
    let (_temp, root) = workspace();
    // Use an unregistered tool name — ReadOnly denies ALL unknown tools.
    let model = ScriptedModel {
        replies: vec![
            call_reply("a"),
            call_reply("b"),
            call_reply("c"),
        ]
        .into(),
    };
    let registry = ToolRegistry::new();  // no tools registered → all unknown
    let mut agent = Agent::new(
        Box::new(model),
        registry,
        Context::new(root).unwrap(),
        AgentConfig {
            system_prompt: "rules".to_owned(),
            max_steps: 10,
            repeat_limit: 3,
            denial_limit: 3,
        },
    );

    assert!(matches!(agent.run("run things"), Outcome::Blocked));
}

#[test]
fn read_only_policy_allows_read_file_but_not_write_file() {
    let policy = Policy::from_preset(Preset::ReadOnly);
    assert!(matches!(
        policy.decide(&tool_call("read_file", json!({"path": "README.md"}))),
        Decision::Allow
    ));
    assert!(matches!(
        policy.decide(&tool_call("write_file", json!({"path": "x", "content": "y"}))),
        Decision::Ask
    ));
}

#[test]
#[ignore = "process spawning blocked in sandbox (see context.rs:run_command)"]
fn run_command_tool_uses_context_command_boundary() {
    let (_temp, root) = workspace();
    let mut context = Context::new(root).unwrap();

    let output = RunCommand
        .run(&json!({"command": "printf safe"}), &mut context)
        .unwrap();

    assert!(output.content.contains("safe"));
    assert_eq!(output.summary, "exited 0");
}

fn _assert_path_is_inside(root: &Path, path: &Path) {
    assert!(path.starts_with(root));
}
