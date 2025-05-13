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

    const startTaskTimer = async ({ userID, date, taskId, categoryId, time}) => {
        console.log(userID)
        console.log(date)
        console.log(taskId)
        console.log(categoryId)
        console.log(time)

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

    // const startTimer = (taskId, seconds) => {
    //     setTimers(prev => ({
    //         ...prev, 
    //         [taskId]: {
    //             running: true,
    //             remaining: seconds
    //         }
    //     }))
    // }

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setTimers(prev => {
    //             const updated = {...prev}
    //             Object.entries(updated).forEach(([taskId, timer]) => {
    //                 if (timer.running && timer.remaining > 0) {
    //                     updated[taskId] = {
    //                         ...timer,
    //                         remaining: timer.remaining - 1
    //                     }
    //                 }
    //             })
    //             return updated
    //         })
    //     }, 1000)

    //     return () => clearInterval(interval)
    // }, [])
    
    return (
        <AppContext.Provider value={
            { 
            selectedDate, 
            tasks, 
            section, 
            deadlineDisabled, 
            timers,
            setDeadlineDisabled, 
            setSelectedDate, 
            setTasks, 
            setSection,
            setTimers,
            startTaskTimer
            }}>
            {children}
        </AppContext.Provider>
    )
}