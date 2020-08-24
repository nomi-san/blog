import Layout from '../components/layout'

const About = () => (
    <Layout title="About">
        <h1>about</h1>
        <div>
            <p className="center">
                Ai là tôi, tôi là ai?<br />
                Đã bốn năm <strong>nhúng</strong>, lại ba năm <strong>ngược</strong>!<br />
                Một chút <strong>quép</strong> với <strong>ây-ai,</strong><br />
                Đét-lai mà dí, thì đố ai đua bằng.<br />
            </p>
            <hr />
            <p>
                Mình chuyên về (embedding) system và reversing, còn web với AI chỉ để đú trend thôi.
                Đã từng chơi qua rất nhiều ngôn ngữ, nhưng <strong>C/C++</strong> & <strong>Lua</strong> vẫn
                là phê pha nhất!
            </p>
            <p>
                Đây không phải là blog chính thức của mình, và nó là 1 trong 4 cái (có 2 cái để viết lách) 😂
            </p>
            <p>
                Blog này sử dụng <a href="https://nextjs.org/" target="_blank" rel="noreferrer">next.js</a> và
                hoàn toàn opensource, bạn có thể
                clone template mình tạo <a href="https://github.com/nomi-san/blog" target="_blank" rel="noreferrer">ở đây</a>.
                Về hiệu năng thì không phải bàn cãi, mình đã tối ưu rất kỹ 😄
            </p>
        </div>
        <style jsx>{`
            .center {
                text-align: center;
            }
            hr {
                width: 35%;
                margin: 15px auto;
            }
        `}</style>
    </Layout>
)

export default About