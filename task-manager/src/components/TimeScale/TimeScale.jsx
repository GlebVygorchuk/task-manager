import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu"
import { useContext } from "react"

const dates = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const Arrow = ({ direction }) => {

    const { scrollPrev, scrollNext } = useContext(VisibilityContext)

    return (
        <button onClick={direction === 'left' ? () => scrollPrev() : () => scrollNext()} className={`arrow ${direction}`}>
            {direction === 'left' ? '<' : '>'}
        </button>
    )
}

const Date = ({ date }) => {
    return (
        <div className="date">
            {date}
        </div>
    )
}

export default function TimeScale() {
    return (
        <div className="time-scale">
            <ScrollMenu transitionDuration={1500} LeftArrow={<Arrow direction={'left'} />} RightArrow={<Arrow direction={'right'} />}>
                {dates.map((current, index) => (
                    <Date itemId={index} key={index} date={current} />
                ))}
            </ScrollMenu>
        </div>
    )
}