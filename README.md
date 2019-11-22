## blog

### features
- For personal blog or document
- Fast and lightweight
- Static, fully frontend
- Supports markdown content 

### used
- [showdown.js](http://showdownjs.com/) :: building markdown contents
- [highlight.js](https://highlightjs.org/) :: code highlighting

### directory
```
./blog/
    |____assets/                    # static assets
    .    |____css/
    .    .    |____style.css        # main style sheet
    .    |____img/...
    .    |____js/
    .    .    |____script.js        # main script
    .    ...
    |____posts/                     # list posts
    .    |____post-1/index.html     # post-1
    .    |____post-2/index.html     # post-2
    .    ...
    |____about/index.html           # about
    |____index.html                 # home
    ...
```

### script

```js
var posts = [
    [2017, [
        ["May 04", "The First post", "post-1"],
        ["Nov 11", "The Second post", "post-2"]
    ]],
    [2018, [
        ["Jan 07", "The Third post", "post-3"],
    ]]
];

window.onload = function() {
    // parse + show post's content
};
```

### post's content

```html
<html>
    <tags ...
    ...
</html>

<!--content>
...
markdown contents
...
</content-->
```
