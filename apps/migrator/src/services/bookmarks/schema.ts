import { Schema } from "effect"

import { DISCORD_PROVIDER_ID, type NewLegacyBookmark } from "@dair/db"

export const bookmarkSchema = Schema.Array(
  Schema.Struct({
    favorite_data: Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      type: Schema.Literals(["clan", "player"]),
      userId: Schema.String,
      meta: Schema.Struct({
        icon: Schema.optional(
          Schema.Struct({
            legend_id: Schema.Number,
            type: Schema.Literals(["legend"]),
          }),
        ),
      }),
    }),
    profile_data: Schema.Struct({
      id: Schema.String,
      username: Schema.String,
      avatarUrl: Schema.optional(Schema.String),
    }),
    user_data: Schema.Struct({
      id: Schema.String,
      created_at: Schema.String,
      updated_at: Schema.String,
      raw_app_meta_data: Schema.Struct({
        provider: Schema.Literals(["discord"]),
      }),
      raw_user_meta_data: Schema.Struct({
        name: Schema.String,
        email: Schema.String,
        picture: Schema.String,
        full_name: Schema.String,
        avatar_url: Schema.String,
        provider_id: Schema.String,
      }),
    }),
  }),
)

type LegacyBookmarkRow = Schema.Schema.Type<typeof bookmarkSchema>[number]

export const parseLegacyBookmarks = (
  rawBookmarks: ReadonlyArray<LegacyBookmarkRow>,
): ReadonlyArray<NewLegacyBookmark> =>
  rawBookmarks
    .map((bookmark): NewLegacyBookmark | null => {
      if (!["player", "clan"].includes(bookmark.favorite_data.type)) {
        return null
      }

      if (bookmark.user_data.raw_app_meta_data.provider !== "discord") {
        return null
      }

      const pageType =
        bookmark.favorite_data.type === "player" ? "player_stats" : "clan_stats"

      const icon = bookmark.favorite_data.meta?.icon

      return {
        name: bookmark.favorite_data.name,
        pageId: bookmark.favorite_data.id,
        provider: DISCORD_PROVIDER_ID,
        providerUserId: bookmark.user_data.raw_user_meta_data.provider_id,
        pageType,
        meta: {
          version: "1",
          data: {
            icon: icon?.legend_id
              ? {
                  type: "legend",
                  id: icon.legend_id,
                }
              : null,
          },
        },
      }
    })
    .filter((bookmark): bookmark is NewLegacyBookmark => bookmark !== null)
