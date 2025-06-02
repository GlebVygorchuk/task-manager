import { Link } from "react-router-dom"
import { onAuthStateChanged, getAuth } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function Entrance() {
    const auth = getAuth()
    const navigate = useNavigate()


    useEffect(() => {
        const unsub = onAuthStateChanged(auth, () => {
            if (auth.currentUser) {
                navigate('/main')
            } 
        })

        return () => unsub()
    }, [auth])
    

    return (
        <section className="entrance">

            <div className="entrance__container">

                <h1 className="entrance__greetings"><span className="entrance__name">Chronos <svg className="entrance__sandclock" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24"><path d="M18.513 7.119c.958-1.143 1.487-2.577 1.487-4.036v-3.083h-16v3.083c0 1.459.528 2.892 1.487 4.035l3.086 3.68c.567.677.571 1.625.009 2.306l-3.13 3.794c-.936 1.136-1.452 2.555-1.452 3.995v3.107h16v-3.107c0-1.44-.517-2.858-1.453-3.994l-3.13-3.794c-.562-.681-.558-1.629.009-2.306l3.087-3.68zm-4.639 7.257l3.13 3.794c.652.792.996 1.726.996 2.83h-12c0-1.104.343-2.039.996-2.829l3.129-3.793c1.167-1.414 1.159-3.459-.019-4.864l-3.086-3.681c-.66-.785-1.02-1.736-1.02-2.834h12c0 1.101-.363 2.05-1.02 2.834l-3.087 3.68c-1.177 1.405-1.185 3.451-.019 4.863z"/></svg></span><br />  менеджер задач</h1>

                <div className="entrance__buttons-wrapper">

                    <Link to="/register">
                        <button className="entrance__button register-btn">Регистрация</button>
                    </Link>

                    <Link to="/login">
                        <button className="entrance__button login-btn">Войти</button>
                    </Link>

                </div>

            </div>
            
        </section>
    )
}