import { Link } from "react-router-dom"

export default function Entrance() {
    return (
        <section className="entrance">
            <div className="entrance__container">

                <h1 className="entrance__greetings">Добро пожаловать в <span className="highlight">Chronos</span> - инструмент управления временем</h1>

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