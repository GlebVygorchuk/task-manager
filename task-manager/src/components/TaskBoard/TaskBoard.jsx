import { useState } from "react"
import { database, auth } from "../../firebase"
import { collection, addDoc } from "firebase/firestore"
import { useEffect } from "react"
import { doc, deleteDoc, updateDoc } from 'firebase/firestore'
import TaskItem from "../TaskItem"
import Category from "../Category"
import CategoryTasks from "../CategoryTasks"

export default function TaskBoard({ date, tasks, categories }) {
    const [taskValue, setTaskValue] = useState('')
    const [categoryValue, setCategoryValue] = useState('')
    const [tasksArray, setTasksArray] = useState([])
    const [categoriesArray, setCategoriesArray] = useState([])
    const [operatedTask, setOperatedTask] = useState('')
    const [section, setSection] = useState('')
    const [category, setCategory] = useState('')
    const [chosenCategoryId, setChosenCategoryId] = useState('')

    const userID = auth.currentUser ? auth.currentUser.uid : null

    async function addTask() {
        setTaskValue('')
        try {
            await addDoc(collection(database, 'users', userID, 'tasks', date, 'tasks'), {
                task: taskValue,
                status: 'created'
            })
        } catch(error) {
            console.error(error.message)
        }
    }

    async function addCategory() {
        setCategoryValue('')
        try {
            await addDoc(collection(database, 'users', userID, 'tasks', date, 'categories'), {
                category: categoryValue
            })
        } catch(error) {
            console.error(error.message)
        }
    }

    function handleEnterPress(e, func) {
        if (e.key === 'Enter') {
            func()
        }
    }

    function toggleOptions(task) {
        setOperatedTask(prev => {
            return task === prev ? '' : task
        })
    }

    useEffect(() => {
        setTasksArray(tasks)
        setCategoriesArray(categories)
    }, [tasks, categories])

    useEffect(() => {
        setCategory('')
    }, [date])

    return (
        <div className="taskboard">
            {category === '' ? <>
            <div className="taskboard__select">
                <button 
                onClick={() => setSection('tasks')} 
                className={section === 'tasks' ? "taskboard__select_btn selected" : "taskboard__select_btn"}>
                    Задачи
                </button>
                <button 
                onClick={() => setSection('categories')} 
                className={section === 'categories' ? "taskboard__select_btn selected" : "taskboard__select_btn"}>
                    Категории
                </button>
            </div>
            {section === 'tasks' ? 
                        <div className="taskboard__tasks">
                        <div className="taskboard__header">
                            <input 
                            onInput={(e) => setTaskValue(e.target.value)}
                            onKeyDown={taskValue !== '' ? (e) => handleEnterPress(e, addTask) : null} 
                            value={taskValue} 
                            type="text" 
                            className="taskboard__write-task" 
                            placeholder="Новая задача"/>
                            <button 
                            type="button"
                            disabled={taskValue === ''}
                            onClick={addTask} 
                            className="taskboard__add-task">+</button>
                        </div>
            
                        <ul className="taskboard__task-list">
                            {Array.isArray(tasksArray) ? (
                                tasksArray.map(task => {
                                    return (
                                        <TaskItem 
                                        content={task.task}
                                        index={tasksArray.indexOf(task) + 1}
                                        className={task.status === 'complete' ? "taskboard__task complete" : task.status === 'process' ? 'taskboard__task in-process' : 'taskboard__task'}
                                        status={task.status} 
                                        onSelect={() => toggleOptions(task.id)}
                                        operated={operatedTask}
                                        itemId={task.id}
                                        section={'tasks'}
                                        date={date}
                                        key={task.id}/>
                                    )
                                })
                            ) : null}
                        </ul>
                        </div> : null}
            {section === 'categories' ? 
                        <div className="taskboard-categories">
                            <div className="taskboard__header">
                                <input
                                onKeyDown={categoryValue !== '' ? (e) => handleEnterPress(e, addCategory) : null}
                                value={categoryValue}
                                onInput={(e) => setCategoryValue(e.target.value)} 
                                placeholder="Новая категория"
                                type="text" 
                                className="taskboard__write-task" />
                                <button
                                onClick={addCategory} 
                                className="taskboard__add-task">+</button>
                            </div>
                            <ul className="taskboard__categories-list">
                                {categoriesArray.map(category => 
                                    <Category 
                                    onClick={() => {
                                        setCategory(category.category)
                                        setChosenCategoryId(category.id)
                                    }}
                                    key={category.id}
                                    content={category.category}/>
                                )}
                            </ul>
                        </div> : null}
            </> : <CategoryTasks categoryId={chosenCategoryId} date={date} title={category} onReturn={() => setCategory('')} />}
        </div>
    )
}