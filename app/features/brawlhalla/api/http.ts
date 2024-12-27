// export const bhApi = (apiKey: string) => ({
// ranked: {
//   singles: (region: string, page: number, name = "") => {
//     const _region = rankedRegionSchema.parse(region)
//     return withCache(
//       `ranked-1v1-${region}-${page}-${name}`,
//       () =>
//         getBhApi(
//           apiKey,
//           `/rankings/1v1/${_region}/${page}?name=${name}`,
//           rankings1v1Schema,
//           rankings1v1Mock,
//         ),
//       5 * 60 * 1000,
//     )
//   },
//   rotating: (region: string, page: number, name = "") =>
//     withCache(
//       `ranked-rotating-${region}-${page}-${name}`,
//       () =>
//         getBhApi(
//           apiKey,
//           `/rankings/rotating/${region}/${page}?name=${name}`,
//           rankingsRotatingSchema,
//           rankingsRotatingMock,
//         ),
//       10 * 60 * 1000,
//     ),
//   doubles: (region: string, page: number) =>
//     withCache(
//       `ranked-2v2-${region}-${page}`,
//       () =>
//         getBhApi(
//           apiKey,
//           `/rankings/2v2/${region}/${page}`,
//           rankings2v2Schema,
//           rankings2v2Mock,
//         ),
//       5 * 60 * 1000,
//     ),
// },
// clan: {
//   stats: (clanId: string | number) => {
//     return withCache(
//       `clan-${clanId}`,
//       () => getBhApi(apiKey, `/clan/${clanId}`, clanSchema, clanMock),
//       15 * 60 * 1000,
//     )
//   },
// },
// legend: {
//   all: () => withCache(`legend-all`, () => getBhApi(apiKey, "/legend/all")),
//   one: (legendId: number) =>
//     withCache(`legend-one-${legendId}`, () =>
//       getBhApi(apiKey, `/legend/${legendId}`),
//     ),
// },
// search: {
//   steamId: (steamId: string) =>
//     withCache(`search-steamid-${steamId}`, () =>
//       getBhApi(apiKey, `/search?steamid=${steamId}`, {
//         brawlhalla_id: 1,
//         name: "test",
//       }),
//     ),
// },
// })
