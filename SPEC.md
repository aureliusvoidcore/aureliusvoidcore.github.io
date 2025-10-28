To set up a custom theme for your GitHub Pages site suitable for Markdown-based blogging, follow these steps. This approach uses Jekyll, which is natively supported by GitHub Pages, to create a reusable layout that applies consistent styling across all pages and posts. The theme incorporates a retro sci-fi aesthetic with dark backgrounds, monochromatic fonts, neon blue and green accents via glow effects, and animated blinking elements for visual emphasis. All subsequent Markdown files will inherit this theme through a single default layout.

### Step 1: Prepare Your Local Environment
install Jekyll for local testing (requires Ruby):

```
gem install bundler jekyll
bundle install
```

This allows you to preview changes with `bundle exec jekyll serve` before uploading.

### Step 2: Create the Configuration File
Create a file named `_config.yml` in the root directory with the following content. This sets basic site parameters and enables blogging features.

```
title: Your Site Title
description: A site for Markdown-based blogging
baseurl: ""
url: "https://aureliusvoidcore.github.io"
permalink: /:title/
collections:
  posts:
    output: true
    permalink: /blog/:year/:month/:day/:title
defaults:
  - scope:
      path: ""
      type: "posts"
    values:
      layout: "post"
```

### Step 3: Create the Default Layout
Create a directory named `_layouts` if it does not exist. Inside it, add a file named `default.html` with the following content. This serves as the single entry point for the theme, wrapping all content.

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page.title | default: site.title }}</title>
  <link rel="stylesheet" href="{{ site.baseurl }}/assets/css/main.css">
</head>
<body>
  <header>
    <h1>{{ site.title }}<span class="blinking-cursor">|</span></h1>
    <p>{{ site.description }}</p>
  </header>
  <main>
    {{ content }}
  </main>
  <footer>
    <p>&copy; {{ site.time | date: "%Y" }} - All rights reserved.</p>
  </footer>
</body>
</html>
```

### Step 4: Create the Post Layout
In the `_layouts` directory, add a file named `post.html` that extends the default layout for blog entries.

```
---
layout: default
---
<article>
  <h2>{{ page.title }}</h2>
  <p class="meta">Published on {{ page.date | date: "%B %d, %Y" }}</p>
  {{ content }}
</article>
```

### Step 5: Create the Stylesheet
Create a directory named `assets/css` if it does not exist. Inside it, add a file named `main.css` with the following content. This defines the visual theme, including dark backgrounds, monospace typography, neon glow effects in blue and green tones, and a blinking animation for cursor-like elements.

```
body {
  background-color: #000;
  color: #0f0; /* Neon green */
  font-family: 'Courier New', Courier, monospace;
  margin: 0;
  padding: 20px;
  line-height: 1.6;
}

header, footer {
  text-align: center;
  padding: 20px 0;
}

h1, h2 {
  color: #00ffff; /* Neon blue */
  text-shadow: 
    0 0 5px #00ffff,
    0 0 10px #00ffff,
    0 0 20px #00ffff,
    0 0 40px #00ffff,
    0 0 80px #00ffff;
}

p, article {
  text-shadow: 
    0 0 2px #0f0,
    0 0 5px #0f0,
    0 0 10px #0f0;
}

.meta {
  color: #0f0;
  font-style: italic;
}

.blinking-cursor {
  animation: blink 1s step-start infinite;
  color: #00ffff;
  margin-left: 5px;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
```

### Step 6: Set Up Blogging Structure
Create a directory named `_posts` if it does not exist. Add a sample Markdown file, such as `_posts/2025-10-27-sample-post.md`, with the following content. All future blog entries should follow this format, using front matter to reference the post layout (which inherits from default).

```
---
title: Sample Blog Entry
layout: post
---

This is the content of your blog post, written in Markdown. The theme will automatically apply to this and all subsequent entries.

- List items will inherit the styling.
- **Bold text** and other Markdown features work as expected.
```

### Step 7: Create an Index Page
In the root directory, create `index.md` (or update if it exists) with the following content to serve as the homepage, listing blog posts.

```
---
layout: default
title: Home
---

<h2>Recent Blog Entries</h2>
<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> - {{ post.date | date: "%B %d, %Y" }}
    </li>
  {% endfor %}
</ul>
```

### Step 8: Test Locally (Optional)
Run `bundle exec jekyll serve` and visit `http://localhost:4000` in your browser to preview the site. Ensure the styling appears as intended, with neon glows and blinking effects.

### Step 9: Upload Changes
Add all files to Git, commit, and push to deploy the site on GitHub Pages.

```
git add .
git commit -m "Implement custom theme and blogging structure"
git push origin main
```

Your site will be live at `https://aureliusvoidcore.github.io` shortly after pushing. All future Markdown files in `_posts` will automatically use the theme without additional configuration, as they reference the post layout, which extends the default. To add new posts, create files in `_posts` with the format `YYYY-MM-DD-title.md` and include the front matter as shown.
