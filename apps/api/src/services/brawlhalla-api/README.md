## Api Quirks

- `region` is a string slug (eu, us-e, etc...) everywhere except for for some reason in ranked 2v2, where it's an index of an arbitrary array of regions ??
- `rotating` ranked is an empty array if the player has not played any games, but an object with `games` and `wins` if they have ??
- `peak_rating` is set to `0` if the player has not played all 10 placement matches ??
- ranked 2v2 team name is a single string with concatenated names of the players ?? instead of an array of names ?? wtf...
- no personal rating in ranked 2v2 ??
- leaderboard only goes up to 1000th page ??
- no 2v2 search...
