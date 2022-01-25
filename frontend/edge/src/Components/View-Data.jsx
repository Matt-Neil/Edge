import React, {useState, useEffect} from 'react'

const ViewData = ({dataTable}) => {
    const [header, setHeader] = useState([])
    const [data, setData] = useState([])

    useEffect(() => {
        setHeader([])
        setData([])
        
        const tempHeader = dataTable.slice(0, dataTable.indexOf('\n')).split(',')
        tempHeader.unshift("Row")
        const tempData = dataTable.slice(dataTable.indexOf('\n')+1).split('\n');
        setHeader(tempHeader)

        tempData.map((row, i) => {
            row = `${i},${row}`
            setData(previous => [...previous, row.split(',')])
        })
    }, [dataTable])

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
        <table className="workspace-data-table">
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
