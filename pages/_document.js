import Document, { Html, Head, Main, NextScript } from 'next/document'
import flush from 'styled-jsx/server'
import GTag from '../components/gtag'
import { blog } from '../config.json'

class MyDocument extends Document {

    static getInitialProps({ renderPage }) {
        const { html, head, errorHtml, chunks } = renderPage()
        const styles = flush()
        return { html, head, errorHtml, chunks, styles }
    }

    render() {
        return (
            <Html lang={blog.lang}>
                <Head>
                    <GTag ga={blog.ga} />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument