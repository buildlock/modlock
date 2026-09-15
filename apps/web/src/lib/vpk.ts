// Directory metadata only. Never extracts, executes or verifies asset content.
export const MAX_VPK_TREE = 8 * 1024 * 1024;
export interface VpkEntry {
  path: string;
  bytes: number;
  archive: number;
  offset: number;
  crc32: string;
  warning: string | null;
}
export interface VpkHeader {
  version: 1 | 2;
  headerSize: number;
  treeSize: number;
  embeddedSize: number;
}
export function readVpkHeader(bytes: Uint8Array, totalSize: number): VpkHeader {
  if (bytes.length < 12) throw new Error("Truncated VPK header.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== 0x55aa1234)
    throw new Error("This is not a supported VPK directory file.");
  const version = view.getUint32(4, true);
  if (version !== 1 && version !== 2)
    throw new Error("Only VPK directory versions 1 and 2 are supported.");
  const headerSize = version === 1 ? 12 : 28,
    treeSize = view.getUint32(8, true);
  if (bytes.length < headerSize) throw new Error("Truncated VPK header.");
  if (!treeSize || treeSize > MAX_VPK_TREE)
    throw new Error("The VPK directory exceeds the 8 MiB limit or is empty.");
  if (headerSize + treeSize > totalSize)
    throw new Error("Directory extends past the end of the file.");
  const embeddedSize =
    version === 1
      ? totalSize - headerSize - treeSize
      : view.getUint32(12, true);
  if (version === 2) {
    const sectionBytes =
      embeddedSize +
      view.getUint32(16, true) +
      view.getUint32(20, true) +
      view.getUint32(24, true);
    if (headerSize + treeSize + sectionBytes > totalSize)
      throw new Error("Declared VPK sections exceed the file size.");
  }
  return { version, headerSize, treeSize, embeddedSize };
}
export function inspectVpkDirectory(bytes: Uint8Array, totalSize: number) {
  const header = readVpkHeader(bytes, totalSize),
    end = header.headerSize + header.treeSize;
  if (bytes.length < end) throw new Error("Truncated VPK directory.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    decoder = new TextDecoder("utf-8", { fatal: true });
  let pos = header.headerSize;
  const entries: VpkEntry[] = [],
    seen = new Set<string>();
  function string() {
    const start = pos;
    while (pos < end && bytes[pos] !== 0) {
      if (pos - start >= 1024)
        throw new Error("A VPK path component exceeds 1024 bytes.");
      pos++;
    }
    if (pos >= end) throw new Error("Unterminated VPK directory string.");
    const result = decoder.decode(bytes.subarray(start, pos));
    pos++;
    return result;
  }
  for (let extension = string(); extension !== ""; extension = string()) {
    for (let directory = string(); directory !== ""; directory = string()) {
      for (let name = string(); name !== ""; name = string()) {
        if (entries.length >= 50_000)
          throw new Error("Directory exceeds 50,000 entries.");
        if (pos + 18 > end) throw new Error("Truncated VPK entry.");
        const crc32 = view.getUint32(pos, true).toString(16).padStart(8, "0"),
          preload = view.getUint16(pos + 4, true),
          archive = view.getUint16(pos + 6, true),
          offset = view.getUint32(pos + 8, true),
          length = view.getUint32(pos + 12, true);
        if (view.getUint16(pos + 16, true) !== 0xffff)
          throw new Error("Invalid VPK entry terminator.");
        pos += 18;
        if (pos + preload > end)
          throw new Error("Preloaded data extends past the directory.");
        pos += preload;
        if (archive === 0x7fff && offset + length > header.embeddedSize)
          throw new Error(
            "An embedded entry extends past the declared data section.",
          );
        const path =
          (directory === " " ? "" : `${directory}/`) +
          name +
          (extension === " " ? "" : `.${extension}`);
        const unsafe =
          /[\\:\u0000-\u001f\u007f]/.test(path) ||
          path.startsWith("/") ||
          path.split("/").some((p) => !p || p === "." || p === "..") ||
          /[\/]/.test(name) ||
          /[\/]/.test(extension);
        const identity = path.normalize("NFC").toLowerCase();
        const warning = unsafe
          ? "Unsafe path"
          : seen.has(identity)
            ? "Duplicate path"
            : null;
        seen.add(identity);
        entries.push({
          path,
          bytes: preload + length,
          archive,
          offset,
          crc32,
          warning,
        });
      }
    }
  }
  if (pos !== end)
    throw new Error("Unexpected trailing bytes in the directory tree.");
  return {
    header,
    entries,
    totalBytes: entries.reduce((sum, e) => sum + e.bytes, 0),
    warnings: entries.filter((e) => e.warning).length,
  };
}
