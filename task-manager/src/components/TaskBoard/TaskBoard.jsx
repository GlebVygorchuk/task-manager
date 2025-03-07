import { useState } from "react"
import { database, auth } from "../../firebase"
import { collection, addDoc } from "firebase/firestore"
import { useEffect } from "react"
import { doc, deleteDoc} from 'firebase/firestore'

export default function TaskBoard({ date, tasks }) {
    const [taskValue, setTaskValue] = useState('')
    const [tasksArray, setTasksArray] = useState([])

    const userID = auth.currentUser ? auth.currentUser.uid : null

    async function addTask() {
        setTaskValue('')
        try {
            const docRef = await addDoc(collection(database, 'users', userID, 'tasks', `${date}`, 'tasks'), {
                task: taskValue
            })
        } catch(error) {
            console.error(error.message)
        }
    }

    function handleEnterPress(e) {
        if (e.key === 'Enter') {
            addTask()
        }
    }

    async function deleteTask(id) {
        await deleteDoc(doc(database, 'users', userID, 'tasks', `${date}`, 'tasks', `${id}`))
    }

    useEffect(() => {
        setTasksArray(tasks)
    }, [tasks])

    return (
        <div className="taskboard">
            <div className="taskboard__header">
                <input 
                onInput={(e) => setTaskValue(e.target.value)}
                onKeyDown={taskValue !== '' ? handleEnterPress : null} 
                value={taskValue} 
                type="text" 
                className="taskboard__write-task" 
                placeholder="Новая задача"/>
                <button 
                type="submit"
                disabled={taskValue === ''}
                onClick={addTask} 
                className="taskboard__add-task">+</button>
            </div>

            <ul className="taskboard__task-list">
                {Array.isArray(tasksArray) ? (
                    tasksArray.map(task => {
                        return (
                            <li className="taskboard__task">
                            {task.task}
                            <button onClick={() => deleteTask(task.id)} className="taskboard__task_delete">-</button>
                            </li>
                        )
                    })
                ) : null}
            </ul>
        </div>
    )
}