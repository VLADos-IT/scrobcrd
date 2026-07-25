# API Documentation

The API is available at `/api`. It returns an SVG image suitable for embedding in Markdown files.

## Endpoint

`GET /api`

## Query Parameters

| Parameter | Type     | Default      | Description                                                         |
| :-------- | :------- | :----------- | :-------------------------------------------------------------------|
| `user`    | `string` | **Required** | The Last.fm username to fetch data for.                             |
| `bg`      | `string` | `181818`     | Background color(e.g. ffffff), 'none' or `transparent`              |
| `width`   | `number` | `400`        | Width of the generated SVG in pixels.                               |
| `mode`    | `string` | `smart`      | Display mode. `smart`, `obsession`, `top`, `recent`, `now`, `list`. |
| `range`   | `string` | `all`        | Period for Top Track / list. `all`, `7day`, `1month` etc.           |
| `theme`   | `string` | `default`    | Visual theme. `default`, `retro`, `compact`, `osx`.                 |
| `limit`   | `number` | `5`          | Only for `mode=list`. Number of tracks to show (1-10).              |

## Modes

### `smart` (Default)

- **Behavior**: Checks for a current "Obsession" on the user's profile.
- **Fallback**: If no obsession is found, it fetches the most recent track from the user's library/profile.
- **Label**: Displays "LAST.FM OBSESSION" or "LAST.FM RECENT TRACK" accordingly.

### `obsession`

- **Behavior**: Strictly fetches the current "Obsession".
- **Error**: Returns an error card if no obsession is set.
- **Label**: "LAST.FM OBSESSION".

### `recent`

- **Behavior**: Fetches the most recent track from listening history.
- **Label**: "LAST.FM RECENT TRACK".

### `top`

- **Behavior**: Fetches the most recent track (Top Track).
- **Label**: "LAST.FM TOP TRACK".

### `list`

- **Behavior**: Renders a small table of your top N tracks by playcount.

## Ranges (Optional)

You can specify a time range for the Top Track using the `range` parameter.
Supported values: `all` (default), `7day`, `1month`, `3month`, `6month`, `12month`.

> **Note**: Range support other than `all` requires the server to have `LASTFM_API_KEY` configured. Use `all` for public access.

## Caching

Responses are cached with `Cache-Control: public, max-age=240, s-maxage=240, stale-while-revalidate=120`.

## Response Headers

The API sets the `Content-Disposition` header to `inline; filename="lastfm-profile.svg"`, ensuring the file is named correctly when saved.
