import React, {createContext, useEffect, useState} from 'react'

export const OpenItemsContext = createContext()

const OpenItemsContextProvider = (props) => {
    // Initiates context provider array containing objects of opened items as empty
    const [openItems, setOpenItems] = useState([]);

    // Fetches array of open items from local storage
    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem('openItems'));
        
        // If local storage for attribute openItems exists, the context provider state is set to the array
        if (localData !== null) {
            setOpenItems(localData)
        }
    }, [])

    // Adds item object to array containing its id, title and whether it is a workspace or dataset
    const addOpenItems = (id, title, type) => {
        // Checks if item is already present in the array
        if (openItems.filter(workspace => workspace.id.match(id)).length === 0) {
            setOpenItems([{
                id: id,
                title: title,
                type: type
            }, ...openItems]);
        }
    }

    // Removes item from the array
    const removeOpenItems = (id) => {
        setOpenItems(openItems.filter(workspace => workspace.id !== id))
    }

    // Clear local storage which is called when user is signed out
    const clearItems = () => {
        localStorage.removeItem('openItems')
    }

    // Updates local storage whenever the array is changed
    useEffect(() => {
        localStorage.setItem('openItems', JSON.stringify(openItems));
    }, [openItems])

    return (
        <OpenItemsContext.Provider value={{openItems, addOpenItems, removeOpenItems, clearItems}}>
            {props.children}
        </OpenItemsContext.Provider>
    )
}

export default OpenItemsContextProvider