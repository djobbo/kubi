import { Schema } from 'effect';

export const GetPreviewArticlesResponse = Schema.Struct({
  data: Schema.Array(Schema.Struct({
    title: Schema.String,
    slug: Schema.String,
    date_gmt: Schema.String,
    excerpt: Schema.String,
    thumbnail: Schema.Struct({
      src: Schema.String,
    }),
    categories: Schema.Array(Schema.Struct({
      name: Schema.String,
      slug: Schema.String,
    })),
  })),
  meta: Schema.Struct({
    updated_at: Schema.Date,
  }),
})