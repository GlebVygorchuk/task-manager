import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { useEffect, useState } from "react"
import { useNavigate} from "react-router-dom"
import { AppContext } from "../components/AppContext"
import { useContext } from "react"
import { database } from "../firebase"
import { collection, getDocs, onSnapshot, writeBatch } from "firebase/firestore"
import TimeScale from "../components/TimeScale/TimeScale"
import TaskBoard from "../components/TaskBoard/TaskBoard"
import AllTasks from "../components/AllTasks"
 
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
    const [loadingData, setLoadingData] = useState(true)
    const [showExtra, setShowExtra] = useState(false)
    const [allTasks, setAllTasks] = useState(false)
    const { selectedDate, deadlineDisabled, setDeadlineDisabled, darkTheme, setDarkTheme } = useContext(AppContext)

    const auth = getAuth()
    const navigate = useNavigate()
    const userID = auth.currentUser ? auth.currentUser.uid : null


    useEffect(() => {
        window.history.pushState(null, '', '/main')
        window.history.pushState(null, '', '/main')
        window.addEventListener('popstate', () => {
            window.history.pushState(null, '', '/main')
            setShowModal(true)
        })
        return () => window.removeEventListener('popstate', () => {})
    }, [])


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (!user) {
                navigate('/')
            } 
        })

        return () => unsubscribe()
    }, [navigate])


    useEffect(() => {
        if (!userID) return

        async function cleanUp() {
            const now = new Date().toISOString().split('T')[0]
            const datesRef = collection(database, 'users', userID, 'allTasks')
            const datesDocs = await getDocs(datesRef)
            const batch = writeBatch(database)

            datesDocs.docs.forEach(doc => {
                if (doc.id < now) {
                    batch.delete(doc.ref)
                } 
            })

            await batch.commit()
        }

        cleanUp()
    }, [userID])


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
        getData()
    }, [selectedDate, userID])


    useEffect(() => {
        document.body.setAttribute('data-theme', darkTheme ? 'dark' : 'light')
    }, [darkTheme])


    useEffect(() => {
        const unsub = onAuthStateChanged(auth, () => {
            console.log(auth.currentUser.displayName)
        })

        return () => unsub()
    }, [auth])


    async function getData() {
        setLoadingData(true)
        
        if (userID && selectedDate) {
            
            const getTasks = onSnapshot(
                collection(database, 'users', userID, 'allTasks', `${selectedDate}`, 'tasks'),
                (querySnapshot) => {

                    const tasksThisDay = []
                    querySnapshot.forEach(doc => {
                        tasksThisDay.push({
                            id: doc.id,
                            task: doc.data().task,
                            status: doc.data().status,
                            date: doc.data().date
                        })
                    })

                    setCurrentTasks(tasksThisDay)
                    setLoadingData(false)

                }
            )

            const getCategories = onSnapshot(

                collection(database, 'users', userID, 'allTasks', `${selectedDate}`, 'categories'),
                (querySnapshot) => {

                    const categoriesThisDay = []
                    querySnapshot.forEach(doc => {
                        categoriesThisDay.push({
                            id: doc.id,
                            category: doc.data().category,
                            color: doc.data().color
                        })
                    })

                    setCategories(categoriesThisDay)
                    setLoadingData(false)

                }
            )

            return () => {
                getTasks()
                getCategories()
            }
        }
    }


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
        <header 
        className="main__header" 
        style={darkTheme ? 
        {borderBottom: '1px solid rgb(44, 44, 44)'} : 
        {borderBottom: '1px solid rgb(215, 215, 215)'}}>

            <div className="main__header__name">

                <h1 className="main__header__title">Chronos</h1>

                <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24"><path d="M18.513 7.119c.958-1.143 1.487-2.577 1.487-4.036v-3.083h-16v3.083c0 1.459.528 2.892 1.487 4.035l3.086 3.68c.567.677.571 1.625.009 2.306l-3.13 3.794c-.936 1.136-1.452 2.555-1.452 3.995v3.107h16v-3.107c0-1.44-.517-2.858-1.453-3.994l-3.13-3.794c-.562-.681-.558-1.629.009-2.306l3.087-3.68zm-4.639 7.257l3.13 3.794c.652.792.996 1.726.996 2.83h-12c0-1.104.343-2.039.996-2.829l3.129-3.793c1.167-1.414 1.159-3.459-.019-4.864l-3.086-3.681c-.66-.785-1.02-1.736-1.02-2.834h12c0 1.101-.363 2.05-1.02 2.834l-3.087 3.68c-1.177 1.405-1.185 3.451-.019 4.863z"/></svg>
            
            </div>
            
            <div className="profile-information">
                
                <h2 className="username">{`Добро пожаловать, ${userdata.nickname}!`}</h2>
                
                <div 
                onClick={() => setShowProfile(prev => !prev)} 
                className="main__header__profile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 32 32" style={{enableBackground: 'new 0 0 32 32'}} xmlSpace="preserve"><path d="M16 31C7.729 31 1 24.271 1 16S7.729 1 16 1s15 6.729 15 15-6.729 15-15 15zm0-28C8.832 3 3 8.832 3 16s5.832 13 13 13 13-5.832 13-13S23.168 3 16 3z"/><circle cx="16" cy="11.368" r="3.368"/><path d="M20.673 24h-9.346c-.83 0-1.502-.672-1.502-1.502v-.987a5.404 5.404 0 0 1 5.403-5.403h1.544a5.404 5.404 0 0 1 5.403 5.403v.987c0 .83-.672 1.502-1.502 1.502z"/></svg>
                </div>
            
            </div>

            <div 
            onClick={() => {
                setShowExtra(false)
                setShowModal(false)
                setShowProfile(false)
            }} 
            className={showModal || showExtra || showProfile ? 'confirmation dark' : 'confirmation'}>
                
                <div className={`main__header__info ${showProfile ? 'show-profile' : null}`}>
                
                    <p>Имя: <span className="info-field">{userdata.nickname}</span></p>
                
                    <p>E-Mail: <span className="info-field">{userdata.email}</span></p>
                
                    <ul className="extra-list">
                    
                    <button 
                    onClick={(e) => {
                        e.stopPropagation()
                        setDeadlineDisabled(prev => !prev)
                    }} 
                    className='extra-option '> 
                        * дедлайны {deadlineDisabled ? '- выкл.' : '- вкл.'}
                    </button>

                    <button 
                    onClick={() => {
                        setAllTasks(prev => !prev)
                        setShowProfile(false)
                    }} 
                    className='extra-option'>
                        * все задачи
                    </button>

                    <button 
                    onClick={(e) => {
                        e.stopPropagation()
                        setDarkTheme(prev => !prev)
                    }} className="extra-option">
                        * тема - {darkTheme ? 'тёмная' : 'светлая'}
                    </button>

                    </ul>

                    <button 
                    className="main__header__logout-btn" 
                    onClick={(e) => {
                        e.stopPropagation()
                        setShowModal(true)
                        setShowProfile(false)
                    }}>
                        Выйти
                    </button>

            </div> 

            </div>         

        </header>
        
        <main className="main">

            {allTasks ? <AllTasks /> : <TimeScale />}

            {!allTasks ? selectedDate &&

            <TaskBoard 
            loading={loadingData} 
            date={selectedDate} 
            tasks={currentTasks} 
            categories={categories}/> 

            : null}
        
        </main>

        {loading ?         
        <div className="confirmation dark">
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '60px'}}><svg style={{position: 'initial'}} className="sandclock" xmlns="http://www.w3.org/2000/svg" fill="black" width="50" height="50" viewBox="0 0 24 24"><path d="M18.513 7.119c.958-1.143 1.487-2.577 1.487-4.036v-3.083h-16v3.083c0 1.459.528 2.892 1.487 4.035l3.086 3.68c.567.677.571 1.625.009 2.306l-3.13 3.794c-.936 1.136-1.452 2.555-1.452 3.995v3.107h16v-3.107c0-1.44-.517-2.858-1.453-3.994l-3.13-3.794c-.562-.681-.558-1.629.009-2.306l3.087-3.68zm-4.639 7.257l3.13 3.794c.652.792.996 1.726.996 2.83h-12c0-1.104.343-2.039.996-2.829l3.129-3.793c1.167-1.414 1.159-3.459-.019-4.864l-3.086-3.681c-.66-.785-1.02-1.736-1.02-2.834h12c0 1.101-.363 2.05-1.02 2.834l-3.087 3.68c-1.177 1.405-1.185 3.451-.019 4.863z"/></svg></div>
        </div> : null}
        
        <div 
        onClick={() => {
            setShowExtra(false)
            setShowModal(false)
        }} 
        className={showModal || showExtra ? 'confirmation dark' : 'confirmation'}>

        <div className={showModal ? 'make-sure show-modal' : 'make-sure'}>

            <p style={{fontSize: '25px'}}>Вы уверены?</p>

            <div className="buttons">

                <button 
                id="not-sure" 
                onClick={() => setShowModal(false)}>Нет</button>

                <button 
                id="sure" 
                onClick={logOut}>Да</button>

            </div>

        </div>
        
        </div>

        </>
    )
}