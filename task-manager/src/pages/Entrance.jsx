import { Link } from "react-router-dom"

export default function Entrance() {
    return (
        <section className="entrance">
            <div className="entrance__container">

                <h1 className="entrance__greetings">Добро пожаловать<br /> в <span className="highlight">task-manager</span>!<br />За работу!</h1>

                <div className="entrance__buttons-wrapper">

                    <Link to="/register">
                        <button className="entrance__button register">Регистрация</button>
                    </Link>

                    <Link to="/login">
                        <button className="entrance__button login">Войти</button>
                    </Link>

                </div>

            </div>
        </section>
    )
}