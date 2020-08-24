import fs from 'fs'
import { join } from 'path'
import showdown from 'showdown';
import MarkdownView from 'react-showdown';
import yaml from 'yaml'
import Layout from '../../components/layout'
import Title from '../../components/title';
import hljs from '../../lib/highlight.pack.js'
import { posts } from '../../config.json'

const postsDir = join(process.cwd(), '_posts')

const Post = ({ post }) => {

    const extensions = () => {
        const unencode = (text) => (
            text.replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
        )
        const simpleBold = (text) => (
            text.replace(/{/g, '<em>')
                .replace(/}/g, '</em>')
        )
        const genElm = (tag, klass, inner) => (
            `<${tag} ${klass ? `class="${klass}"` : ''}>${inner}</${tag}>`
        )
        const parseCode = (s) => {
            var file, comment = '', before = '',
                after = '', code = ''
            s = s.trim().split('\n')
            s.forEach(i => {
                if (i.indexOf('>') === 0)
                    file = i.substr(1).trim()
                else if (i.indexOf('<') === 0)
                    comment += i.substr(1) + '\n'
                else if (i.indexOf('[') === 0)
                    before += i.substr(1) + '\n'
                else if (i.indexOf(']') === 0)
                    after += i.substr(1) + '\n'
                else
                    code += i + '\n'
            })
            return {
                file: file,
                comment: comment,
                before: before != '' ? before : null,
                after: after != '' ? after : null,
                code: code
            }
        }

        return [{
            type: 'lang',
            filter: (text, converter, options) => {
                const left = ':img\\s*{', right = '}', flags = 'g';
                const replacement = (wholeMatch, match, left, right) => {
                    const img = yaml.parse(match)
                    if (!img || !img?.src) return wholeMatch
                    const width = img.width ? `width="${img.width}"` : ''
                    const height = img.height ? `height="${img.height}"` : ''
                    return `<p align="${img.align || 'center'}">
                        <img data-src="${img.src}" alt="" class="lazyload" ${width} ${height} />
                        ${img.caption ? `<p align="center">${img.caption}</p>` : ''}</p>`
                }
                return showdown.helper
                    .replaceRecursiveRegExp(text, replacement, left, right, flags)
            }
        }, {
            type: 'output',
            filter: (text, converter, options) => {
                const left = '<pre><code\\b[^>]*>',
                    right = '</code></pre>',
                    flags = 'g';

                const replacement = (wholeMatch, match, left, right) => {
                    match = unencode(match);
                    var g = parseCode(match);
                    var code = '', isNew = (g.before || g.after);
                    var lang = left.match(/<pre><code class="(\w+)/);

                    lang = lang ? lang[1] : 'plaintext';

                    if (g.before) {
                        code += genElm('pre', 'insert-before', g.before);
                    }

                    if (g.comment) {
                        g.comment = simpleBold(g.comment);
                    }

                    if (g.file) {
                        g.file = genElm('em', null, g.file);
                        code += genElm('div', 'source-file',
                            g.file + (g.comment ? '<br>' + g.comment : ''));
                    }

                    code += genElm('pre',
                        isNew ? 'insert' : 'fully', hljs.highlight(lang, g.code).value);

                    if (g.after) {
                        code += genElm('pre', 'insert-after', g.after);
                    }

                    return genElm('div', 'codehilite', code) +
                        (g.file ? genElm('div', 'source-file-narrow',
                            g.file + (g.comment ? ', ' + g.comment : '')) : '');
                };
                return showdown.helper
                    .replaceRecursiveRegExp(text, replacement, left, right, flags);
            }
        }, {
            type: 'output',
            filter: (text, converter, options) => {
                var left = '<(h1|h2)\\s*id=(\"|\')',
                    right = '(\"|\')\\s*>',
                    flags = 'g';

                const replacement = (wholeMatch, match, left, right) => {
                    // todo: building table of content
                    //+= (`<p><a href="#${match}">#${match}</a></p>`)
                    return wholeMatch
                }
                return showdown.helper
                    .replaceRecursiveRegExp(text, replacement, left, right, flags)
            }
        }];
    }

    const content = <MarkdownView
        flavor="github"
        markdown={post.content}
        extensions={extensions}
        options={{ tables: true, emoji: true }}
    />

    return (
        <Layout title={post.title} description={post.description} imageUrl={post.image}>
            <Title post={post} />
            {content}
        </Layout>
    )
}

export async function getStaticProps({ params }) {
    const { id } = params
    const path = join(postsDir, `${id}.md`)
    const content = fs.readFileSync(path, 'utf-8')
    const post = posts.filter(x => x.id == id)[0]

    return {
        props: {
            post: {
                ...post,
                content
            }
        },
    }
}

export async function getStaticPaths() {
    return {
        paths: posts.map(post => ({
            params: {
                id: post.id
            }
        })),
        fallback: false
    }
}

export default Post