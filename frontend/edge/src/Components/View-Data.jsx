import React, {useState, useEffect} from 'react'

const ViewData = ({displayData}) => {
    const [header, setHeader] = useState([])
    const [data, setData] = useState([])

    useEffect(() => {
        setHeader([])
        setData([])
        
        const tempData = displayData.slice(displayData.indexOf('\n')+1).split('\n');
        setHeader(displayData.slice(0, displayData.indexOf('\n')).split(','))

        tempData.map((row) => {
            setData(previous => [...previous, row.split(',')])
        })
    }, [displayData])

    const displayHeader = () => {
        return (
            header.map((item, i) => {
                return <th key={i}>{item}</th>
            })
        )
    }
    
    const displayBody = () => {
        return (
            data.map((row, i) => {
                return (
                    <tr key={i}>
                        {row.map((item, j) => {
                            return <td key={j}>{item}</td>
                        })}
                    </tr>
                )
            })
        )
    }

    return (
        <table className="project-data-table">
            <tbody>
                <tr>
                    {displayHeader()}
                </tr>
                {displayBody()}
            </tbody>
        </table>
    )
}

export default ViewData
