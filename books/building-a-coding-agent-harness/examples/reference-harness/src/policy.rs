use crate::model::ToolCall;
use serde_json::Value;
use std::collections::BTreeSet;

/// Outcome of a policy gate.

#[derive(Clone, Debug, PartialEq)]
pub enum Decision {
    Allow,
    Ask,
    Deny(String),
}

/// Policy presets that trade convenience against safety.

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Preset {
    ReadOnly,
    Editor,
    Full,
}

/// Hardcoded commands that even Full never permits.

const HARD_DENY: &[&str] = &[
    "sudo ", "sudo;", "sudo$",
    "git push", "git push ", "git push;",
    "sh -c", "sh -c'", "sh -c\"",
    "rm -rf /",
];

/// Union of ALL known tool names (used to distinguish "unknown" from "allowed in another preset").

const ALL_TOOLS: &[&str] = &["read_file", "write_file", "apply_patch", "run_command"];

fn is_known_tool(name: &str) -> bool {
    ALL_TOOLS.contains(&name)
}

/// Summary of a spawned command execution.

#[derive(Clone, Debug, PartialEq)]
pub struct ToolSummary {
    pub stdout: Option<String>,
    pub stderr: Option<String>,
    pub exit_code: Option<i32>,
    pub truncated: bool,
    pub timed_out: bool,
    pub cancelled: bool,
}

/// A policy evaluator that gates tool calls according to a preset.

#[derive(Clone, Debug)]
pub struct Policy {
    presets: BTreeSet<&'static str>,
    deny_list: &'static [&'static str],
}

impl Policy {
    pub fn from_preset(preset: Preset) -> Self {
        let presets = match preset {
            Preset::ReadOnly => {
                let mut p = BTreeSet::new();
                p.insert("read_file");
                p
            }
            Preset::Editor => {
                let mut p = BTreeSet::new();
                p.insert("read_file");
                p.insert("write_file");
                p.insert("apply_patch");
                p
            }
            Preset::Full => {
                let mut p = BTreeSet::new();
                p.insert("read_file");
                p.insert("write_file");
                p.insert("apply_patch");
                p.insert("run_command");
                p
            }
        };
        Self {
            presets,
            deny_list: HARD_DENY,
        }
    }

    /// Return the decision for a single tool call under this policy.

    pub fn decide(&self, call: &ToolCall) -> Decision {
        // 1. Hard-denied commands always fail.
        if self.deny_list.iter().any(|d| {
            call.arguments
                .get("command")
                .and_then(Value::as_str)
                .map(|c| c.contains(d))
                .unwrap_or(false)
        }) {
            return Decision::Deny("hard-denied command".to_owned());
        }

        let known = is_known_tool(call.name.as_str());
        let in_preset = self.presets.contains(call.name.as_str());

        match (known, in_preset) {
            (true, true) => Decision::Allow,
            (true, false) => Decision::Ask,
            (false, _) => Decision::Deny(format!("unknown tool '{}'", call.name)),
        }
    }
}
