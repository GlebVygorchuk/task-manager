import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../components/AppContext"
import { useContext } from "react"
import { database } from "../firebase"
import { collection, getDocs, onSnapshot } from "firebase/firestore"
import TimeScale from "../components/TimeScale/TimeScale"
import TaskBoard from "../components/TaskBoard/TaskBoard"
 
export default function MainPage() {
    const [loading, setLoading] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [userdata, setUserdata] = useState({
        nickname: '',
        email: ''
    })
    const [currentTasks, setCurrentTasks] = useState([])
    const [categories, setCategories] = useState([])
    const { selectedDate } = useContext(AppContext)

    const auth = getAuth()
    const navigate = useNavigate()
    const userID = auth.currentUser ? auth.currentUser.uid : null

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserdata(() => ({
                    nickname: user.displayName,
                    email: user.email
                }))
            }
        })

        return () => unsubscribe()
    }, [])

    useEffect(() => {
        if (userID && selectedDate) {

            const getTasks = onSnapshot(
                collection(database, 'users', userID, 'tasks', `${selectedDate}`, 'tasks'),
                (querySnapshot) => {
                    const tasksThisDay = []
                    querySnapshot.forEach(doc => {
                        tasksThisDay.push({
                            id: doc.id,
                            task: doc.data().task,
                            status: doc.data().status
                        })
                    })
                    setCurrentTasks(tasksThisDay)
                }
            )

            const getCategories = onSnapshot(
                collection(database, 'users', userID, 'tasks', selectedDate, 'categories'),
                (querySnapshot) => {
                    const categoriesThisDay = []
                    querySnapshot.forEach(doc => {
                        categoriesThisDay.push({
                            id: doc.id,
                            category: doc.data().category
                        })
                    })
                    setCategories(categoriesThisDay)
                }
            )

            return () => {
                getTasks()
                getCategories()
            }
        }
    }, [selectedDate, userID])

    function logOut() {
        signOut(auth)
        setShowModal(false)
        setLoading(true)

        setTimeout(() => {
            navigate('/')
        }, 2000)
    }

    return (
        <>
        <header className="main__header">
            <div className="main__header__name">
                <h1 className="main__header__title">Chronos</h1>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path d="M18.513 7.119c.958-1.143 1.487-2.577 1.487-4.036v-3.083h-16v3.083c0 1.459.528 2.892 1.487 4.035l3.086 3.68c.567.677.571 1.625.009 2.306l-3.13 3.794c-.936 1.136-1.452 2.555-1.452 3.995v3.107h16v-3.107c0-1.44-.517-2.858-1.453-3.994l-3.13-3.794c-.562-.681-.558-1.629.009-2.306l3.087-3.68zm-4.639 7.257l3.13 3.794c.652.792.996 1.726.996 2.83h-12c0-1.104.343-2.039.996-2.829l3.129-3.793c1.167-1.414 1.159-3.459-.019-4.864l-3.086-3.681c-.66-.785-1.02-1.736-1.02-2.834h12c0 1.101-.363 2.05-1.02 2.834l-3.087 3.68c-1.177 1.405-1.185 3.451-.019 4.863z"/></svg>
            </div>
            <div className="profile-information">
                <h2 className="username">{`Добро пожаловать, ${userdata.nickname}!`}</h2>
                <div onClick={() => setShowProfile(prev => !prev)} className="main__header__profile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" viewBox="0 0 32 32" style={{enableBackground: 'new 0 0 32 32'}} xmlSpace="preserve"><path d="M16 31C7.729 31 1 24.271 1 16S7.729 1 16 1s15 6.729 15 15-6.729 15-15 15zm0-28C8.832 3 3 8.832 3 16s5.832 13 13 13 13-5.832 13-13S23.168 3 16 3z"/><circle cx="16" cy="11.368" r="3.368"/><path d="M20.673 24h-9.346c-.83 0-1.502-.672-1.502-1.502v-.987a5.404 5.404 0 0 1 5.403-5.403h1.544a5.404 5.404 0 0 1 5.403 5.403v.987c0 .83-.672 1.502-1.502 1.502z"/></svg>
                </div>
            </div>
                     
            <div className={`main__header__info ${showProfile ? 'show-profile' : null}`}>
                <div onClick={() => setShowProfile(false)} className="close-button"></div>
                <p>Имя: <span className="info-field">{userdata.nickname}</span></p>
                <p>E-Mail: <span className="info-field">{userdata.email}</span></p>
                <button 
                className="main__header__logout-btn" 
                onClick={() => setShowModal(true)}>Выйти</button>
            </div> 
        </header>

        <div style={{top: '0'}} className={loading ? "loading-screen load" : "loading-screen"}></div>
        
        <main className="main">
            <TimeScale />
            {selectedDate && <TaskBoard date={selectedDate} tasks={currentTasks} categories={categories}/>}
        </main>
        
        <div className={showModal ? 'confirmation dark' : 'confirmation'}>
        <div className={showModal ? 'make-sure show-modal' : 'make-sure'}>
            <p style={{fontSize: '25px'}}>Вы уверены?</p>
            <div className="buttons">
                <button id="not-sure" onClick={() => setShowModal(false)}>Нет</button>
                <button id="sure" onClick={logOut}>Да</button>
            </div>
        </div>
        </div>

        </>
    )
}