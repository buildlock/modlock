//! UI-independent Modlock prototypes: synthetic transaction/recovery, bounded
//! KeyValues parsing and read-only discovery in explicitly marked fixture trees.
//! No real Steam registration, game process, installer, network, archive, SQLite,
//! UI or public install-plan consumption is implemented here.

pub mod keyvalues;
pub mod steam;

mod synthetic;

pub use synthetic::{Error, Generation, Outcome, Sandbox};
