import React, {useState, useEffect} from 'react'

const ViewData = ({dataTable, start, end}) => {
    const [header, setHeader] = useState([])
    const [data, setData] = useState([])

    useEffect(() => {
        setHeader([])
        setData([])
        
        const tempHeader = dataTable.slice(0, dataTable.indexOf('\n')).split(',')
        tempHeader.unshift("Row")
        const tempData = dataTable.slice(dataTable.indexOf('\n')+1).split('\n');
        setHeader(tempHeader)

        if (tempData.length < end) {
            end = tempData.length
        }

        for (let i=start; i<end; i++) {
            let row = `${i+1},${tempData[i]}`
            setData(previous => [...previous, row.split(',')])
        }
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
        <table className="data-table">
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
