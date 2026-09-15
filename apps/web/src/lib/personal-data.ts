import { fromJSONSchema } from "zod";
import schema from "../../../../contracts/web/v1/personal-data.schema.json" with { type: "json" };
import crosshair from "../../../../contracts/web/v1/crosshair-design.schema.json" with { type: "json" };
// Bundle the external reference directly from its authority; no copied schema.
const validator = fromJSONSchema({
  ...schema,
  $defs: { crosshair },
} as Parameters<typeof fromJSONSchema>[0]);
export function validatePersonalData(input: unknown) {
  return validator.parse(input);
}
