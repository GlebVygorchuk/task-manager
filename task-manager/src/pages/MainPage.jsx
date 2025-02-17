import { getAuth, signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom"
 
export default function MainPage() {
    const auth = getAuth()
    const navigate = useNavigate()

    function logOut() {
        signOut(auth)
        navigate('/')
    }

    return (
        <>
        <h1>MAIN</h1>
        <button onClick={logOut}>Выйти</button>
        </>
    )
}