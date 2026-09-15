"use client";
import { useState, useRef } from "react";
import { parseKeyValues } from "@/lib/keyvalues";
import { readVpkHeader, inspectVpkDirectory, type VpkEntry } from "@/lib/vpk";
const example =
  '"Modlock example"\n{\n    "title" "A new look"\n    "tag" "cosmetic"\n    "tag" "community"\n}\n';
export function FileInspector({ mode }: { mode: "keyvalues" | "vpk" }) {
  const [input, setInput] = useState(""),
    [output, setOutput] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [filename, setFilename] = useState(""),
    [entries, setEntries] = useState<VpkEntry[]>([]),
    [filter, setFilter] = useState(""),
    [page, setPage] = useState(1),
    [message, setMessage] = useState("");
  const generation = useRef(0),
    vpk = mode === "vpk";
  const filtered = entries.filter((e) =>
    e.path.toLowerCase().includes(filter.toLowerCase()),
  );
  async function select(file: File | undefined) {
    const run = ++generation.current;
    setError("");
    setOutput("");
    setMessage("");
    setEntries([]);
    setFilename("");
    setBusy(!!file);
    setPage(1);
    if (!file) return;
    try {
      if (vpk) {
        const header = readVpkHeader(
          new Uint8Array(await file.slice(0, 28).arrayBuffer()),
          file.size,
        );
        const result = inspectVpkDirectory(
          new Uint8Array(
            await file
              .slice(0, header.headerSize + header.treeSize)
              .arrayBuffer(),
          ),
          file.size,
        );
        if (run !== generation.current) return;
        setEntries(result.entries);
        setOutput(
          `VPK v${header.version} · ${result.entries.length.toLocaleString()} entries · ${result.totalBytes.toLocaleString()} declared asset bytes · ${result.warnings} path warnings`,
        );
      } else {
        if (file.size > 1024 * 1024)
          throw new Error("Use a text file no larger than 1 MiB.");
        const text = new TextDecoder("utf-8", { fatal: true }).decode(
          await file.arrayBuffer(),
        );
        if (run !== generation.current) return;
        setInput(text);
        setOutput(JSON.stringify(parseKeyValues(text), null, 2));
      }
      setFilename(file.name);
    } catch (e) {
      if (run === generation.current)
        setError(
          e instanceof Error ? e.message : "This file could not be read.",
        );
    } finally {
      if (run === generation.current) setBusy(false);
    }
  }
  return (
    <>
      <section className="file-picker settings-panel">
        <label htmlFor="inspection-file">
          {vpk ? "Choose a VPK directory file" : "Choose a KeyValues text file"}
        </label>
        <input
          id="inspection-file"
          type="file"
          accept={vpk ? ".vpk" : ".vdf,.acf,.res,.txt,.kv"}
          onChange={(e) => void select(e.target.files?.[0])}
        />
        <p className="field-help">
          {vpk
            ? "Reads at most an 8 MiB directory and 50,000 entries. Assets are not extracted, hashed or scanned. Numbered archive segments are unsupported on their own."
            : "UTF-8 text up to 1 MiB, 16 nesting levels and 8192 pairs. Duplicate keys retain their order. Includes, conditionals, KV3 and binary formats are unsupported."}{" "}
          Files stay in this browser tab.
        </p>
        {busy && <p role="status">Reading directory…</p>}
        {filename && <p className="field-help">Loaded {filename}</p>}
      </section>
      {!vpk && (
        <div className="tool-workbench">
          <section className="settings-panel">
            <h2>Paste KeyValues</h2>
            <form
              className="account-form"
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  setOutput(JSON.stringify(parseKeyValues(input), null, 2));
                  setError("");
                  setMessage("Parsed. Ordered pairs preserve duplicate keys.");
                } catch (e) {
                  setError(
                    e instanceof Error
                      ? e.message
                      : "Could not parse this text.",
                  );
                  setOutput("");
                }
              }}
            >
              <label htmlFor="keyvalues-source">Source text</label>
              <textarea
                id="keyvalues-source"
                rows={14}
                maxLength={1024 * 1024}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setOutput("");
                  setMessage("");
                }}
                spellCheck={false}
                required
              />
              <div className="button-row">
                <button className="button primary-button">Parse text</button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    setInput(example);
                    setOutput("");
                    setError("");
                  }}
                >
                  Load example
                </button>
              </div>
            </form>
          </section>
          <section className="settings-panel">
            <h2>Ordered JSON</h2>
            {output ? (
              <>
                <pre className="tool-output">{output}</pre>
                <a
                  className="text-link"
                  download="modlock-keyvalues.json"
                  href={`data:application/json;charset=utf-8,${encodeURIComponent(output)}`}
                >
                  Download JSON
                </a>
              </>
            ) : (
              <p className="panel-copy">
                Parsed pairs appear here. Values remain strings and objects
                remain ordered lists.
              </p>
            )}
          </section>
        </div>
      )}
      {vpk && output && (
        <section className="settings-panel">
          <p className="panel-copy">{output}</p>
          <p className="field-help">
            Metadata inspection does not establish compatibility, content
            safety, CRC integrity or signature authenticity. External archive
            ranges are listed without access to their files.
          </p>
          <div className="account-form">
            <label htmlFor="vpk-filter">Filter paths</label>
            <input
              id="vpk-filter"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              maxLength={200}
            />
          </div>
          <p className="field-help">
            {filtered.length.toLocaleString()} matching entries
          </p>
          <div className="vpk-table-wrap">
            <table className="vpk-table">
              <thead>
                <tr>
                  <th>Path</th>
                  <th>Bytes</th>
                  <th>Archive</th>
                  <th>Declared CRC32</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * 100, page * 100).map((e, i) => (
                  <tr key={i}>
                    <td>
                      {e.path}
                      {e.warning && (
                        <strong className="path-warning">{e.warning}</strong>
                      )}
                    </td>
                    <td>{e.bytes.toLocaleString()}</td>
                    <td>{e.archive === 0x7fff ? "Embedded" : e.archive}</td>
                    <td>
                      <code>{e.crc32}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="button-row">
            <button
              className="button subtle-button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="field-help">
              Page {page} of {Math.max(1, Math.ceil(filtered.length / 100))}
            </span>
            <button
              className="button subtle-button"
              disabled={page * 100 >= filtered.length}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </section>
      )}
      {(error || message) && (
        <p
          className={`form-message ${error ? "form-error" : "form-success"}`}
          role={error ? "alert" : "status"}
        >
          {error || message}
        </p>
      )}
    </>
  );
}
