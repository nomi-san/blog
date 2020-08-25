## blog

Demo: [nomi-blog-demo.vercel.app](https://nomi-blog-demo.vercel.app)

- Fast and lightweight SPA
- For building personal blog/docs
- Markdown supported

## Dependencies
- react.js
- next.js
- showdown.js

## Getting started

Clone the repo:
```
git clone -b dev https://github.com/nomi-san/blog
cd blog
```

Install dependencies:
```
npm install
```

Develop:
```
npm run dev
```

Build production & serve:
```
npm run build
npm run start
```

Or export static page:
```
npm run export
```

### Config

For general configuration, please edit `congifg.json`:
```
"blog": {
        "lang": "en",
        "intl": "en",
        "author": "autor name",
        "title": "blog title",
        "description": "blog description",
        "image": "meta tag image",
        "url": "deployed url",
        "profile": "link to your github or profile",
        "email": "your email",
        "ga": "ga tracker id"
    },
```

### Add new post

Add your markdown content:
```
_posts/[post-id].md
```

Push it on `config.json`:
```
    "posts": [
    ...
        {
            "id": "post-id",
            "date": "yyyy-mm-dd",
            "title": "Post's title",
            "description": "Post's description.",
            "tags": ["tag1", "tag2"],
            "image: "url-to-image-for-meta-tag"
        }
    ...
    ]
```
