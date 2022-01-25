import React, {createContext, useEffect, useState} from 'react'

export const OpenItemsContext = createContext()

const OpenItemsContextProvider = (props) => {
    const [openItems, setOpenItems] = useState([]);

    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem('openItems'));
        
        if (localData !== null) {
            setOpenItems(localData)
        }
    }, [])

    const addOpenItems = (id, title, type) => {
        if (openItems.filter(workspace => workspace.id.match(id)).length === 0) {
            setOpenItems([{
                id: id,
                title: title,
                type: type
            }, ...openItems]);
        }
    }

    const removeOpenItems = (id) => {
        setOpenItems(openItems.filter(workspace => workspace.id !== id))
    }

    useEffect(() => {
        localStorage.setItem('openItems', JSON.stringify(openItems));
    }, [openItems])

    return (
        <OpenItemsContext.Provider value={{openItems, addOpenItems, removeOpenItems}}>
            {props.children}
        </OpenItemsContext.Provider>
    )
}

export default OpenItemsContextProvider