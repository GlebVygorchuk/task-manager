import { useState } from "react"
import { useEffect } from "react"
import { database, auth } from "../firebase"
import { doc, addDoc, collection, onSnapshot, getDoc } from "firebase/firestore"
import TaskItem from "./TaskItem"

export default function CategoryTasks({ title, onReturn, date, categoryId}) {
    const [taskValue, setTaskValue] = useState('')
    const [categoryTasks, setCategoryTasks] = useState([])
    const [operatedTask, setOperatedTask] = useState('')
    const [currentColor, setCurrentColor] = useState('black')
    const [updating, setUpdating] = useState(false)

    const userID = auth.currentUser ? auth.currentUser.uid : null

    async function getCategoryColor() {
        setUpdating(true)
        const category = await getDoc(doc(database, 'users', userID, 'tasks', date, 'categories', categoryId))
        setCurrentColor(category.data().color)
        setUpdating(false)
    }

    useEffect(() => {
        getCategoryColor()
    }, [categoryId])

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

    useEffect(() => {
        console.log(getCategoryColor())
    }, [categoryId])

    return (
        <>
        {updating ? <div style={{display: 'flex', justifyContent: 'center'}}><svg style={{position: 'initial', marginTop: '15px'}} className="sandclock" xmlns="http://www.w3.org/2000/svg" fill="black" width="40" height="40" viewBox="0 0 24 24"><path d="M18.513 7.119c.958-1.143 1.487-2.577 1.487-4.036v-3.083h-16v3.083c0 1.459.528 2.892 1.487 4.035l3.086 3.68c.567.677.571 1.625.009 2.306l-3.13 3.794c-.936 1.136-1.452 2.555-1.452 3.995v3.107h16v-3.107c0-1.44-.517-2.858-1.453-3.994l-3.13-3.794c-.562-.681-.558-1.629.009-2.306l3.087-3.68zm-4.639 7.257l3.13 3.794c.652.792.996 1.726.996 2.83h-12c0-1.104.343-2.039.996-2.829l3.129-3.793c1.167-1.414 1.159-3.459-.019-4.864l-3.086-3.681c-.66-.785-1.02-1.736-1.02-2.834h12c0 1.101-.363 2.05-1.02 2.834l-3.087 3.68c-1.177 1.405-1.185 3.451-.019 4.863z"/></svg></div> :
        <div className="category-tasks">
        <div className="category-tasks__header">
            <h1 style={{maxWidth: '70%', textAlign: 'center'}} className="category-tasks__title">Категория: <span style={{color: currentColor === undefined ? 'black' : currentColor}} className="highlight">{title}</span></h1>
        </div>
        <div className="category-tasks__create-task">
            <input
            value={taskValue}
            onInput={(e) => setTaskValue(e.target.value)}
            onKeyDown={taskValue !== '' ? (e) => handleEnterPress(e) : null}
            placeholder="Новая задача" 
            type="text" 
            className="taskboard__write-task" />
            <button
            disabled={taskValue === ''} 
            onClick={addTask}
            className="taskboard__add-task">+</button>
        </div>
        <ul className="taskboard__task-list">
            {categoryTasks.map(task => {
                return (
                    <TaskItem
                    className={task.status === 'complete' ? "taskboard__task complete" : task.status === 'process' ? 'taskboard__task in-process' : 'taskboard__task'}
                    style={task.status === 'complete' ? {backgroundColor: currentColor} : task.status === 'process' ? {border: `1.5px solid ${currentColor}`} : null}
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
    </div>}
    <button onClick={onReturn} className="category-tasks__return-btn">&lt; Назад</button>
    </>
    )
}