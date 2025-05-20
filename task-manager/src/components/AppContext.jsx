import { createContext } from "react";
import { useState, useEffect } from "react";
import { database } from "../firebase";
import { updateDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";

export const AppContext = createContext()

export default function AppProvider({ children }) {
    const [selectedDate, setSelectedDate] = useState(null)
    const [tasks, setTasks] = useState([])
    const [section, setSection] = useState('')
    const [deadlineDisabled, setDeadlineDisabled] = useState(false)
    const [timers, setTimers] = useState({})
    const [darkTheme, setDarkTheme] = useState(false)

    useEffect(() => {
        const deadlines = localStorage.getItem('deadlines')
        const theme = localStorage.getItem('dark-theme')

        setDeadlineDisabled(JSON.parse(deadlines))
        setDarkTheme(JSON.parse(theme)) 
    }, [])

    useEffect(() => {
        localStorage.setItem('dark-theme', darkTheme)
        localStorage.setItem('deadlines', deadlineDisabled)
    }, [darkTheme, deadlineDisabled])

    const startTaskTimer = async ({ userID, date, taskId, categoryId, time}) => {
        const taskKey = `${categoryId || 'no-category'}-${taskId}`
        const duration = time * 60

        if (timers[taskKey]?.intervalId) {
            clearInterval(timers[taskKey].intervalId)
        }

        console.log(duration)

        const docRef = categoryId === undefined 
        ? doc(database, 'users', userID, 'allTasks', date, 'tasks', taskId)
        : doc(database, 'users', userID, 'allTasks', date, 'categories', categoryId, 'category-tasks', taskId)

        setTimers(prev => ({
            ...prev,
            [taskKey]: {
                remaining: duration,
                intervalId: null,
                status: 'process'
            },
        }))

        await updateDoc(docRef, { status: 'process' })

        const interval = setInterval(() => {
            setTimers(prev => {
                const current = prev[taskKey]
                if (!current) return prev

                if (current.remaining <= 0) {
                    clearInterval(current.intervalId)
                    updateDoc(docRef, {
                        status: current.status === 'process' ? 'created' : current.status
                    })
                    return {
                        ...prev,
                        [taskKey]: {
                            ...current,
                            remaining: 0,
                            intervalId: null
                        }
                    }
                }
                return {
                    ...prev, 
                    [taskKey]: {
                        ...current,
                        remaining: current.remaining - 1
                    }
                }
            })
            
        }, 1000)

        setTimers(prev => ({
            ...prev,
            [taskKey]: {
                ...prev[taskKey],
                intervalId: interval
            }
        }))

        return () => clearInterval(interval)
    }

    return (
        <AppContext.Provider value={
            { 
            selectedDate, 
            tasks, 
            section, 
            deadlineDisabled, 
            timers,
            darkTheme,
            setDeadlineDisabled, 
            setSelectedDate, 
            setTasks, 
            setSection,
            setTimers,
            startTaskTimer,
            setDarkTheme
            }}>
            {children}
        </AppContext.Provider>
    )
}