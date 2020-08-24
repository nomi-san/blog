import Link from 'next/link'
import { blog } from '../config.json'

const Header = () => (
    <header>
        <h1>{blog.title}</h1>
        <nav>
            <p><Link href="/"><a>home</a></Link></p>
            <p><Link href="/about"><a>about</a></Link></p>
            <p><a href={blog.profile} target="_blank" rel="noreferrer">/me</a></p>
            <p><a href={`mailto:${blog.email}`} target="_blank" rel="noreferrer">@me</a></p>
        </nav>
    </header>
)

export default Header