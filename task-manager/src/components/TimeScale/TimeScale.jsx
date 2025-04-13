import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu"
import { useContext, useState } from "react"
import { AppContext } from "../AppContext"
import { useEffect } from "react"

const Arrow = ({ direction }) => {
    const { scrollPrev, scrollNext } = useContext(VisibilityContext)

    return (
        <button onClick={direction === 'left' ? () => scrollPrev() : () => scrollNext()} className={`arrow ${direction}`}>
            {direction === 'left' ? '<' : '>'}
        </button>
    )
}

const DateItem = ({ date, onClick, className }) => {
    return (
        <div className={className} onClick={onClick}>
            {date}
        </div>
    )
}

export default function TimeScale() {
    const [active, setActive] = useState('')
    const [dates, setDates] = useState([])
    const { setSelectedDate, setTasks, setSection, section } = useContext(AppContext)

    const FormattedDate = ({ date }) => {
        const months = [
            'Янв.', 'Фев.', 'Мар.', 'Апр.', 'Мая', 'Июня', 'Июля', 'Авг.', 'Сен.', 'Окт.', 'Ноя.', 'Дек.'
        ]

        return (
            <div className="day-wrapper">
                <p className="day">{date.getDate()}</p>
                <p className="month">{months[date.getMonth()]}</p>
            </div>
        )
    }

    useEffect(() => {
        const currentDate = new Date()
        const generatedDates = []

        for (let i = 0; i < 30; i++)  {
            const current = new Date(currentDate)
            current.setDate(current.getDate() + i)
            const dateItem = {
                id: i + 1, 
                fullDate: current.toLocaleString().slice(0, -10), 
                day: <FormattedDate date={current}/>
            }
            generatedDates.push(dateItem)
            setTasks(prev => ({
                ...prev,
                [dateItem.fullDate]: []
            }))
        }
        setDates(generatedDates)
    }, [])

    useEffect(() => {
        console.log(section)
    }, [section])

    return (
        <div className="time-scale">
            <ScrollMenu 
            transitionDuration={1500} 
            LeftArrow={<Arrow direction={'left'} />} 
            RightArrow={<Arrow direction={'right'} />}>

                {dates.map((current, index) => (
                    <DateItem 
                    itemId={index} 
                    key={index} 
                    date={current.day}
                    className={active === current.id ? 'date chosen' : 'date'} 
                    onClick={() => {
                        setActive(current.id)
                        setSelectedDate(current.fullDate)
                    }} />
                ))}

            </ScrollMenu>
            <div className="section-choose">
                    <button 
                    onClick={() => setSection('tasks')} 
                    className={section === 'tasks' ? "taskboard__select_btn complete" : "taskboard__select_btn"}>
                    Задачи
                    </button>
                    <button 
                    onClick={() => setSection('categories')} 
                    className={section === 'categories' ? "taskboard__select_btn complete" : "taskboard__select_btn"}>
                    Категории
                    </button>
            </div>
        </div>
    )
}