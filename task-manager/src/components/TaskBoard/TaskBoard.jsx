import { useState } from "react"
import { database, auth } from "../../firebase"
import { collection, addDoc, getDoc } from "firebase/firestore"
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
    const [chooseColor, setChooseColor] = useState(false)
    const [categoryColor, setCategoryColor] = useState('black')
    const [currentColor, setCurrentColor] = useState('')

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
            console.log(categoryColor)
            await addDoc(collection(database, 'users', userID, 'tasks', date, 'categories'), {
                category: categoryValue,
                color: categoryColor
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

    function setColor(color) {
        setCategoryColor(color)
        setChooseColor(false)
    }

    async function getCurrentColor(id) {
        const category = await getDoc(doc(database, 'users', userID, 'tasks', date, 'categories', id))
        setCurrentColor(category.data().color)
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
                <div className="section-choose">
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
                </div> : null}
                {section === 'categories' ?                             
                <div className="taskboard__header">
                    <input
                        onKeyDown={categoryValue !== '' ? (e) => handleEnterPress(e, addCategory) : null}
                        value={categoryValue}
                        maxLength={30}
                        onInput={(e) => setCategoryValue(e.target.value)} 
                        placeholder="Новая категория"
                        type="text" 
                        className="taskboard__write-task" />
                    <button
                        onClick={addCategory} 
                        disabled={categoryValue === ''}
                        className="taskboard__add-task">+</button>
                        <button onClick={() => setChooseColor(prev => !prev)} style={{background: categoryColor}} className="taskboard__category__change-color">Цвет</button>
                        <div className={`taskboard__category__change-color__options ${chooseColor ? 'reveal' : ''}`}>
                            <div onClick={() => setColor('rgb(255, 187, 0)')} style={{backgroundColor:'rgb(255, 187, 0)'}} className="taskboard__category__change-color__option"></div>
                            <div onClick={() => setColor('rgb(230, 0, 0)')} style={{backgroundColor:'rgb(230, 0, 0)'}} className="taskboard__category__change-color__option"></div>
                            <div onClick={() => setColor('rgb(0, 55, 255)')} style={{backgroundColor:'rgb(0, 55, 255)'}} className="taskboard__category__change-color__option"></div>
                            <div onClick={() => setColor('rgb(144, 0, 255)')} style={{backgroundColor:'rgb(144, 0, 255)'}} className="taskboard__category__change-color__option"></div>
                            <div onClick={() => setColor('rgb(0, 195, 255)')} style={{backgroundColor:'rgb(0, 195, 255)'}} className="taskboard__category__change-color__option"></div>
                            <div onClick={() => setColor('black')} style={{backgroundColor:'black'}} className="taskboard__category__change-color__option"></div>
                            <div onClick={() => setColor('rgb(0, 213, 11)')} style={{backgroundColor:'rgb(0, 213, 11)'}} className="taskboard__category__change-color__option"></div>
                            <div onClick={() => setColor('rgb(219, 0, 219)')} style={{backgroundColor:'rgb(219, 0, 219)'}} className="taskboard__category__change-color__option"></div>
                        </div>
                </div> : null}
            </div>
            {section === 'tasks' ? 
                        <div className="taskboard__tasks">
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
                            <ul className="taskboard__categories-list">
                                {categoriesArray.map(category => 
                                    <Category
                                    color={category.color}
                                    date={date}
                                    categoryId={category.id} 
                                    onClick={() => {
                                        setCategory(category.category)
                                        setChosenCategoryId(category.id)
                                        getCurrentColor(category.id)
                                    }}
                                    key={category.id}
                                    content={category.category}/>
                                )}
                            </ul>
                        </div> : null}
            </> : <CategoryTasks color={currentColor} categoryId={chosenCategoryId} date={date} title={category} onReturn={() => setCategory('')} />}
        </div>
    )
}