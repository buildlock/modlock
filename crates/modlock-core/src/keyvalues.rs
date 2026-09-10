//! Bounded text KeyValues parsing. Ordered pairs and duplicate keys are retained;
//! a semantic consumer must reject ambiguity in each identity-bearing scope.
//! Directives, conditionals and binary/KV3 input are deliberately unsupported.

use std::ops::Range;

pub const MAX_INPUT_BYTES: usize = 1024 * 1024;
const MAX_DEPTH: usize = 16;
const MAX_PAIRS: usize = 8192;
const MAX_TOKEN_BYTES: usize = 4096;

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Entry {
    pub key: String,
    pub value: Value,
    /// Original UTF-8 byte range from key through value, excluding outer trivia.
    pub span: Range<usize>,
    pub value_span: Range<usize>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Value {
    Text(String),
    Object(Vec<Entry>),
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Error {
    Limit,
    Encoding,
    Syntax,
    Unsupported,
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "KeyValues: {self:?}")
    }
}

impl std::error::Error for Error {}

/// Parses a strict, escaped-text subset. No filesystem or include resolution.
pub fn parse(bytes: &[u8]) -> Result<Vec<Entry>, Error> {
    if bytes.len() > MAX_INPUT_BYTES {
        return Err(Error::Limit);
    }
    let text = std::str::from_utf8(bytes).map_err(|_| Error::Encoding)?;
    if text.contains('\0') {
        return Err(Error::Encoding);
    }
    let mut parser = Parser {
        text,
        pos: usize::from(text.starts_with('\u{feff}')) * 3,
        pairs: 0,
    };
    parser.object(0, false)
}

struct Parser<'a> {
    text: &'a str,
    pos: usize,
    pairs: usize,
}

impl Parser<'_> {
    fn peek(&self) -> Option<u8> {
        self.text.as_bytes().get(self.pos).copied()
    }

    fn trivia(&mut self) {
        loop {
            while self.peek().is_some_and(|b| b" \t\r\n".contains(&b)) {
                self.pos += 1;
            }
            if self.text[self.pos..].starts_with("//") {
                while self.peek().is_some_and(|b| b != b'\n') {
                    self.pos += 1;
                }
            } else {
                return;
            }
        }
    }

    fn object(&mut self, depth: usize, nested: bool) -> Result<Vec<Entry>, Error> {
        if depth > MAX_DEPTH {
            return Err(Error::Limit);
        }
        let mut entries = Vec::new();
        loop {
            self.trivia();
            match self.peek() {
                None if !nested => return Ok(entries),
                Some(b'}') if nested => {
                    self.pos += 1;
                    return Ok(entries);
                }
                None | Some(b'}' | b'{') => return Err(Error::Syntax),
                _ => {}
            }
            self.pairs += 1;
            if self.pairs > MAX_PAIRS {
                return Err(Error::Limit);
            }
            let start = self.pos;
            let key = self.token()?;
            if key.is_empty() || key.starts_with('#') {
                return Err(Error::Unsupported);
            }
            self.trivia();
            let value_start = self.pos;
            let value = if self.peek() == Some(b'{') {
                self.pos += 1;
                Value::Object(self.object(depth + 1, true)?)
            } else {
                Value::Text(self.token()?)
            };
            entries.push(Entry {
                key,
                value,
                span: start..self.pos,
                value_span: value_start..self.pos,
            });
        }
    }

    fn token(&mut self) -> Result<String, Error> {
        let start = self.pos;
        let quoted = self.peek() == Some(b'"');
        if quoted {
            self.pos += 1;
        }
        let mut out = String::new();
        loop {
            if self.pos - start > MAX_TOKEN_BYTES {
                return Err(Error::Limit);
            }
            let Some(c) = self.text[self.pos..].chars().next() else {
                return if quoted || out.is_empty() {
                    Err(Error::Syntax)
                } else {
                    Ok(out)
                };
            };
            if quoted && c == '"' {
                self.pos += 1;
                return Ok(out);
            }
            if !quoted && (matches!(c, '{' | '}' | '"') || c.is_ascii_whitespace()) {
                return if out.is_empty() {
                    Err(Error::Syntax)
                } else {
                    Ok(out)
                };
            }
            if c.is_control() {
                return Err(Error::Syntax);
            }
            if !quoted && matches!(c, '#' | '[' | ']') {
                return Err(Error::Unsupported);
            }
            if !quoted && self.pos == start && self.text[self.pos..].starts_with("/*") {
                return Err(Error::Unsupported);
            }
            self.pos += c.len_utf8();
            if quoted && c == '\\' {
                let escaped = match self.peek() {
                    Some(b'\\') => '\\',
                    Some(b'"') => '"',
                    Some(b'n') => '\n',
                    Some(b'r') => '\r',
                    Some(b't') => '\t',
                    _ => return Err(Error::Unsupported),
                };
                self.pos += 1;
                out.push(escaped);
            } else {
                out.push(c);
            }
        }
    }
}

#[cfg(test)]
mod tests;
