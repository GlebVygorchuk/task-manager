export default function Category({content, onClick}) {
    return (
        <div className="taskboard__category-wrapper">
            <div onClick={onClick} className="taskboard__category">{content}</div>
        </div>
    )
}