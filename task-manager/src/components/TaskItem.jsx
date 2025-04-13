import { useEffect, useState } from "react"
import { database, auth } from "../firebase"
import { updateDoc, doc, deleteDoc } from "firebase/firestore"

export default function TaskItem({ content, className, status, onSelect, operated, itemId, date, section, categoryId, index, style}) {
    const [taskStatus, setTaskStatus] = useState('')
    const [isRedacting, setIsRedacting] = useState(false)
    const [inputValue, setInputValue] = useState(content)
    const [taskContent, setTaskContent] = useState(content)
    const [updating, setUpdating] = useState(false)
    const [optionsState, setOptionsState] = useState('task-options')
    const [daysToComplete, setDaysToComplete] = useState('')
    const [deadlineColor, setDeadlineColor] = useState('rgb(0, 195, 255)')
    const [deadlineDisabled, setDeadlineDisabled] = useState(false)

    const userID = auth.currentUser ? auth.currentUser.uid : null

    useEffect(() => {
        if (status === 'created') {
            setTaskStatus('')
            setDeadlineDisabled(false)
        }
        if (status === 'complete') {
            setTaskStatus('Статус: Выполнено')
            setDeadlineDisabled(true)
        } 
        if (status === 'process') {
            setTaskStatus('Статус: В работе')
            setDeadlineDisabled(false)
        }
    }, [status])

    async function handleDelete(id) {
        const item = document.getElementById(id)
        item.classList.add('deleting')

        setTimeout(() => {
            section === 'tasks'
            ? deleteDoc(doc(database, 'users', userID, 'tasks', date, 'tasks', id))
            : deleteDoc(doc(database, 'users', userID, 'tasks', date, 'categories', categoryId, 'category-tasks', id))
        }, 500)

        setTimeout(() => {
            item.classList.remove('deleting')
        }, 500)
    }

    async function handleStatus(id, status) {
        const docRef = 
        section === 'tasks' 
        ? doc(database, 'users', userID, 'tasks', date, 'tasks', id)
        : doc(database, 'users', userID, 'tasks', date, 'categories', categoryId, 'category-tasks', id)

        try {
            await updateDoc(docRef, {
                status: status
            })
        } 
        catch(error) {
            console.error(error.message)
        }
    }

    async function handleEdit(id) {
        setUpdating(true)
        const docRef = 
        section === 'tasks' 
        ? doc(database, 'users', userID, 'tasks', date, 'tasks', id)
        : doc(database, 'users', userID, 'tasks', date, 'categories', categoryId, 'category-tasks', id)

        try {
            await updateDoc(docRef, {
                task: inputValue,
            })
            setTaskContent(inputValue)
            setIsRedacting(false)
            setUpdating(false)
            onSelect()
        } 
        catch(error) {
            console.error(error.message)
        }
    }

    async function handleStartEdit(id) {
        setIsRedacting(true)
        setOptionsState('task-options')
        const docRef = 
        section === 'tasks' 
        ? doc(database, 'users', userID, 'tasks', date, 'tasks', id)
        : doc(database, 'users', userID, 'tasks', date, 'categories', categoryId, 'category-tasks', id)

        try {
            await updateDoc(docRef, {
                status: 'created'
            })
        } 
        catch(error) {
            console.log(error.message)
        }
    }

    function handleEnterPress(e) {
        if (e.key === 'Enter') {
            handleEdit(itemId)
        }
    }

    function getDifference(deadline) {
        const today = new Date()

        function parseDate(deadline) {
            const [day, month, year] = deadline.split('.').map(Number)
            return new Date(year, month - 1, day)
        }

        const timelimit = parseDate(deadline)
        const daysToComplete = Math.ceil(((((timelimit - today) / 1000) / 60) / 60) / 24)
        
        setDaysToComplete(daysToComplete)
    }

    useEffect(() => {
        if (daysToComplete <= 1) {
            setDeadlineColor('rgb(230, 0, 0)')
        } else if (daysToComplete <= 4) {
            setDeadlineColor('rgb(255, 187, 0)')
        } else {
            setDeadlineColor('rgb(0, 195, 255)')
        }

    }, [daysToComplete])

    useEffect(() => {
        getDifference(date)
    }, [date])

    useEffect(() => {
        operated === itemId ? setOptionsState('task-options show-options') : setOptionsState('task-options')
    }, [operated])

    return (
        <div id={itemId} className="task-wrapper">
        {updating ? <svg className="sandclock" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path d="M18.513 7.119c.958-1.143 1.487-2.577 1.487-4.036v-3.083h-16v3.083c0 1.459.528 2.892 1.487 4.035l3.086 3.68c.567.677.571 1.625.009 2.306l-3.13 3.794c-.936 1.136-1.452 2.555-1.452 3.995v3.107h16v-3.107c0-1.44-.517-2.858-1.453-3.994l-3.13-3.794c-.562-.681-.558-1.629.009-2.306l3.087-3.68zm-4.639 7.257l3.13 3.794c.652.792.996 1.726.996 2.83h-12c0-1.104.343-2.039.996-2.829l3.129-3.793c1.167-1.414 1.159-3.459-.019-4.864l-3.086-3.681c-.66-.785-1.02-1.736-1.02-2.834h12c0 1.101-.363 2.05-1.02 2.834l-3.087 3.68c-1.177 1.405-1.185 3.451-.019 4.863z"/></svg> : null}
        {isRedacting ? 
        <svg onClick={() => handleEdit(itemId)} id="confirm-edit" className="option" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
        </svg> : null}
        <p className="task-index">{index}.</p>
        <div className="content-wrapper">
            <li style={style} className={className}>
                {isRedacting ? <textarea 
                onBlur={() => handleEdit(itemId)} 
                onInput={(e) => setInputValue(e.target.value)}
                onKeyDown={handleEnterPress} 
                value={inputValue} className="edit-task" /> 
                : <div className="item-wrapper">
                    {!deadlineDisabled ? <div style={daysToComplete <= 7 ? {width: `${daysToComplete + 1}0%`, backgroundColor: deadlineColor} : deadlineDisabled ? {background: 'transparent'} : {width: '100%'}} className="deadline-bar"></div> : null}
                    <div className="text-wrapper">
                        <p className={status === 'complete' ? 'cross' : ''}>
                            {taskContent}
                        </p>
                        {status !== 'created' ?                         
                        <p className="task-status">
                            {taskStatus}
                        </p> : null}
                    </div>
                    <div className="button-wrapper">
                        <div style={status === 'complete' ? {border: '1.5px solid transparent'} : null} onClick={() => handleStatus(itemId, 'complete')} className="complete-btn">
                            {status === 'complete' ? 
                            <svg style={{marginTop: '-5px', marginLeft: '-5px'}} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" viewBox="0 0 16 16">
                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                            </svg> : null}
                        </div>
                    </div>
                  </div>}
            </li>
            <svg onClick={isRedacting ? null : onSelect} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#007bff" className="three-dots" viewBox="0 0 16 16">
                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
            </svg>
            <div className={optionsState}>
            <svg onClick={() => handleStatus(itemId, 'complete')} className="option" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
            </svg>
            <button onClick={() => handleStatus(itemId, 'process')} style={{fontSize: '20px', fontWeight: '1000', userSelect: 'none'}} className="option">GO</button>
            <svg onClick={() => handleStartEdit(itemId)} className="option" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
            </svg>
            <svg onClick={() => handleDelete(itemId)} className="option" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
            </svg>
        </div>
        </div>
    </div>
    )
}