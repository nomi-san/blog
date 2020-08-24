import Link from 'next/link'

const Tags = ({ tags }) => (
    <span>
        {tags.map(tag => (
            <Link href={'/?tag=' + tag} key={tag}>
                <a>{`#${tag}`}</a>
            </Link>
        ))}
        <style jsx>{`
            a {
                margin-right: 10px;
            }
        `}</style>
    </span>
)

export default Tags