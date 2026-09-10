use super::*;

#[test]
fn nested_ordered_pairs_and_original_spans() {
    let input = "\u{feff}// authored fixture\r\n\"Root\" {\r\n unquoted \"line\\nquote\\\"\\\\\" // trailing\n child { \"Game\" \"a\" Game b }\n}";
    let parsed = parse(input.as_bytes()).unwrap();
    assert_eq!(parsed.len(), 1);
    assert_eq!(
        &input[parsed[0].span.clone()],
        &input[input.find('"').unwrap()..]
    );
    let Value::Object(children) = &parsed[0].value else {
        panic!()
    };
    assert_eq!(children[0].value, Value::Text("line\nquote\"\\".into()));
    let Value::Object(paths) = &children[1].value else {
        panic!()
    };
    assert_eq!(
        paths.iter().map(|entry| &entry.key).collect::<Vec<_>>(),
        ["Game", "Game"]
    );
    assert_eq!(&input[paths[1].span.clone()], "Game b");
    assert_eq!(&input[paths[0].value_span.clone()], "\"a\"");
}

#[test]
fn quotes_comments_and_unicode_are_data() {
    let parsed =
        parse("k \"https://fixture.invalid/{x}\" // skip\n u \"é水\" empty \"\"".as_bytes())
            .unwrap();
    assert_eq!(
        parsed[0].value,
        Value::Text("https://fixture.invalid/{x}".into())
    );
    assert_eq!(parsed[1].value, Value::Text("é水".into()));
    assert_eq!(parsed[2].value, Value::Text(String::new()));
    assert!(parse(b"// only a comment").unwrap().is_empty());
    assert_eq!(
        parse(b"game fixture/custom/*").unwrap()[0].value,
        Value::Text("fixture/custom/*".into())
    );
}

#[test]
fn rejects_truncation_directives_conditionals_and_unknown_escapes() {
    for bad in [
        "k",
        "k {",
        "k }",
        "{ k v }",
        "k { v }",
        "k \"unterminated",
        "k \"x\\q\"",
        "#include x",
        "\"#base\" x",
        "k v [$WIN32]",
        "k \"raw\nnewline\"",
        "k v }",
        "root { /* */ }",
    ] {
        assert!(parse(bad.as_bytes()).is_err(), "{bad}");
    }
    assert_eq!(parse(b"k \"a\0b\""), Err(Error::Encoding));
    assert_eq!(parse(&[0xff]), Err(Error::Encoding));
}

#[test]
fn limits_total_bytes_depth_pairs_and_single_token() {
    assert_eq!(parse(&vec![b' '; MAX_INPUT_BYTES + 1]), Err(Error::Limit));
    let deep = format!(
        "{}{}",
        "k { ".repeat(MAX_DEPTH + 1),
        "}".repeat(MAX_DEPTH + 1)
    );
    assert_eq!(parse(deep.as_bytes()), Err(Error::Limit));
    assert_eq!(
        parse("k v ".repeat(MAX_PAIRS + 1).as_bytes()),
        Err(Error::Limit)
    );
    assert_eq!(
        parse(format!("k \"{}\"", "é".repeat(MAX_TOKEN_BYTES)).as_bytes()),
        Err(Error::Limit)
    );
}

#[test]
fn deterministic_hostile_byte_corpus_never_panics() {
    // Byte truncations, invalid UTF-8 and control punctuation stress boundaries.
    let valid = "Root { path \"C:\\\\Fixture\\\\é\" inner { a b } }".as_bytes();
    for len in 0..=valid.len() {
        let _ = parse(&valid[..len]);
    }
    let mut seed = 0xa5b3_1789_u64;
    for size in 0..1024 {
        let bytes: Vec<_> = (0..size)
            .map(|_| {
                seed ^= seed << 13;
                seed ^= seed >> 7;
                seed ^= seed << 17;
                seed as u8
            })
            .collect();
        let _ = parse(&bytes);
        let ascii: Vec<_> = bytes.iter().map(|byte| byte & 0x7f).collect();
        let _ = parse(&ascii);
    }
}
