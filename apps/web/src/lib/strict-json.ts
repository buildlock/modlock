// Built-in JSON parsing provides grammar validation. This second lexical pass
// rejects duplicate object keys, including keys with equivalent JSON escapes.
export function uniqueKeyJson(text: string): unknown {
  const value: unknown = JSON.parse(text);
  const objects: Set<string>[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") objects.push(new Set());
    else if (text[i] === "}") objects.pop();
    else if (text[i] === '"') {
      const start = i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === "\\") i++;
        i++;
      }
      let next = i + 1;
      while (/\s/.test(text[next] ?? "\0")) next++;
      if (text[next] === ":") {
        const key = JSON.parse(text.slice(start, i + 1)) as string,
          keys = objects.at(-1)!;
        if (keys.has(key))
          throw new Error("Duplicate JSON keys are not supported.");
        keys.add(key);
      }
    }
  }
  return value;
}
