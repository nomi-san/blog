import { blog } from '../config.json'

const _Date = ({ date, showYear }) => {
    const [ye, mo, da] = date.split('-')
    const mn = new Date(date).toLocaleDateString(blog.intl, { month: 'short' })
    return (
        <time dateTime={date}>{da} {mn}{showYear ? `, ${ye}` : ''}</time>
    )
}

export default _Date