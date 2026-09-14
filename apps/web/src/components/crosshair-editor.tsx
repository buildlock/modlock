"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  crosshairDocument,
  defaultCrosshair,
  readCrosshair,
  type CrosshairDesign,
  type CrosshairDocument,
} from "@/lib/crosshair";
import { storeCrosshair, deleteCrosshair } from "@/app/actions/crosshairs";
export function CrosshairEditor({
  signedIn,
  saved,
}: {
  signedIn: boolean;
  saved: { id: string; name: string; document: CrosshairDocument }[];
}) {
  const [design, setDesign] = useState(defaultCrosshair),
    [text, setText] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [background, setBackground] = useState("night"),
    [pending, start] = useTransition();
  const router = useRouter();
  useEffect(() => {
    function loadSharedDesign() {
      if (window.location.hash.startsWith("#design=")) {
        try {
          setDesign(
            readCrosshair(decodeURIComponent(window.location.hash.slice(8)))
              .design,
          );
          setMessage("Shared design loaded. Game rendering is unverified.");
          setError("");
        } catch {
          setError("This shared design is invalid or unsupported.");
        }
      }
    }
    loadSharedDesign();
    window.addEventListener("hashchange", loadSharedDesign);
    return () => window.removeEventListener("hashchange", loadSharedDesign);
  }, []);
  const document = crosshairDocument(design),
    json = JSON.stringify(document, null, 2);
  function patch(key: keyof CrosshairDesign, value: number | boolean | string) {
    setDesign((d) => ({ ...d, [key]: value }));
  }
  async function copy(value: string, success: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(success);
      setError("");
    } catch {
      setError(
        "Clipboard access is unavailable. Select and copy the JSON below.",
      );
    }
  }
  const lines = [
    [
      -design.gap - design.length,
      -design.thickness / 2,
      design.length,
      design.thickness,
    ],
    [design.gap, -design.thickness / 2, design.length, design.thickness],
    [
      -design.thickness / 2,
      -design.gap - design.length,
      design.thickness,
      design.length,
    ],
    [-design.thickness / 2, design.gap, design.thickness, design.length],
  ];
  return (
    <>
      <div className="tool-workbench">
        <section className="settings-panel">
          <h2>Shape your view</h2>
          <div className="account-form">
            {(
              [
                ["length", "Line length", 0, 40],
                ["thickness", "Thickness", 1, 10],
                ["gap", "Center gap", 0, 30],
                ["dot", "Center dot", 0, 12],
                ["opacity", "Opacity", 10, 100],
              ] as const
            ).map(([key, label, min, max]) => (
              <div className="range-control" key={key}>
                <label htmlFor={`crosshair-${key}`}>{label}</label>
                <output aria-hidden="true">
                  {design[key]}
                  {key === "opacity" ? "%" : " px"}
                </output>
                <input
                  id={`crosshair-${key}`}
                  type="range"
                  min={min}
                  max={max}
                  value={design[key]}
                  aria-valuetext={`${design[key]} ${key === "opacity" ? "percent" : "pixels"}`}
                  onChange={(e) => patch(key, Number(e.target.value))}
                />
              </div>
            ))}
            <label htmlFor="crosshair-color">Color</label>
            <input
              id="crosshair-color"
              type="color"
              value={design.color}
              onChange={(e) => patch("color", e.target.value)}
            />
            <label className="check-label">
              <input
                type="checkbox"
                checked={design.outline}
                onChange={(e) => patch("outline", e.target.checked)}
              />
              Black outline
            </label>
            <button
              type="button"
              className="text-link"
              onClick={() => setDesign(defaultCrosshair)}
            >
              Reset design
            </button>
          </div>
        </section>
        <section className="crosshair-stage">
          <div className={`crosshair-preview crosshair-bg-${background}`}>
            <div className="preview-grid" />
            <svg
              width="220"
              height="220"
              viewBox="-110 -110 220 220"
              role="img"
              aria-label={`Crosshair: ${design.color}, line length ${design.length}, thickness ${design.thickness}, gap ${design.gap}, dot ${design.dot}, opacity ${design.opacity} percent`}
            >
              <g
                fill={design.color}
                opacity={design.opacity / 100}
                stroke={design.outline ? "#07110c" : "none"}
                strokeWidth={design.outline ? 1 : 0}
                paintOrder="stroke"
              >
                {lines.map(([x, y, width, height], i) => (
                  <rect key={i} x={x} y={y} width={width} height={height} />
                ))}
                {design.dot > 0 && <circle r={design.dot / 2} />}
              </g>
            </svg>
            <span>APPROXIMATE PREVIEW · 1×</span>
          </div>
          <div
            className="button-row preview-backgrounds"
            aria-label="Preview background"
          >
            {["night", "fog", "paper"].map((b) => (
              <button
                key={b}
                className="button subtle-button"
                aria-pressed={background === b}
                onClick={() => setBackground(b)}
              >
                {b}
              </button>
            ))}
          </div>
          <p className="field-help">
            Measurements describe this preview. In-game rendering and commands
            have not been validated against the current Deadlock build.
          </p>
        </section>
      </div>
      <div className="tool-workbench">
        <section className="settings-panel">
          <h2>Keep or share a design</h2>
          <p className="panel-copy">
            Export a Modlock design, or copy a link that includes its settings.
            These designs do not apply game configuration.
          </p>
          <div className="button-row">
            <button
              className="button subtle-button"
              onClick={() => void copy(json, "Design JSON copied.")}
            >
              Copy JSON
            </button>
            <button
              className="text-link"
              onClick={() =>
                void copy(
                  `${window.location.origin}/tools/crosshair#design=${encodeURIComponent(JSON.stringify(document))}`,
                  "Share link copied. Anyone with the link can load this design.",
                )
              }
            >
              Copy share link
            </button>
            <a
              className="text-link"
              download="modlock-crosshair.json"
              href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`}
            >
              Download JSON
            </a>
          </div>
          <pre className="tool-output">{json}</pre>
          {signedIn ? (
            <form
              className="account-form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget,
                  name = String(new FormData(form).get("name") ?? "");
                start(async () => {
                  const result = await storeCrosshair(name, document);
                  setError(result.ok ? "" : result.message);
                  setMessage(result.ok ? result.message : "");
                  if (result.ok) {
                    form.reset();
                    router.refresh();
                  }
                });
              }}
            >
              <label htmlFor="design-name">Design name</label>
              <input
                id="design-name"
                name="name"
                maxLength={50}
                required
                placeholder="My everyday crosshair"
              />
              <button className="button primary-button" disabled={pending}>
                Save to my account
              </button>
            </form>
          ) : (
            <Link
              className="text-link"
              href="/sign-in?next=%2Ftools%2Fcrosshair"
            >
              Sign in to save designs →
            </Link>
          )}
        </section>
        <section className="settings-panel">
          <h2>Import a design</h2>
          <form
            className="account-form"
            onSubmit={(e) => {
              e.preventDefault();
              try {
                setDesign(readCrosshair(text).design);
                setError("");
                setMessage("Design imported.");
              } catch {
                setError(
                  "Use a valid Modlock version 1 design with supported values.",
                );
              }
            }}
          >
            <label htmlFor="design-json">Modlock design JSON</label>
            <textarea
              id="design-json"
              rows={10}
              maxLength={4096}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              spellCheck={false}
            />
            <button className="button subtle-button">Import design</button>
          </form>
        </section>
      </div>
      {signedIn && (
        <section className="settings-panel saved-designs">
          <h2>
            Your saved designs{" "}
            <span className="small-status">{saved.length} / 100</span>
          </h2>
          {saved.length ? (
            saved.map((s) => (
              <div className="saved-design" key={s.id}>
                <span>{s.name}</span>
                <button
                  className="text-link"
                  onClick={() => {
                    setDesign(s.document.design);
                    setMessage(`${s.name} loaded.`);
                    setError("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Load
                </button>
                <button
                  className="text-link"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const result = await deleteCrosshair(s.id);
                      setError(result.ok ? "" : result.message);
                      setMessage(result.ok ? result.message : "");
                      router.refresh();
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className="panel-copy">
              Save your first design above. It stays private until you share a
              link.
            </p>
          )}
        </section>
      )}
      {(message || error) && (
        <p
          className={`form-message security-feedback ${error ? "form-error" : "form-success"}`}
          role={error ? "alert" : "status"}
        >
          {error || message}
        </p>
      )}
    </>
  );
}
