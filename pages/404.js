import Link from 'next/link'
import Head from 'next/head'

const NotFound = () => (
    <main>
        <Head>
            <title>404</title>
        </Head>
        <div>
            <h1>404</h1>
            <div>
                <h2>Đi lạc rồi bạn ơi,<br />
                    <Link href="/">
                        <a>quay trở về nào.</a>
                    </Link>
                </h2>
            </div>
        </div>
        <style jsx>{`
            main {
                color:#000;
                background:#fff;
                height:100vh;
                text-align:center;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
            }
            main div div {
                display:inline-block;
                text-align:left;
                line-height:30px;
                height:30px;
                vertical-align:middle;
            }
            h1 {
                display:inline-block;
                border-right:1px solid rgba(0, 0, 0,.3);
                margin:0;
                margin-right:20px;
                padding:10px 23px 10px 0;
                font-size:40px;
                font-weight:700;
                vertical-align:top;
            }
            h2 {
                display: inline-block;
                font-size: 16px;
                font-weight: normal;
                line-height: inherit;
                margin: 0;
                padding: 0;
            }
        `}</style>
    </main>
)

export default NotFound
