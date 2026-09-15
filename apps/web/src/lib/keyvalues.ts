// Original browser adaptation of Modlock's own bounded KeyValues text subset.
export interface KeyValueEntry {
  key: string;
  value: string | KeyValueEntry[];
}
export function parseKeyValues(input: string): KeyValueEntry[] {
  if (new TextEncoder().encode(input).length > 1024 * 1024)
    throw new Error("Use a file no larger than 1 MiB.");
  if (input.includes("\0"))
    throw new Error("Binary KeyValues is not supported.");
  let position = input.startsWith("\uFEFF") ? 1 : 0,
    pairs = 0;
  const fail = (message: string): never => {
    throw new Error(
      `${message} (line ${input.slice(0, position).split("\n").length}).`,
    );
  };
  function trivia() {
    for (;;) {
      while (/[ \t\r\n]/.test(input[position] ?? "\0")) position++;
      if (input.startsWith("//", position)) {
        while (position < input.length && input[position] !== "\n") position++;
      } else return;
    }
  }
  function token(): string {
    const quoted = input[position] === '"';
    if (quoted) position++;
    let output = "";
    for (;;) {
      if (output.length > 4096)
        fail("A token exceeds the 4096-character limit");
      const char = input[position];
      if (char === undefined) {
        if (quoted || !output) fail("Missing or unfinished value");
        return output;
      }
      if (quoted && char === '"') {
        position++;
        return output;
      }
      if (!quoted && /[\s{}"]/.test(char)) {
        if (!output) fail("Expected a key or value");
        return output;
      }
      if (/[\u0000-\u001f\u007f]/.test(char))
        fail("Unexpected control character");
      if (
        !quoted &&
        (/[#[\]]/.test(char) ||
          input.startsWith("/*", position) ||
          input.startsWith("<!--", position))
      )
        fail(
          "Directives, conditionals, block comments and KV3 are unsupported",
        );
      position++;
      if (quoted && char === "\\") {
        const escape = input[position++],
          escapes: Record<string, string> = {
            "\\": "\\",
            '"': '"',
            n: "\n",
            r: "\r",
            t: "\t",
          };
        if (!Object.hasOwn(escapes, escape ?? ""))
          fail("Unsupported escape sequence");
        output += escapes[escape];
      } else output += char;
    }
  }
  function object(depth: number, nested: boolean): KeyValueEntry[] {
    if (depth > 16) fail("Nesting exceeds 16 levels");
    const entries: KeyValueEntry[] = [];
    for (;;) {
      trivia();
      const char = input[position];
      if (char === undefined && !nested) return entries;
      if (char === "}" && nested) {
        position++;
        return entries;
      }
      if (char === undefined || char === "}" || char === "{")
        fail("Unexpected brace or end of input");
      if (++pairs > 8192) fail("More than 8192 key-value pairs");
      const key = token();
      if (!key || key.startsWith("#"))
        fail("Empty keys and directives are unsupported");
      trivia();
      let value: string | KeyValueEntry[];
      if (input[position] === "{") {
        position++;
        value = object(depth + 1, true);
      } else value = token();
      entries.push({ key, value });
    }
  }
  return object(0, false);
}
