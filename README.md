# aureliusvoidcore.github.io

This is the source for the GitHub Pages user site at:

https://aureliusvoidcore.github.io

The site is built with Jekyll; layouts live under `_layouts/`, pages under `pages/`, and posts under `_posts/`.

## Local development

Prerequisites: Ruby and Bundler.

1) Install gems

```sh
# optional: if Bundler is missing
gem install bundler

# install project dependencies
bundle install
```

2) Build the site

```sh
bundle exec jekyll build
```

3) Serve locally

```sh
bundle exec jekyll serve
# Visit http://localhost:4000
```

## Themes

The site includes multiple themes selectable from the on-page Theme Manager (top-right control panel):

- Neon Cyberpunk (default)
- Anime Matrix
- Rainbow Sweep
- Laser Beam
- Amber Terminal
- Synthwave
- ROG Crimson
- Windows 98
- Amiga Workbench
- Macintosh Classic
- Doom (Classic-inspired)

The Doom theme has additional styling in `assets/css/doom.css`, scoped to `body.theme-doom` so other themes are unaffected. The base theme system and animations are driven by `assets/js/main.js` and `assets/css/main.css`.

Notes
- This repo is the root/base of the user site, so `baseurl` is empty and `url` is set to https://aureliusvoidcore.github.io in `_config.yml`.
- Site structure overview:
	- Layouts: `_layouts/`
	- Pages: `pages/`
	- Posts: `_posts/`

