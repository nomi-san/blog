import { useEffect } from 'react'

export default function ScrollToTop() {

    useEffect(() => {
        const st = document.getElementById('scroll-top')
        window.addEventListener('scroll', () => {
            st.style.display = window.pageYOffset > 400
                ? 'block' : 'none'
        })
    })

    const scrollTop = () => {
        scroll(0, 0)
    }

    return (
        <div>
            <button id="scroll-top" onClick={scrollTop}>
                <svg fill="#8590a6" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M16.036 19.59a1 1 0 0 1-.997.995H9.032a.996.996
                    0 0 1-.997-.996v-7.005H5.03c-1.1 0-1.36-.633-.578-1.416L11.33
                    4.29a1.003 1.003 0 0 1 1.412 0l6.878 6.88c.782.78.523 1.415-.58
                    1.415h-3.004v7.005z" />
                </svg>
            </button>
            <style jsx>{`
                button {
                    border-radius: 4px;
                    width: 40px;
                    height: 40px;
                    background-color: #fff;
                    position: fixed;
                    bottom: 30px;
                    right: 30px; 
                    z-index: 9999;
                    display: none;
                    box-shadow: 0 4px 5px #1a1a1a1a;
                    text-align: center;
                    padding: 0;
                    line-height: inherit;
                }
                button svg {
                    width: 24;
                    height: 24;
                    margin-top: 3px;
                }
                button:hover {
                    background: #ccc5;
                }
            `}</style>
        </div>
    )
}