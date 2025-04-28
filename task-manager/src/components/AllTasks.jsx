import TaskItem from "./TaskItem"
import { getAuth } from "firebase/auth"
import { onSnapshot, collection, getDocs } from "firebase/firestore"
import { useEffect, useState } from "react"
import { database } from "../firebase"

export default function AllTasks() {
    const [tasks, setTasks] = useState('')
    const [operatedTask, setOperatedTask] = useState('')

    const auth = getAuth()
    const userID = auth.currentUser ? auth.currentUser.uid : null

    useEffect(() => {
        const getAllTasks = async () => {
            if (userID) {
                try {
                    const tasksCollection = collection(database, 'users', userID, 'allTasks')
                    const querySnapshot = await getDocs(tasksCollection)
                    const allTasks = []
                    
                    querySnapshot.docs.forEach(doc => {
                        onSnapshot(collection(database, 'users', userID, 'allTasks', doc.id, 'tasks'), 
                        snapshot => {
                            snapshot.forEach(item => allTasks.push({
                                id: item.id,
                                task: item.data().task,
                                status: item.data().status,
                                date: item.data().date
                            }))
                        })
                    })

                    setTimeout(() => setTasks(allTasks), 1000)
                }
                catch (error) {
                    console.log('ERROR:', error)
                }
            }
        }

        getAllTasks()

        return () => {}
    }, [userID])

    useEffect(() => {
        console.log(tasks)
    }, [tasks])

    function toggleOptions(task) {
        setOperatedTask(prev => {
            return task === prev ? '' : task
        })
    }
 
    return (
        <ul className="taskboard__task-list">
            {Array.isArray(tasks) ? (
                tasks.map(task => {
                    return (
                        <TaskItem
                        content={task.task}
                        index={tasks.indexOf(task) + 1}
                        className={task.status === 'complete' ? "taskboard__task complete" : task.status === 'process' ? 'taskboard__task in-process' : 'taskboard__task'}
                        status={task.status} 
                        onSelect={() => toggleOptions(task.id)}
                        operated={operatedTask}
                        itemId={task.id}
                        section={'tasks'}
                        date={task.date}
                        key={task.id} />
                    )
                })
            ) : null}
        </ul>
    )
}