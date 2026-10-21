# ECI appeals against cleared voters, West Bengal

Part One interactive infographic: the Election Commission's appeals against 14.76 lakh West Bengal voters whom judicial officers found eligible during the Special Intensive Revision (SIR).

Open `index.html` to view it. The page needs no build step, database or external services.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The page |
| `assets/css/style.css` | Layout, colours (light and dark mode) and fonts |
| `assets/js/app.js` | The map, seat panel, charts and table |
| `assets/data/seats.js` | Figures for all 294 assembly constituencies |
| `assets/data/map.js` | Constituency and district boundaries |
| `assets/fonts/` | Newsreader and Public Sans, with their licences |

## Publishing with GitHub Pages

1. Upload all of these files to the root of a GitHub repository, keeping the `assets` folder structure.
2. In the repository, go to **Settings**, then **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select the `main` branch and the `/ (root)` folder, and save.
4. After a minute or two, the infographic will be live at `https://<your-username>.github.io/<repository-name>/`.

To place it in an article, embed it with an iframe:

```html
<iframe src="https://<your-username>.github.io/<repository-name>/"
        width="100%" height="2400" style="border:0"
        title="ECI appeals against cleared voters in West Bengal"></iframe>
```

## Credits

Appeal records individually collected and verified by the Civic Research Group and provided to The Wire. Constituency boundaries: [DataMeet](https://datameet.org); please credit DataMeet wherever the map is published. Fonts: Newsreader and Public Sans, SIL Open Font License (see `assets/fonts`).
