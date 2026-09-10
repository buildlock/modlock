//! UI-independent Modlock prototypes: synthetic transaction/recovery, bounded
//! KeyValues parsing, read-only fixture discovery and owned gameinfo byte-edit plans.
//! No real Steam registration, game process, installer, network, archive, SQLite,
//! UI or public install-plan consumption is implemented here.

pub mod gameinfo;
pub mod keyvalues;
pub mod steam;

mod synthetic;

pub use synthetic::{Error, Generation, Outcome, Sandbox};
