
function Icon(props) {
    const icon = props.icon;
    if (!icon) return <span>-</span>
    return (<img src={icon} />)
}

export default Icon;
