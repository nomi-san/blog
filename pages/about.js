import Layout from '../components/layout'

const About = () => (
    <Layout title="About">
        <h1>about</h1>
        <div>
            <p className="center">
                Write something about you...
            </p>
        </div>
        <style jsx>{`
            .center {
                text-align: center;
            }
        `}</style>
    </Layout>
)

export default About