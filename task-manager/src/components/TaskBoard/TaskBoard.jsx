import { useState, useContext } from "react"
import { database, auth } from "../../firebase"
import { collection, addDoc, getDoc } from "firebase/firestore"
import { useEffect } from "react"
import { doc, deleteDoc, updateDoc } from 'firebase/firestore'
import TaskItem from "../TaskItem"
import Category from "../Category"
import CategoryTasks from "../CategoryTasks"
import { AppContext } from "../AppContext"

export default function TaskBoard({ date, tasks, categories, loading }) {
    const [taskValue, setTaskValue] = useState('')
    const [categoryValue, setCategoryValue] = useState('')
    const [tasksArray, setTasksArray] = useState([])
    const [categoriesArray, setCategoriesArray] = useState([])
    const [operatedTask, setOperatedTask] = useState('')
    // const [section, setSection] = useState('')
    const [category, setCategory] = useState('')
    const [chosenCategoryId, setChosenCategoryId] = useState('')
    const [chooseColor, setChooseColor] = useState(false)
    const [categoryColor, setCategoryColor] = useState('black')
    const [currentColor, setCurrentColor] = useState('')
    const { section } = useContext(AppContext)

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

    function wipe() {
        tasksArray.forEach(item => {
            const taskElement = document.getElementById(item.id)
            taskElement.classList.add('deleting')

            setTimeout(() => {
                deleteDoc(doc(database, 'users', userID, 'tasks', date, 'tasks', item.id))
            }, 500)

            setTimeout(() => {
                taskElement.classList.remove('deleting')
            }, 500)
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
                    <button onClick={wipe} className="taskboard__wipe">Очистить</button>
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
                        {loading ? <div style={{display: 'flex', justifyContent: 'center'}}><svg style={{position: 'initial', marginTop: '15px'}} className="sandclock" xmlns="http://www.w3.org/2000/svg" fill="black" width="40" height="40" viewBox="0 0 24 24"><path d="M18.513 7.119c.958-1.143 1.487-2.577 1.487-4.036v-3.083h-16v3.083c0 1.459.528 2.892 1.487 4.035l3.086 3.68c.567.677.571 1.625.009 2.306l-3.13 3.794c-.936 1.136-1.452 2.555-1.452 3.995v3.107h16v-3.107c0-1.44-.517-2.858-1.453-3.994l-3.13-3.794c-.562-.681-.558-1.629.009-2.306l3.087-3.68zm-4.639 7.257l3.13 3.794c.652.792.996 1.726.996 2.83h-12c0-1.104.343-2.039.996-2.829l3.129-3.793c1.167-1.414 1.159-3.459-.019-4.864l-3.086-3.681c-.66-.785-1.02-1.736-1.02-2.834h12c0 1.101-.363 2.05-1.02 2.834l-3.087 3.68c-1.177 1.405-1.185 3.451-.019 4.863z"/></svg></div> :
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
                        }
                        
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