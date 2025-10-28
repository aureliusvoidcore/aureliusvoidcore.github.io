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

Notes
- This repo is the root/base of the user site, so `baseurl` is empty and `url` is set to https://aureliusvoidcore.github.io in `_config.yml`.
- Site structure overview:
	- Layouts: `_layouts/`
	- Pages: `pages/`
	- Posts: `_posts/`

