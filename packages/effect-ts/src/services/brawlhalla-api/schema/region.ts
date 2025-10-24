import { Schema } from "effect";

const regions = [
  "us-e",
  "eu",
  "sea",
  "brz",
  "aus",
  "us-w",
  "jpn",
  "sa",
  "me",
] as const;

const allRegion = "all";

const isValidRegion = (input: string): input is (typeof regions)[number] => {
  return regions.includes(input as (typeof regions)[number]);
};

export const Region = Schema.NullOr(Schema.Literal(...regions))

export const AnyRegion = Schema.Literal(...regions, allRegion);

/**
 * The API can return either a valid region, 'none', or an index of an arbitrary array of regions. ¯\_(ツ)_/¯
 */
export const BrawlhallaApiRegion = Schema.transform(
  Schema.NullOr(Schema.Union(Schema.NonEmptyTrimmedString, Schema.Number)),
  Region,
  {
    strict: true,
    decode: (input) => {
      if (!input) return null;

      const region =
        typeof input === "number" ? regions[input - 1] : input.toLowerCase();

      if (input === "none") return null;

      if (!region || !isValidRegion(region)) {
        return null;
      }
      return region;
    },
    encode: (input) => input,
  }
);
