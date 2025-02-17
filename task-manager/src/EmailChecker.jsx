import { useEffect } from "react";
import { getAuth } from "firebase/auth"
import { useNavigate } from "react-router-dom"

export default function EmailChecker() {
    const navigate = useNavigate()
    const auth = getAuth()

    useEffect(() => {
        const interval = setInterval(async () => {
            const user = auth.currentUser
            if (user) {
                await user.reload()
                if (user.emailVerified) {
                    navigate("/main")
                    clearInterval(interval)
                } 
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [navigate])
}
