import { Link } from "react-router-dom"
import { onAuthStateChanged, getAuth } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function Entrance() {
    const auth = getAuth()
    const navigate = useNavigate()

    const userID = auth.currentUser

    useEffect(() => {
        console.log(userID)
    }, [userID])

    return (
        <section className="entrance">
            <div className="entrance__container">

                <h1 className="entrance__greetings">Добро пожаловать в Chronos - инструмент управления временем</h1>

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