import Tags from "./tags"
import _Date from "./date"

const Title = ({ post }) => <>
    <div>
        <h1>{post.title}</h1>
        <div>
            <_Date date={post.date} showYear={true} />
        </div>
        <div>
            <Tags tags={post.tags} />
        </div>
        <hr />
    </div>
    <style jsx>{`
        div {
            text-align: center;
        }
        hr {
            margin: 20px auto;
            margin-bottom: 40px;
            width: 40%;
        }
    `}</style>
</>

export default Title