import TaskItem from "./TaskItem"
import { getAuth } from "firebase/auth"
import { onSnapshot, collection, getDocs } from "firebase/firestore"
import { useEffect, useState } from "react"
import { database } from "../firebase"

export default function AllTasks() {
    const [tasks, setTasks] = useState([])
    const [operatedTask, setOperatedTask] = useState('')

    const auth = getAuth()
    const userID = auth.currentUser ? auth.currentUser.uid : null

    useEffect(() => {
        if (!userID) return 
        const unsubcribeFunctions = []
        const fetchAllTasks = async () => {
            const datesCollection = collection(database, 'users', userID, 'allTasks')
            const datesDocs = await getDocs(datesCollection)
        
            datesDocs.docs.forEach(docDate => {
                const tasksCollection = collection(database, 'users', userID, 'allTasks', docDate.id, 'tasks')

                const unsub = onSnapshot(tasksCollection, snapshot => {
                    setTasks(prev => {
                        const taskMap = new Map(prev.map(task => [task.id, task]))

                        snapshot.docs.forEach(doc => {
                            taskMap.set(doc.id, {
                                id: doc.id,
                                task: doc.data().task,
                                status: doc.data().status,
                                date: doc.data().date,
                                index: taskMap.has(doc.id) 
                                ? taskMap.get(doc.id).index
                                : prev.length + snapshot.docs.indexOf(doc)
                            })
                        })

                        const tasksFromMap = Array.from(taskMap.values())
                        const sortedTasks = tasksFromMap.sort((a, b) => a.index - b.index)
                        return sortedTasks
                    })
                }) 
                unsubcribeFunctions.push(unsub)
            })
        }
        fetchAllTasks()
        return () => unsubcribeFunctions.forEach(fn => fn())
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
        <div style={{display: 'flex', alignItems: 'center', flexDirection: "column"}} className="all-tasks">
            <h1 style={{fontSize: '50px', marginTop: '30px', marginBottom: '5px'}}>Все задачи</h1>
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
                        key={`${task.id} - ${task.date}`}
                        accentColor={'black'} />
                    )
                })
            ) : null}
            </ul>
        </div>
    )
}