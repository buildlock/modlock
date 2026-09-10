//! A bounded, single-transaction proof in a newly created synthetic sandbox.
//!
//! This is not a game installer or the production Windows filesystem adapter.
//! All inputs are inert text, paths are fixed, and previous/candidate trees are
//! retained for inspection. No network, game discovery, archive, SQLite, UI or
//! public install-plan contract is implemented here.

mod synthetic;

pub use synthetic::{Error, Generation, Outcome, Sandbox};
