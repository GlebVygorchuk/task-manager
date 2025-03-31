import { useState } from "react"
import { useEffect } from "react"
import { database, auth } from "../firebase"
import { doc, addDoc, collection, onSnapshot } from "firebase/firestore"
import TaskItem from "./TaskItem"

export default function CategoryTasks({ title, onReturn, date, categoryId }) {
    const [taskValue, setTaskValue] = useState('')
    const [categoryTasks, setCategoryTasks] = useState([])
    const [operatedTask, setOperatedTask] = useState('')

    const userID = auth.currentUser ? auth.currentUser.uid : null

    useEffect(() => {
        if (userID && date) {
            const getCategoryTasks = onSnapshot(
                collection(database, 'users', userID, 'tasks', date, 'categories', categoryId, 'category-tasks'),
                (querySnapshot) => {
                    const tasks = []
                    querySnapshot.forEach(doc => {
                        tasks.push({
                            id: doc.id,
                            task: doc.data().task,
                            status: doc.data().status
                        })
                    })
                    try {
                        setCategoryTasks(tasks)
                    } 
                    catch(error) {
                        console.error(error.message)
                    }
                }
            )

            return () => getCategoryTasks()
        }
    }, [date, userID, categoryId])

    async function addTask() {
        setTaskValue('')
        try {
            await addDoc(collection(database, 'users', userID, 'tasks', date, 'categories', categoryId, 'category-tasks' ), {
                task: taskValue,
                status: 'created'
            })
        }
        catch(error) {
            console.error(error.message)
        }
    }

    function handleEnterPress(e) {
        if (e.key === 'Enter') {
            addTask()
        }
    }

    function toggleOptions(task) {
        setOperatedTask(prev => {
            return task === prev ? '' : task
        })
    }

    return (
        <div className="category-tasks">
            <div className="category-tasks__header">
                <h1 className="category-tasks__title">Категория: <span className="highlight">{title}</span></h1>
                <button onClick={onReturn} className="category-tasks__return-btn">&lt; Назад</button>
            </div>
            <div className="category-tasks__create-task">
                <input
                onKeyDown={handleEnterPress}
                value={taskValue}
                onInput={(e) => setTaskValue(e.target.value)}
                placeholder="Новая задача" 
                type="text" 
                className="taskboard__write-task" />
                <button 
                onClick={addTask}
                className="taskboard__add-task">+</button>
            </div>
            <ul className="taskboard__task-list">
                {categoryTasks.map(task => {
                    return (
                        <TaskItem
                        className={task.status === 'complete' ? "taskboard__task complete" : task.status === 'process' ? 'taskboard__task in-process' : 'taskboard__task'}
                        index={categoryTasks.indexOf(task) + 1} 
                        content={task.task}
                        status={task.status}
                        itemId={task.id}
                        date={date}
                        key={task.id}
                        operated={operatedTask}
                        section={'categories'}
                        categoryId={categoryId}
                        onSelect={() => toggleOptions(task.id)}/>
                    )
                })}
            </ul>
        </div>
    )
}