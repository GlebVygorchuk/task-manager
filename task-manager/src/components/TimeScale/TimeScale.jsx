import { ScrollMenu, VisibilityContext} from "react-horizontal-scrolling-menu"
import { useContext, useRef, useState } from "react"
import { AppContext } from "../AppContext"
import { useEffect } from "react"

const Arrow = ({ direction, onClick }) => {
    const { scrollPrev, scrollNext } = useContext(VisibilityContext)

    return (
        <button onClick={direction === 'left' ? () => scrollPrev() : () => scrollNext()} className={`arrow ${direction}`}>
            {direction === 'left' 
            ? <svg style={{alignSelf: 'center'}} width='30px' height='30px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path d="M24 12.001H2.914l5.294-5.295-.707-.707L1 12.501l6.5 6.5.707-.707-5.293-5.293H24v-1z" data-name="Left"/></svg>
            : <svg style={{alignSelf: 'center'}} width='30px' height='30px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path d="m17.5 5.999-.707.707 5.293 5.293H1v1h21.086l-5.294 5.295.707.707L24 12.499l-6.5-6.5z" data-name="Right"/></svg>}
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
                <p style={{fontSize: '25px'}} className="day">{date.getDate()}</p>
                <p style={{fontSize: '12.5px'}} className="month">{months[date.getMonth()]}</p>
            </div>
        )
    }

    useEffect(() => {
        setSelectedDate(dates[0]?.fullDate)
        setActive(dates[0]?.id)
    }, [dates])

    useEffect(() => {
        const currentDate = new Date()
        const generatedDates = []

        for (let i = 0; i < 30; i++)  {
            const current = new Date(currentDate)
            current.setDate(current.getDate() + i)
            const dateItem = {
                id: i + 1, 
                fullDate: current.toISOString().split('T')[0], 
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