import React, {createContext, useEffect, useState} from 'react'

export const OpenWorkspacesContext = createContext()

const OpenWorkspacesContextProvider = (props) => {
    const [openWorkspaces, setOpenWorkspaces] = useState([]);

    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem('openWorkspaces'));
        
        if (localData !== null) {
            setOpenWorkspaces(localData)
        }
    }, [])

    const addOpenWorkspaces = (id, title) => {
        if (openWorkspaces.filter(workspace => workspace.id.match(id)).length === 0) {
            setOpenWorkspaces([{
                id: id,
                title: title
            }, ...openWorkspaces]);
        }
    }

    const removeOpenWorkspaces = (id) => {
        setOpenWorkspaces(openWorkspaces.filter(workspace => workspace.id !== id))
    }

    useEffect(() => {
        localStorage.setItem('openWorkspaces', JSON.stringify(openWorkspaces));
    }, [openWorkspaces])

    return (
        <OpenWorkspacesContext.Provider value={{openWorkspaces, addOpenWorkspaces, removeOpenWorkspaces}}>
            {props.children}
        </OpenWorkspacesContext.Provider>
    )
}

export default OpenWorkspacesContextProvider