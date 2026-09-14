import { fromJSONSchema } from "zod";
import { uniqueKeyJson } from "./strict-json.ts";
import contract from "../../../../contracts/web/v1/crosshair-design.schema.json" with { type: "json" };
export interface CrosshairDesign {
  length: number;
  thickness: number;
  gap: number;
  dot: number;
  opacity: number;
  outline: boolean;
  color: string;
}
export interface CrosshairDocument {
  contract: "modlock.crosshair-design";
  schema_version: 1;
  gameValidated: false;
  design: CrosshairDesign;
}
const validator = fromJSONSchema(
  contract as Parameters<typeof fromJSONSchema>[0],
);
export const defaultCrosshair: CrosshairDesign = {
  length: 10,
  thickness: 2,
  gap: 6,
  dot: 2,
  opacity: 100,
  outline: true,
  color: "#a8dfb1",
};
export function crosshairDocument(design: CrosshairDesign): CrosshairDocument {
  return parseCrosshair({
    contract: "modlock.crosshair-design",
    schema_version: 1,
    gameValidated: false,
    design,
  });
}
export function parseCrosshair(input: unknown): CrosshairDocument {
  return validator.parse(input) as CrosshairDocument;
}
export function readCrosshair(text: string): CrosshairDocument {
  if (text.length > 4096)
    throw new Error("Crosshair designs must be no larger than 4 KiB.");
  return parseCrosshair(uniqueKeyJson(text));
}
