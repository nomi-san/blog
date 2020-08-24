import App from 'next/app'
import Head from 'next/head'

import '../lib/normalize.css'
import '../lib/code.css'
import '../lib/fonts.css'
import '../lib/style.css'

class MyApp extends App {
    
    render() {
        const { Component, pageProps } = this.props;
        return <>
            <Head>
                <script
                    type="text/javascript"
                    src="/js/lazysizes.min.js"
                />
            </Head>
            <Component {...pageProps} />
        </>
    }
}

export default MyApp