var posts = [
    [2017, [
        ["May 04", "The First post", "the-first-post"],
        ["Nov 11", "Rust MessageBox", "rust-messagebox"]
    ]]
];

window.onload = function() {
    var lp = window.location.pathname;  
    
    if (lp == '/' || lp == '/index.html') {
        var list = document.getElementById("list-post");
        posts.reverse();
        posts.forEach((a) => {
            var s = "";
            list.innerHTML += gen_elm("h2", null, a[0]);
            a[1].reverse();
            a[1].forEach((b) => {   
                s += `<p><i>${b[0]}</i><a href="/posts/${b[2]}">${b[1]}</a></p>`;
            });
            list.innerHTML += gen_elm("ul", null, s);
        });
    }
    else if (lp.indexOf('/posts/') != -1) {
        showdown.extension('my_codehl', function() {
            var unencode = function(text) {
                return text.replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>');
            }
            return [{
                type: 'output',
                filter: function(text, converter, options) {
                    var left  = '<pre><code\\b[^>]*>',
                        right = '</code></pre>',
                        flags = 'g',
                        replacement = function(wholeMatch, match, left, right) {
                            match = unencode(match);
                            var g = parse_code(match);
                            var code = "", isNew = (g.before || g.after);
                            var lang = left.match(/<pre><code class="(\w+)\s?/)[1];
                            
                            if (g.before) {
                                code += gen_elm("pre", "insert-before", g.before);
                            }           
                            
                            if (g.comment) {
                                g.comment = simple_bold(g.comment);
                            }
                            
                            if (g.file) {
                                g.file = gen_elm('em', null, g.file);
                                code += gen_elm("div", "source-file",
                                    g.file + (g.comment ? '<br>' + g.comment : ''));
                            }
                            
                            code += gen_elm("pre",
                                isNew ? "insert" : "fully", hljs.highlight(lang, g.code).value);
                            
                            if (g.after) {
                                code += gen_elm("pre", "insert-after", g.after);
                            }
                            
                            return gen_elm("div", "codehilite", code)
                                + (g.file ? gen_elm("div", "source-file-narrow",
                                    g.file + (g.comment ? ', ' + g.comment : '')) : '');
                        };
                    return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
                }
            }];
        });
        
        showdown.setFlavor('github');
        var converter = new showdown.Converter({ openLinksInNewWindow: true, extensions: ['my_codehl']});
        
        var html = read_file((window.location.href).replace('/index.html', '') + '/index.html');
        var content = get_content(html);
        document.getElementById('post-content').innerHTML = converter.makeHtml(content);
        
        var path = (window.location.pathname)
            .replace('/posts/', '').replace('/index.html', '').replace('/', '');
        
        document.getElementById('post-title').innerHTML = ">> " + get_title(path);
        document.getElementById('post-date').innerHTML = get_date(path);
    }
    
    fix_scale(document);
};

function gen_elm(tag, klass, inner) {
    return `<${tag} ${klass ? `class="${klass}"` : ''}>${inner}</${tag}>`;
}

function simple_bold(s) {
    return s
        .replace('{', '<em>')
        .replace('}', '</em>');
}

function get_title(path) {
    var ret = "";
    posts.forEach((a) => {
        a[1].forEach((b) => {
           if (b[2] == path)
               ret = b[1];
        });
    });
    return ret;
}

function get_date(path) {
    var ret = "";
    posts.forEach((a) => {
        a[1].forEach((b) => {
           if (b[2] == path)
               ret = b[0] + " " + a[0];
        });
    });
    return ret;
}

function get_content(str) {
    return str
        .split('<!--content>')
        .pop()
        .split('</content-->')
        .shift();
}

function read_file(file) {
    var allText = "", rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4)
            if (rawFile.status === 200 || rawFile.status == 0)
                allText = rawFile.responseText;
    }
    rawFile.send(null);
    return allText;
}

function parse_code(s) {
    var s = s.trim().split("\n");
    var file, comment = '', before = '', after = '', code = '';

    s.forEach((i) => {
        if (i.indexOf('>') === 0)
            file = i.substr(1).trim();
        else if (i.indexOf('<') === 0)
            comment += i.substr(1) + '\n';
        else if (i.indexOf('[') === 0)
            before += i.substr(1) + '\n';
        else if (i.indexOf(']') === 0)
            after += i.substr(1) + '\n';
        else
            code += i + '\n';
    });

    return {
        file: file,
        comment: comment,
        before: before != '' ? before : null,
        after: after != '' ? after : null,
        code: code
    };
}

function fix_scale(document) {
    var metas = document.getElementsByTagName('meta'),
        changeViewportContent = function(content) {
            for (var i = 0; i < metas.length; i++) {
                if (metas[i].name == "viewport") {
                    metas[i].content = content;
                }
            }
        },
        initialize = function() {
            changeViewportContent("width=device-width, minimum-scale=1.0, maximum-scale=1.0");
        },
        gestureStart = function() {
            changeViewportContent("width=device-width, minimum-scale=0.25, maximum-scale=1.6");
        },
        gestureEnd = function() {
            initialize();
        };

    if (navigator.userAgent.match(/iPhone/i)) {
        initialize();

        document.addEventListener("touchstart", gestureStart, false);
        document.addEventListener("touchend", gestureEnd, false);
    }
}