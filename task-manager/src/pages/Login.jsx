import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordIsVisible, setPasswordIsVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [remember, setRemember] = useState(false)
    const [info, setInfo] = useState('Введите E-Mail, и мы пришлём на него письмо для сброса пароля')

    const auth = getAuth()
    const navigate = useNavigate()

    function showPassword() {
        const eye = document.getElementById('eye')
        const line = document.getElementById('line')
        eye.classList.toggle('active')
        line.classList.toggle('hide')
        setPasswordIsVisible(prev => !prev)
    }


    function handleLogin(e) {
        e.preventDefault()
        setError(false)

        if (remember) {
            setPersistence(auth, browserLocalPersistence)
            .then(() => {
                return signInWithEmailAndPassword(auth, email, password)
            })
            .then(() => {
                setLoading(true)
    
                setTimeout(() => {
                    window.location.replace("/main")
                }, 1000)
            })
            .catch(() => setError(true))
        } else {
            signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                setLoading(true)
    
                setTimeout(() => {
                    window.location.replace("/main")
                }, 1000)
            })
            .catch(() => setError(true))
        }
    }


    function handleReset(e) {
        e.stopPropagation()
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

                        <div className="svg-wrapper">
                        <svg onClick={showPassword} id="eye" className="svg-eye" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path d="M12.015 7c4.751 0 8.063 3.012 9.504 4.636-1.401 1.837-4.713 5.364-9.504 5.364-4.42 0-7.93-3.536-9.478-5.407 1.493-1.647 4.817-4.593 9.478-4.593zm0-2c-7.569 0-12.015 6.551-12.015 6.551s4.835 7.449 12.015 7.449c7.733 0 11.985-7.449 11.985-7.449s-4.291-6.551-11.985-6.551zm-.015 5c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2zm0-2c-2.209 0-4 1.792-4 4 0 2.209 1.791 4 4 4s4-1.791 4-4c0-2.208-1.791-4-4-4z"/></svg>
                        <div id="line" className="crossline"></div>
                        </div>
                    </div>

                    <div className="remember" onClick={() => setRemember(prev => !prev)}>
                        <div style={remember ? {backgroundColor: 'black'} : null} className="remember__checkbox">
                        <svg style={{marginTop: '-5px', marginLeft: '-5.5px'}} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill={remember ? 'white' : 'transparent'} viewBox="0 0 16 16">
                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                            </svg>
                        </div>
                        <p className="remember__text">Запомнить меня</p>
                    </div>

                    <button onClick={handleLogin} type="submit" className="login__button">Войти</button>

                    <p onClick={() => setShowModal(true)} style={{marginTop: '10px'}} className="repeat">Забыли пароль?</p>
                    {error ? <p>Адрес почты/пароль указан неверно</p> : null}

                </form>
            </div>

            <div onClick={() => setShowModal(false)} className={showModal ? 'confirmation dark' : 'confirmation'}>
                            <div className={showModal ? 'email-reset show' : 'email-reset'}>
                <div onClick={() => setShowModal(false)} className="close-button"></div>

                <p>{info}</p>

                <input
                style={{marginTop: '5px'}}
                placeholder="Ваш E-Mail"
                onClick={(e) => e.stopPropagation()}
                onInput={(e) => {setEmail(e.target.value)}} 
                value={email} 
                type="email" 
                className="login__input" />

                <button onClick={handleReset} style={{marginTop: '0'}} className="login__button">Отправить</button>
            </div>
            </div>
            {loading ?         
                <div className="confirmation dark">
                    <div style={{display: 'flex', justifyContent: 'center', marginBottom: '80px'}}><svg style={{position: 'initial'}} className="sandclock" xmlns="http://www.w3.org/2000/svg" fill="black" width="50" height="50" viewBox="0 0 24 24"><path d="M18.513 7.119c.958-1.143 1.487-2.577 1.487-4.036v-3.083h-16v3.083c0 1.459.528 2.892 1.487 4.035l3.086 3.68c.567.677.571 1.625.009 2.306l-3.13 3.794c-.936 1.136-1.452 2.555-1.452 3.995v3.107h16v-3.107c0-1.44-.517-2.858-1.453-3.994l-3.13-3.794c-.562-.681-.558-1.629.009-2.306l3.087-3.68zm-4.639 7.257l3.13 3.794c.652.792.996 1.726.996 2.83h-12c0-1.104.343-2.039.996-2.829l3.129-3.793c1.167-1.414 1.159-3.459-.019-4.864l-3.086-3.681c-.66-.785-1.02-1.736-1.02-2.834h12c0 1.101-.363 2.05-1.02 2.834l-3.087 3.68c-1.177 1.405-1.185 3.451-.019 4.863z"/></svg></div>
                </div> : null}
        </section>
    )
}