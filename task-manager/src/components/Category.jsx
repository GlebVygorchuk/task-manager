import { deleteDoc, doc } from "firebase/firestore"
import { database, auth } from "../firebase"

export default function Category({content, onClick, categoryId, date, color}) {

    const userID = auth.currentUser ? auth.currentUser.uid : null

    function handleDelete(event, id) {
        event.stopPropagation()
        const item = document.getElementById(id)
        item.classList.add('deleting-category')
    
        setTimeout(() => {
            deleteDoc(doc(database, 'users', userID, 'allTasks', date, 'categories', categoryId))
        }, 600)
    
        setTimeout(() => {
            item.classList.remove('deleting-category')
        }, 1000)
    }

    return (
        <div id={categoryId} className="taskboard__category-wrapper">
            <div style={{backgroundColor: color}} onClick={onClick} className="taskboard__category">
                <div className="taskboard__category__content-wrapper" style={color === 'white' ? {color: 'black'} : {color: 'white'}}>
                    {content}
                    <div style={color === 'white' ? {backgroundColor: 'black'} : {backgroundColor: 'white'}} className="taskboard__category__underline"></div>
                </div>
                <div className="taskboard__category__svg-wrapper">
                    <svg onClick={(e) => handleDelete(e, categoryId)} style={color === 'white' ? {boxShadow: 'none', borderRadius: '10px', background: 'transparent', fill: 'black'} : {boxShadow: 'none', borderRadius: '10px', background: 'transparent'}} className="option" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                    </svg>
                </div>
            </div>
        </div>
    )
}