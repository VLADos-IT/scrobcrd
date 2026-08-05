# scrobcrd — Last.fm / ListenBrainz widget for GitHub and sites

Display your current **NOW TRACK**, **Obsession** or **Top Track** in GitHub README and landing pages.

## 🚀 Usage

Copy the following code into your `README.md` and replace `YOUR_USERNAME`:

```markdown
[![Last.fm Obsession](https://lastfm-github-profile.vercel.app/api?user=YOUR_USERNAME)](https://www.last.fm/user/YOUR_USERNAME)
```

For ListenBrainz add `&source=listenbrainz`:

```markdown
[![ListenBrainz Obsession](https://lastfm-github-profile.vercel.app/api?user=YOUR_USERNAME&source=listenbrainz)](https://listenbrainz.org/user/YOUR_USERNAME/)
```

### Configuration

| Parameter | Description                                                           | Default      |
| :-------- | :---------------------------------------------------------------------| :----------- |
| `user`    | Your username on the selected `source` (required)                     | -            |
| `source`  | Data source: `lastfm` or `listenbrainz`                               | `lastfm`     |
| `bg`      | Background color(e.g. ffffff), 'none' or `transparent`                | `181818`     |
| `width`   | Width of the SVG in pixels (MIN = 120)                                | `400`        |
| `mode`    | Display mode: `smart`, `obsession`, `top`, `recent`, `now`, `list`    | `smart`      |
| `range`   | Date range: `all`, `7day`, `1month`, etc (Requires API Key)           | `all`        |
| `theme`   | Visual theme: `default`, `retro`, `compact`, `osx`                    | `default`    |
| `limit`   | Tracks shown when `mode=list` (1-10)                                  | `5`          |
| `accent`  | Color for accents(e.g. ffffff)                                        | `provider`   | 

### Modes

- **smart**: Tries to show your Current Obsession. If not set, shows your Top Track (most recent).

> [!WARNING]
>
> - **obsession**: Only shows Current Obsession. Displays an error if none is set.
> - **recent**: Shows your most recent track (Listening History).
> - **top**: Forces the display of "Top Track" label.
> - **now**: Shows now playing track.
> - **list**: Shows your top N tracks by playcount as a small table (`limit`, `range`).

### Example

![Example](assets/scrobcrd.svg)
![Example lastfm](assets/scrobcrd_smart.svg)
### Top tracks list

```markdown
[![Last.fm Top Tracks](https://lastfm-github-profile.vercel.app/api?user=vlados14311&mode=list&limit=3)](https://www.last.fm/user/vlados14311)
```

![List Example](assets/example_list.svg)

## Deployment

### Self-Hosting with Docker / Podman

If you prefer to host it yourself.

1. **Build the image:**

    ```bash
    podman build -t lastfm-obsession .
    ```

2. **Run the container:**

    ```bash
    podman run -d -p 3000:3000 --name lastfm-obsession lastfm-obsession
    ```

    **With Last.fm API Key (for Ranges on `source=lastfm`):**

    ```bash
    podman run -d -p 3000:3000 -e LASTFM_API_KEY=your_key --name lastfm-obsession lastfm-obsession
    ```

    **With a ListenBrainz token:**

    ```bash
    podman run -d -p 3000:3000 -e LISTENBRAINZ_TOKEN=your_token --name lastfm-obsession lastfm-obsession
    ```

3. **Access:**
    Your API will be available at `http://YOUR_SERVER_IP:3000/api?user=YOUR_USERNAME`.

> [!NOTE]
> **Creating Custom Themes**
>
> You can easily add your own themes
>
> 1. **Create a Template**: Add a new `.js` file in `lib/templates/`
> 2. **Create Styles**: Add a `.css` file in `lib/styles/`
> 3. **Use**: `&theme=NEW` in the URL
>
> `!Exists theme => Default`

## Features

- **Two sources**: Last.fm and ListenBrainz, selected with `&source=`.
- **Smart Fallback**: Automatically switches to "Top Track" if no obsession is currently set.
- **Fast**: Uses Vercel Serverless Functions for low latency.
- **No API Key Required**: Works out of the box for both sources; keys/tokens only unlock extra features (ranges on Last.fm, higher rate limits on ListenBrainz).

## TODO

- [x] Top track in range (Last.fm API key required)
- [x] Recent track mode
- [x] ListenBrainz support
- [ ] Other designs
- [ ] Configuration improvements