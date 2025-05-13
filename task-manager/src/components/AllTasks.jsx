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
        const unsubs = []
        
        async function fetchAllTasks() {
            const dates = collection(database, 'users', userID, 'allTasks')
            const datesSnapshot = await getDocs(dates)

            const taskMap = new Map()

            for (const dateDoc of datesSnapshot.docs) {
                const date = dateDoc.id
                const tasksCollection = collection(database, 'users', userID, 'allTasks', date, 'tasks')

                const fetchTasks = onSnapshot(tasksCollection, snapshot => {
                    snapshot.docChanges().forEach(change => {
                        const data = change.doc.data()
                        const id = change.doc.id
                        const task = {
                            id,
                            task: data.task,
                            status: data.status,
                            date,
                            index: data.index ?? 0
                        }

                        if (change.type === 'removed') {
                            taskMap.delete(id)
                        } else {
                            taskMap.set(id, task)
                        }

                        const mapValues = Array.from(taskMap.values())
                        const sortedTasks = mapValues.sort((a, b) => a - b)
                        setTasks(sortedTasks)
                    })
                })
                unsubs.push(fetchTasks)

                const categoriesCollection = collection(database, 'users', userID, 'allTasks', date, 'categories')
                const categoriesSnapshot = await getDocs(categoriesCollection)
                for (const category of categoriesSnapshot.docs) {
                    const categoryTasksCollection = collection(database, 'users', userID, 'allTasks', date, 'categories', category.id, 'category-tasks')
                    const fetchCategoryTasks = onSnapshot(categoryTasksCollection, snapshot => {
                        snapshot.docChanges().forEach(change => {
                            const data = change.doc.data()
                            const id = change.doc.id
                            const task = {
                                id,
                                task: data.task,
                                status: data.status,
                                date,
                                categoryId: data.categoryId,
                                index: data.index ?? 0
                            }

                            if (change.type === 'removed') {
                                taskMap.delete(id)
                            } else {
                                taskMap.set(id, task)
                            }

                            const mapValues = Array.from(taskMap.values())
                            const sorted = mapValues.sort((a, b) => a - b)
                            setTasks(sorted)
                        })
                    })
                    unsubs.push(fetchCategoryTasks)
                }
            }
        }
        fetchAllTasks()
        return () => unsubs.forEach(fn => fn())
    }, [userID])

    function toggleOptions(task) {
        setOperatedTask(prev => {
            return task === prev ? '' : task
        })
    }

    useEffect(() => {
        console.log(tasks)
    }, [tasks])
 
    return (
        <div style={{display: 'flex', alignItems: 'center', flexDirection: "column", paddingBottom: '50px'}} className="all-tasks">
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
                        categoryId={task.categoryId}
                        section={'all tasks'}
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