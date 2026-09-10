//! Developer demonstration. The root must not exist for `create`.
use modlock_core::{Generation, Sandbox};
use std::collections::BTreeMap;
use std::path::PathBuf;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<_> = std::env::args_os().skip(1).collect();
    if args.len() != 2 {
        return Err("usage: synthetic_journal <create|recover> <synthetic-root>".into());
    }
    let root = PathBuf::from(&args[1]);
    let outcome = match args[0].to_str() {
        Some("create") => {
            let initial = Generation::new(BTreeMap::from([(
                "example.txt".into(),
                b"MODLOCK SYNTHETIC\noriginal\n".to_vec(),
            )]))?;
            let desired = Generation::new(BTreeMap::from([(
                "example.txt".into(),
                b"MODLOCK SYNTHETIC\nreplacement\n".to_vec(),
            )]))?;
            Sandbox::create(&root, initial)?.activate(desired, || false)?
        }
        Some("recover") => Sandbox::open(&root)?.recover()?,
        _ => return Err("expected create or recover".into()),
    };
    println!("{outcome:?}");
    Ok(())
}
