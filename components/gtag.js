
const GTag = ({ ga }) => (
    ga && ga?.match('UA-\\d{5,9}-\\d') ? <>
        <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
        />
        <script
            dangerouslySetInnerHTML={{
                __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date()); gtag('config', '${ga}');
                `
            }}
        />
    </> : <></>
)

export default GTag