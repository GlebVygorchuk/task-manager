import { useEffect, useState, useContext, useRef } from "react"
import { database, auth } from "../firebase"
import { updateDoc, doc, deleteDoc } from "firebase/firestore"
import { AppContext } from "./AppContext"

export default function TaskItem({ content, className, status, onSelect, operated, itemId, date, section, categoryId, index, accentColor}) {
    const [taskStatus, setTaskStatus] = useState('')
    const [isRedacting, setIsRedacting] = useState(false)
    const [inputValue, setInputValue] = useState(content)
    const [taskContent, setTaskContent] = useState(content)
    const [updating, setUpdating] = useState(false)
    const [optionsState, setOptionsState] = useState('task-options')
    const [daysToComplete, setDaysToComplete] = useState('')
    const [deadlineColor, setDeadlineColor] = useState('rgb(0, 195, 255)')
    const [showDeadline, setShowDeadline] = useState(false)
    const [showPhantom, setShowPhantom] = useState(false)
    const [hasTimer, setHasTimer] = useState(false)
    const [updateState, setUpdateState] = useState('created')
    const [time, setTime] = useState(0)
    const [timer, setTimer] = useState(0)
    const [remaining, setRemaining] = useState(0)
    const [taskColor, setTaskColor] = useState('black')
    const [taskTextColor, setTaskTextColor] = useState('black')
    const updateStateRef = useRef(updateState)
    const { deadlineDisabled, operatedTask, setOperatedTask, toggleOptions, startTaskTimer, timers, darkTheme } = useContext(AppContext)

    const userID = auth.currentUser ? auth.currentUser.uid : null


    useEffect(() => {

        if (status === 'created') {
            setTaskStatus('')
            setShowDeadline(true)
        }

        if (status === 'complete') {
            setShowDeadline(false)
            setShowPhantom(true)
        } 

        if (status === 'process') {
            setTaskStatus('В работе')
            setShowDeadline(true)
        }

    }, [status])


    useEffect(() => {
        darkTheme ? setTaskColor('white') : setTaskColor('black')
    }, [darkTheme])


    useEffect(() => {
        updateStateRef.current = updateState
    }, [updateState])


    useEffect(() => {
       const minutes = Math.floor(timers[taskKey]?.remaining / 60)
       
       const seconds = (timers[taskKey]?.remaining % 60) < 10 
       ? '0' + (timers[taskKey]?.remaining % 60) 
       : timers[taskKey]?.remaining % 60

       setRemaining(`- ${minutes}:${seconds}`)
    }, [timers])


    useEffect(() => {
        optionsState === 'task-options'
    })


    useEffect(() => {
        if (daysToComplete <= 1) {
            setDeadlineColor('rgb(230, 0, 0)')
        } else if (daysToComplete <= 3) {
            setDeadlineColor('rgb(255, 187, 0)')
        } else {
            setDeadlineColor('rgb(0, 195, 255)')
        }
    }, [daysToComplete])


    useEffect(() => {
        getDifference(date)
    }, [date, section])


    useEffect(() => {
        setOptionsState(operatedTask === itemId ? 'task-options show-options' : 'task-options')
    }, [operatedTask, itemId])


    useEffect(() => {

        if (darkTheme) {
            if (accentColor === undefined && status === 'complete') {
                setTaskTextColor('black')
            } else {
                setTaskTextColor('white')
            } 
        } 

        if (!darkTheme) {
            if (status !== 'complete') {
                setTaskTextColor('black')
            } else [
                setTaskTextColor('white')
            ]
        }

    }, [darkTheme, status, accentColor, taskColor])


    async function handleDelete(id) {
        const item = document.getElementById(id)
        item.classList.add('deleting')
        
        setTimeout(() => {

            section === 'tasks'
            ? deleteDoc(doc(database, 'users', userID, 'allTasks', date, 'tasks', id))
            : deleteDoc(doc(database, 'users', userID, 'allTasks', date, 'categories', categoryId, 'category-tasks', id))
        
        }, 500)

        setTimeout(() => {
            item.classList.remove('deleting')
        }, 500)
    }


    async function handleStatus(id, state) {
        setOptionsState('task-options')
        setOperatedTask('')

        const docRef = 
        categoryId === undefined 
        ? doc(database, 'users', userID, 'allTasks', date, 'tasks', id)
        : doc(database, 'users', userID, 'allTasks', date, 'categories', categoryId, 'category-tasks', id)

        setUpdateState(state)
        setTimer(0)
        clearInterval(timers[taskKey]?.intervalId)
        setRemaining('')

        if (state === 'complete') {
            setShowPhantom(prev => !prev)
        } else {
            setShowPhantom(false)
        }

        try {

            if (status === state) {
                setUpdateState('created')
                await updateDoc(docRef, {
                    status: 'created'
                })
            } else {
                setUpdateState(state)
                await updateDoc(docRef, {
                    status: state
                })
            }

        } 
        catch(error) {
            console.error(error.message)
        }
    }


    async function handleEdit(id) {
        setUpdating(true)

        const docRef = 
        section === 'tasks' 
        ? doc(database, 'users', userID, 'allTasks', date, 'tasks', id)
        : doc(database, 'users', userID, 'allTasks', date, 'categories', categoryId, 'category-tasks', id)

        try {
            await updateDoc(docRef, {
                task: inputValue,
            })

            setTaskContent(inputValue)
            setIsRedacting(false)
            setUpdating(false)
            setShowPhantom(false)
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
        ? doc(database, 'users', userID, 'allTasks', date, 'tasks', id)
        : doc(database, 'users', userID, 'allTasks', date, 'categories', categoryId, 'category-tasks', id)

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


    async function handleTimer() {
        setHasTimer(false)
        setOptionsState('task-options')
        setOperatedTask('')
        startTaskTimer({
            userID: userID,
            date: date,
            time: time,
            taskId: itemId,
            categoryId: categoryId
        })
    }


    const taskKey = `${categoryId || 'no-category'}-${itemId}`


    function getDifference(deadline) {
        const today = new Date()

        function parseDate(deadline) {
            const [day, month, year] = deadline.split('-').map(Number)
            return new Date(day, month - 1, year)
        }

        const timelimit = parseDate(deadline)
        const daysToComplete = Math.ceil(((((timelimit - today) / 1000) / 60) / 60) / 24)
        
        setDaysToComplete(daysToComplete)
    }


    return (
        <li 
        id={itemId} 
        className="task-wrapper">

        {updating ? 

            <svg 
            className="sandclock" 
            xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                <path d="M18.513 7.119c.958-1.143 1.487-2.577 1.487-4.036v-3.083h-16v3.083c0 1.459.528 2.892 1.487 4.035l3.086 3.68c.567.677.571 1.625.009 2.306l-3.13 3.794c-.936 1.136-1.452 2.555-1.452 3.995v3.107h16v-3.107c0-1.44-.517-2.858-1.453-3.994l-3.13-3.794c-.562-.681-.558-1.629.009-2.306l3.087-3.68zm-4.639 7.257l3.13 3.794c.652.792.996 1.726.996 2.83h-12c0-1.104.343-2.039.996-2.829l3.129-3.793c1.167-1.414 1.159-3.459-.019-4.864l-3.086-3.681c-.66-.785-1.02-1.736-1.02-2.834h12c0 1.101-.363 2.05-1.02 2.834l-3.087 3.68c-1.177 1.405-1.185 3.451-.019 4.863z"/>
            </svg> 

        : null}

        {isRedacting ? 

            <svg 
            onClick={() => handleEdit(itemId)} 
            id="confirm-edit" 
            className="option" 
            xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
            </svg> 

        : null}

            <div className="content-wrapper">

                <p 
                className="task-index">
                    {index}.
                </p>

                {!deadlineDisabled && showDeadline ?

                    <div 
                    style={daysToComplete <= 10 ? {width: `${daysToComplete + 1}0%`, backgroundColor: deadlineColor} : deadlineDisabled ? {background: 'transparent'} : {width: '100%'}} 
                    className="deadline-bar">
                    </div> 

                : null}

                <div 
                style={{backgroundColor: accentColor === undefined ? taskColor : accentColor}} 
                className={showPhantom ? 'phantom fade' : 'phantom'}>
                </div>

                <div 
                style={status === 'complete' ? {backgroundColor: accentColor} : null} 
                className={className}>

                    {isRedacting ? 

                    <textarea 
                    onBlur={() => handleEdit(itemId)} 
                    onInput={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleEnterPress} 
                    value={inputValue} 
                    className="edit-task" /> 

                    : 

                    <div className="item-wrapper">

                    {status === 'process' ? 

                        <div 
                        style={{backgroundColor: accentColor ? accentColor : taskColor}} 
                        className="spinning-border">
                        </div> 

                    : null}

                    <div 
                    style={status === 'complete' ? {backgroundColor: accentColor === undefined ? taskColor : accentColor} : null} 
                    className="inner-content-wrapper">

                        <div className="text-wrapper">

                            <p style={{color: taskTextColor}} className={status === 'complete' ? 'cross' : ''}>
                                {taskContent}
                            </p>

                            {status !== 'created' && status !== 'complete' ? 

                                <p style={{color: accentColor}} className="task-status">
                                    {taskStatus} <span style={{fontWeight: '600'}}>{remaining !== '- NaN:NaN' ? remaining : ''}</span>
                                </p> 

                            : null}
                    </div>

                    <div className="button-wrapper">

                        <div 
                        style={status === 'complete' ? {border: '1.5px solid transparent'} : null} 
                        onClick={() => handleStatus(itemId, 'complete')} 
                        className="complete-btn">

                            {status === 'complete' ? 

                            <svg 
                            style={darkTheme && accentColor === undefined ? {marginTop: '-5px', marginLeft: '-5px', fill: 'black'} : {marginTop: '-5px', marginLeft: '-5px', fill: 'white'}} 
                            xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" viewBox="0 0 16 16">
                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                            </svg> 

                            : null}

                        </div>

                    </div>

                    </div>

                  </div>}

            </div>

            <svg 
            onClick={isRedacting ? null : () => toggleOptions(itemId)} 
            xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#007bff" className="three-dots" viewBox="0 0 16 16">
                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
            </svg>

            <div className={optionsState}>
            {!hasTimer ? 
                <>

                <svg 
                onClick={() => handleStatus(itemId, 'complete')} 
                className="option" 
                xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                </svg>

                <svg 
                onClick={() => handleStatus(itemId, 'process')} 
                className="option" 
                height="35px" width="35px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve" fill="#FFFFFF"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g id="loop_x5F_alt2"> <g> <path d="M19.945,22l6.008-8L32,22h-4v2c0,3.309-2.691,6-6,6H10c-3.309,0-6-2.691-6-6v-2h4v2 c0,1.102,0.898,2,2,2h12c1.102,0,2-0.898,2-2v-2H19.945z"></path> <path d="M12.055,10l-6.008,8L0,10h4V8c0-3.309,2.691-6,6-6h12c3.309,0,6,2.691,6,6v2h-4V8 c0-1.102-0.898-2-2-2H10C8.898,6,8,6.898,8,8v2H12.055z"></path> </g> </g> </g> </g></svg>

                <svg 
                onClick={() => handleStartEdit(itemId)} 
                className="option" 
                xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                </svg>

                <svg 
                onClick={timer === 0 ? () => setHasTimer(true) : () => setHasTimer(false)} 
                className="option" 
                fill="#FFFFFF" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="35px" height="35px" viewBox="0 0 559.98 559.98" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M279.99,0C125.601,0,0,125.601,0,279.99c0,154.39,125.601,279.99,279.99,279.99c154.39,0,279.99-125.601,279.99-279.99 C559.98,125.601,434.38,0,279.99,0z M279.99,498.78c-120.644,0-218.79-98.146-218.79-218.79 c0-120.638,98.146-218.79,218.79-218.79s218.79,98.152,218.79,218.79C498.78,400.634,400.634,498.78,279.99,498.78z"></path> <path d="M304.226,280.326V162.976c0-13.103-10.618-23.721-23.716-23.721c-13.102,0-23.721,10.618-23.721,23.721v124.928 c0,0.373,0.092,0.723,0.11,1.096c-0.312,6.45,1.91,12.999,6.836,17.926l88.343,88.336c9.266,9.266,24.284,9.266,33.543,0 c9.26-9.266,9.266-24.284,0-33.544L304.226,280.326z"></path> </g> </g> </g></svg>

                <svg 
                onClick={() => handleDelete(itemId)} 
                className="option" 
                xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                </svg>

                </> : 

            <div className="timer-menu">

                <input 
                value={time} 
                onInput={(e) => setTime(e.target.value >= 0 ? e.target.value : 0)} 
                type="number" 
                className="set-timer">
                </input>

                <p>мин.</p>

                <svg 
                onClick={handleTimer} 
                style={{marginLeft: '5px'}} 
                className="option" 
                xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                </svg>

            </div>

            }
        </div>

        </div>
        
    </li>
    )
}