import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../components/layout'
import _Date from '../components/date'
import Tags from '../components/tags'
import { posts } from '../config.json'

const Home = () => {
    const router = useRouter()
    const { tag } = router.query
    const map = {}

    posts.sort((a, b) => (
        new Date(b.date).getTime()
        - new Date(a.date).getTime()
    ))

    posts.map(post => {
        const [year] = post.date.split('-')
        !map[year] && (map[year] = [])
        map[year].push(post)
    })

    return (
        <Layout>
            <h1>posts {tag && ' #' + tag}</h1>
            <div className="list-post">
                {Object.keys(map).map(year => (
                    <div key={year} >
                        <h2>{year}</h2>
                        <ul>
                            {map[year].map(post => (
                                (tag && post.tags.includes(tag) || !tag)
                                    ? <li key={post.id}>
                                        <Link href="/posts/[id]" as={`/posts/${post.id}`}>
                                            <h3>{post.title}</h3>
                                        </Link>
                                        <div>           
                                            <Tags tags={post.tags} />
                                            / <_Date date={post.date} />
                                        </div>
                                    </li> : <></>
                            ))}
                        </ul>
                    </div>
                )).reverse()}
            </div>
        </Layout >
    )
}

export default Home