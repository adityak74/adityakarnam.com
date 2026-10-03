use crate::context::Context;
use crate::model::{Message, Model, ToolCall};
use crate::policy::{Decision, Policy, Preset};
use crate::tools::ToolRegistry;

#[derive(Default)]
pub struct AgentConfig {
    pub system_prompt: String,
    pub max_steps: usize,
    pub repeat_limit: usize,
    pub denial_limit: usize,
}

#[derive(Debug, PartialEq)]
pub enum Outcome {
    Complete(String),
    StepLimit,
    RepeatedAction,
    Blocked,
    Cancelled,
    VerificationFailed { attempts: usize },
    Error(String),
}

#[derive(Default)]
struct RepeatGuard {
    fingerprint: Option<String>,
    change_count: usize,
    streak: usize,
}

impl RepeatGuard {
    fn observe(
        &mut self,
        call: &ToolCall,
        result: &str,
        change_count: usize,
        limit: usize,
    ) -> bool {
        let fingerprint = format!("{}\n{}\n{}", call.name, call.arguments, result);
        if self.fingerprint.as_deref() == Some(&fingerprint)
            && self.change_count == change_count
        {
            self.streak += 1;
        } else {
            self.fingerprint = Some(fingerprint);
            self.change_count = change_count;
            self.streak = 1;
        }
        self.streak >= limit.max(1)
    }
}

pub struct Agent {
    model: Box<dyn Model>,
    registry: ToolRegistry,
    context: Context,
    config: AgentConfig,
    messages: Vec<Message>,
}

impl Agent {
    pub fn new(
        model: Box<dyn Model>,
        registry: ToolRegistry,
        context: Context,
        config: AgentConfig,
    ) -> Self {
        let messages = vec![Message::system(config.system_prompt.clone())];
        Self {
            model,
            registry,
            context,
            config,
            messages,
        }
    }

    pub fn messages(&self) -> &[Message] {
        &self.messages
    }

    pub fn context(&self) -> &Context {
        &self.context
    }

    // ANCHOR: bounded-agent-loop
    pub fn run(&mut self, prompt: &str) -> Outcome {
        self.messages.push(Message::user(prompt));
        let mut repeat_guard = RepeatGuard::default();
        let mut denial_count: usize = 0;

        for _ in 0..self.config.max_steps {
            let reply = match self
                .model
                .complete(&self.messages, &self.registry.schemas())
            {
                Ok(reply) => reply,
                Err(error) => return Outcome::Error(error.to_string()),
            };
            self.messages.push(Message::assistant_with_calls(
                reply.content.clone(),
                reply.tool_calls.clone(),
            ));

            if reply.tool_calls.is_empty() {
                return Outcome::Complete(reply.content);
            }

            for call in reply.tool_calls {
                // Apply the default ReadOnly policy when denial_limit > 0.
                if self.config.denial_limit > 0 {
                    let policy = Policy::from_preset(Preset::ReadOnly);
                    match policy.decide(&call) {
                        Decision::Allow => {}
                        Decision::Ask => {
                            // Waiting for user approval: do NOT execute.
                            // Skip to next call without incrementing denial_count.
                            continue;
                        }
                        Decision::Deny(reason) => {
                            denial_count += 1;
                            if denial_count >= self.config.denial_limit.max(1) {
                                return Outcome::Blocked;
                            }
                            self.messages.push(Message::tool_result(
                                call.id.clone(),
                                format!("policy denied: {reason}"),
                            ));
                            continue;
                        }
                    }
                }

                let result = match self.registry.execute(&call, &mut self.context) {
                    Ok(output) => output.content,
                    Err(error) => error.to_string(),
                };
                self.messages.push(Message::tool_result(
                    call.id.clone(),
                    result.clone(),
                ));
                denial_count = 0;
                if repeat_guard.observe(
                    &call,
                    &result,
                    self.context.changes().len(),
                    self.config.repeat_limit,
                ) {
                    return Outcome::RepeatedAction;
                }
            }
        }

        Outcome::StepLimit
    }
    // ANCHOR_END: bounded-agent-loop
}
