use std::error::Error;
use std::fmt;
use std::path::PathBuf;

#[derive(Clone, Debug, PartialEq)]
pub struct FileChange {
    pub path: PathBuf,
    pub before: Option<Vec<u8>>,
    pub after: Option<Vec<u8>>,
}

#[derive(Debug)]
pub struct ContextError(pub String);

impl fmt::Display for ContextError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "repository context error: {}", self.0)
    }
}

impl Error for ContextError {}

pub struct Context {
    pub repo_root: PathBuf,
    changes: Vec<FileChange>,
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
        })
    }

    pub fn changes(&self) -> &[FileChange] {
        &self.changes
    }

    pub fn record_change(&mut self, change: FileChange) {
        self.changes.push(change);
    }
}

