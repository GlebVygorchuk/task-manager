import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordIsVisible, setPasswordIsVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [info, setInfo] = useState('Введите E-Mail, и мы пришлём на него письмо для сброса пароля')

    const auth = getAuth()
    const navigate = useNavigate()


    function showPassword() {
        const eye = document.getElementById('eye')
        eye.classList.toggle('active')
        setPasswordIsVisible(prev => !prev)
    }


    function handleLogin(e) {
        e.preventDefault()
        setError(false)

        signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            setLoading(true)

            setTimeout(() => {
                navigate('/main')
            }, 1000)
        })
        .catch(() => {
            setError(true)
        })
    }


    function handleReset() {
        sendPasswordResetEmail(auth, email)
        .then(() => {
            setInfo('Письмо отправлено!')
            setTimeout(() => {
                setShowModal(false)
            }, 2000)
        })
        .catch(err => {
            alert(err.message)
        })
    }


    return (
        <section className="login">

            <div className="login__container">

                <h1 style={{fontSize: '50px'}}>Вход</h1>

                <form className="login__form">

                    <input 
                    type="text" 
                    className="login__input"
                    placeholder="Ваш E-Mail"
                    value={email}
                    onInput={(e) => setEmail(e.target.value)} />

                    <div className="input-wrapper">
                        <input 
                        type={passwordIsVisible ? "text" : "password"} 
                        className="login__input"
                        placeholder="Ваш пароль"
                        style={{width: '100%'}} 
                        value={password}
                        onInput={(e) => setPassword(e.target.value)}/>

                        <svg onClick={showPassword} id="eye" className="svg-eye" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path d="M12.015 7c4.751 0 8.063 3.012 9.504 4.636-1.401 1.837-4.713 5.364-9.504 5.364-4.42 0-7.93-3.536-9.478-5.407 1.493-1.647 4.817-4.593 9.478-4.593zm0-2c-7.569 0-12.015 6.551-12.015 6.551s4.835 7.449 12.015 7.449c7.733 0 11.985-7.449 11.985-7.449s-4.291-6.551-11.985-6.551zm-.015 5c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2zm0-2c-2.209 0-4 1.792-4 4 0 2.209 1.791 4 4 4s4-1.791 4-4c0-2.208-1.791-4-4-4z"/></svg>
                    </div>

                    <button onClick={handleLogin} type="submit" className="login__button">Войти</button>

                    <p onClick={() => setShowModal(true)} style={{marginTop: '10px'}} className="repeat">Забыли пароль?</p>
                    {error ? <p>Адрес почты/пароль указан неверно</p> : null}

                </form>
            </div>

            <div className={loading ? "loading-screen load" : "loading-screen"}></div>

            <div className={showModal ? 'modal-container blackout' : 'modal-container'}></div>
            <div className={showModal ? 'email-reset show' : 'email-reset'}>
                <div onClick={() => setShowModal(false)} className="close-button"></div>

                <p>{info}</p>

                <input
                style={{marginTop: '5px'}}
                placeholder="Ваш E-Mail"
                onInput={(e) => setEmail(e.target.value)} 
                value={email} 
                type="email" 
                className="login__input" />

                <button onClick={handleReset} style={{marginTop: '0'}} className="login__button">Отправить</button>
            </div>
        </section>
    )
}