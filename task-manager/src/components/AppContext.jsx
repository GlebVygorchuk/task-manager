import { createContext } from "react";
import { useState } from "react";

export const AppContext = createContext()

export default function AppProvider({ children }) {
    const [selectedDate, setSelectedDate] = useState(null)
    const [tasks, setTasks] = useState([])
    const [section, setSection] = useState('')
    
    return (
        <AppContext.Provider value={{ selectedDate, tasks, section, setSelectedDate, setTasks, setSection }}>
            {children}
        </AppContext.Provider>
    )
}