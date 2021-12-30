import React, {createContext, useEffect, useState} from 'react'

export const OpenProjectsContext = createContext()

const OpenProjectsContextProvider = (props) => {
    const [openProjects, setOpenProjects] = useState([]);

    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem('openProjects'));
        
        if (localData !== null) {
            setOpenProjects(localData)
        }
    }, [])

    const addOpenProjects = (id, title) => {
        if (openProjects.filter(project => project.id.match(id)).length === 0) {
            setOpenProjects([{
                id: id,
                title: title
            }, ...openProjects]);
        }
    }

    const removeOpenProjects = (id) => {
        setOpenProjects(openProjects.filter(project => project.id !== id))
    }

    useEffect(() => {
        localStorage.setItem('openProjects', JSON.stringify(openProjects));
    }, [openProjects])

    return (
        <OpenProjectsContext.Provider value={{openProjects, addOpenProjects, removeOpenProjects}}>
            {props.children}
        </OpenProjectsContext.Provider>
    )
}

export default OpenProjectsContextProvider