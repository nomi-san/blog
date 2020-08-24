import Head from 'next/head'
import Header from './header'
import Footer from './footer'
import ScrollToTop from './scroll-to-top'
import { blog } from '../config.json'

function Layout({ children, title, description, imageUrl }) {

    title = (title ? title + ' | ' : '') + blog.title
    description = description || blog.description
    imageUrl = imageUrl || blog.image

    return (
        <main>
            <Head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="chrome=1" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />

                <title>{title}</title>
                <meta name="title" content={title} />
                <meta name="description" content={description} />

                <meta property="og:type" content="website" />
                <meta property="og:url" content={blog.url} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={imageUrl} />
            </Head>

            <div className="wrapper">
                <Header />
                <section>
                    {children}
                </section>
                <Footer />
            </div>

            <ScrollToTop />
        </main>
    )
}

export default Layout