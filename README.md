# my personal blog

### [demo here](https://wuuyi.pw)

### deps

- [showdown.js](http://showdownjs.com/) :: building markdown contents
- [highlight.js](https://highlightjs.org/) :: code highlighting

### directory

```
./repo/
    |____posts/                          # list posts
    .      |____post-1/index.html        # post index + content
    .      |____post-2/index.html
    .      ...
    |____static/                         # static resources
    .      |____script.js                # main script
    .      ...
    |____index.html                      # index
    ...
```

### script

```js
var posts = [
    'post-1',
    'post-2',
    // list of post's link-name
];

window.onload = function() {
    // parse + show post's content
};
```

### post's content

```html
<html>
    ...
</html>
<!--content>
title: Title;
descript: Description;
date: Month Day Year;
-+-+-
markdown contents
...
</content-->
```
