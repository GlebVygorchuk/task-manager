import { auth } from "../firebase"
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, getAuth, updateCurrentUser, updateProfile} from "firebase/auth"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [nickname, setNickname] = useState('')
    const [passwordCheck, setPasswordCheck] = useState('')
    const [visiblePasswords, setVisiblePasswords] = useState({
        original: false,
        check: false
    })
    const [passwordCorrect, setPasswordCorrect] = useState('')
    const [adviceVisible, setAdviceVisible] = useState(false)
    const [timer, setTimer] = useState(90)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const auth = getAuth()


    useEffect(() => {
        const interval = setInterval(async () => {
            const user = auth.currentUser
            if (user) {
                await user.reload()
                if (user.emailVerified) {
                    setLoading(true)
                    setTimeout(() => {
                        window.location.replace("/main")
                        clearInterval(interval)
                    }, 1000)
                } 
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [navigate])


    async function handleRegister(e) {
        e.preventDefault()

        if (password.length < 8 ||
            password.length > 25 || 
            password.includes("<" || ">" || "$" || "&" || "/" || "*") || 
            email.length < 8 ||
            password !== passwordCheck) {

            setPasswordCorrect(false)

        } else {

            setPasswordCorrect(true)
            
            try {
                const userData = await createUserWithEmailAndPassword(auth, email, password)
                const user = userData.user
                await sendEmailVerification(user)

                await updateProfile(user, {
                    displayName: nickname
                })
            } catch (error) {
                alert(error.message)
            }
        }
        startCountdown()
    }


    function showPassword(eyeId, lineId) {
        const eye = document.getElementById(eyeId)
        const line = document.getElementById(lineId)
        eye.classList.toggle('active')
        line.classList.toggle('hide')

        if (eyeId === 'password-eye') {
            setVisiblePasswords((prev) => ({
                ...prev,
                original: !prev.original
            }))
        } else {
            setVisiblePasswords((prev) => ({
                ...prev,
                check: !prev.check
            }))
        }
    }


    async function handleRepeat() {
        const user = auth.currentUser
        await sendEmailVerification(user)
        setTimer(90)
        startCountdown()
    }


    function startCountdown() {
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev === 0) {
                    clearInterval(interval)
                    return 0
                } else {
                    return prev - 1
                }
            })
        }, 1000)

        return () => clearInterval(interval)
    }

    return (
        <section className="registration">

            <div className="registration__container">

                <h1 style={{fontSize: '45px'}}>Регистрация</h1>

                <form className="registration__form">

                   <input
                    className="registration__input" 
                    value={nickname}
                    placeholder="Ваше имя"
                    onInput={(e) => setNickname(e.target.value)}
                    type="text"
                    maxLength={20} />

                    <input
                    className="registration__input" 
                    value={email}
                    placeholder="Ваш E-Mail"
                    onInput={(e) => setEmail(e.target.value)}
                    type="email" />

                    <div className="input-wrapper">
                        <input
                        className="registration__input"
                        onFocus={() => setAdviceVisible(true)} 
                        onBlur={() => setAdviceVisible(false)} 
                        onInput={(e) => setPassword(e.target.value)}
                        placeholder="Ваш пароль"
                        style={{width: "100%"}}
                        maxLength={25}
                        value={password} 
                        type={visiblePasswords.original ? "text" : "password"} />

                        <div className="svg-wrapper">
                        <svg onClick={() => showPassword('password-eye', 'password-line')} id="password-eye" className="svg-eye" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path d="M12.015 7c4.751 0 8.063 3.012 9.504 4.636-1.401 1.837-4.713 5.364-9.504 5.364-4.42 0-7.93-3.536-9.478-5.407 1.493-1.647 4.817-4.593 9.478-4.593zm0-2c-7.569 0-12.015 6.551-12.015 6.551s4.835 7.449 12.015 7.449c7.733 0 11.985-7.449 11.985-7.449s-4.291-6.551-11.985-6.551zm-.015 5c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2zm0-2c-2.209 0-4 1.792-4 4 0 2.209 1.791 4 4 4s4-1.791 4-4c0-2.208-1.791-4-4-4z"/></svg>
                        <div id="password-line" className="crossline"></div>
                        </div>

                        <div id="advice" className={adviceVisible ? 'advice visible' : 'advice'}>
                            <ul className="advice__list">
                                <li>8-25 символов</li>
                                <li>Запрещены: "&lt;", "&gt;", "$", "&", "/", "*"</li>
                            </ul>
                        </div>
                        
                    </div>

                    <div className="input-wrapper">
                        <input
                        className="registration__input" 
                        placeholder="Повторите пароль"
                        style={{width: "100%"}}
                        onInput={(e) => setPasswordCheck(e.target.value)}
                        value={passwordCheck} 
                        type={visiblePasswords.check ? "text" : "password"} />

                        <div className="svg-wrapper">
                        <svg onClick={() => showPassword('check-eye', 'check-line')} id="check-eye" className="svg-eye" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path d="M12.015 7c4.751 0 8.063 3.012 9.504 4.636-1.401 1.837-4.713 5.364-9.504 5.364-4.42 0-7.93-3.536-9.478-5.407 1.493-1.647 4.817-4.593 9.478-4.593zm0-2c-7.569 0-12.015 6.551-12.015 6.551s4.835 7.449 12.015 7.449c7.733 0 11.985-7.449 11.985-7.449s-4.291-6.551-11.985-6.551zm-.015 5c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2zm0-2c-2.209 0-4 1.792-4 4 0 2.209 1.791 4 4 4s4-1.791 4-4c0-2.208-1.791-4-4-4z"/></svg>
                        <div id="check-line" className="crossline"></div>
                        </div>
                    </div>

                    <button
                    className="registration__button" 
                    onClick={(e) => handleRegister(e)}
                    type="submit">Зарегистрироваться</button>

                    {passwordCorrect === false ? <p style={{marginTop: '10px'}}>Данные заполнены неверно...&#40;</p> : null}
                    {passwordCorrect ? 
                    <>
                    <p style={{marginTop: '10px'}} className="info">Подтвердите регистрацию на почте</p>
                    <p 
                    className={timer === 0 ? 'repeat' : null}
                    onClick={handleRepeat}>
                        {timer === 0 ? `Отправить повторно` : `Отправить повторно через: ${timer} сек.`}
                    </p>
                    </> : null}

                </form>
            </div>
            
            {loading ?         
            <div className="confirmation dark">
                <div style={{display: 'flex', justifyContent: 'center', marginBottom: '60px'}}><svg style={{position: 'initial'}} className="sandclock" xmlns="http://www.w3.org/2000/svg" fill="black" width="50" height="50" viewBox="0 0 24 24"><path d="M18.513 7.119c.958-1.143 1.487-2.577 1.487-4.036v-3.083h-16v3.083c0 1.459.528 2.892 1.487 4.035l3.086 3.68c.567.677.571 1.625.009 2.306l-3.13 3.794c-.936 1.136-1.452 2.555-1.452 3.995v3.107h16v-3.107c0-1.44-.517-2.858-1.453-3.994l-3.13-3.794c-.562-.681-.558-1.629.009-2.306l3.087-3.68zm-4.639 7.257l3.13 3.794c.652.792.996 1.726.996 2.83h-12c0-1.104.343-2.039.996-2.829l3.129-3.793c1.167-1.414 1.159-3.459-.019-4.864l-3.086-3.681c-.66-.785-1.02-1.736-1.02-2.834h12c0 1.101-.363 2.05-1.02 2.834l-3.087 3.68c-1.177 1.405-1.185 3.451-.019 4.863z"/></svg></div>
            </div> : null}

        </section>
    )
}