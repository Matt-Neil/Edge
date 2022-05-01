import React, {createContext, useEffect, useState} from 'react'
import authAPI from "../API/auth"

export const CurrentUserContext = createContext()

const CurrentUserContextProvider = (props) => {
    // Intiialises the currently signed in user as not loaded yet
    const [currentUser, setCurrentUser] = useState({loaded: false});

    //Whenever a component is rendered this useEffect hook is executed once
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetches the currently signed in user in the Express JS server
                const response = await authAPI.get(`/`);

                // Checks if there is a signed in user on the ExpressJS server
                if (response.data.data) {
                    // Sets the currently signed in user to the response
                    setCurrentUser({
                        id: response.data.data._id,
                        name: response.data.data.name,
                        email: response.data.data.email,
                        password: response.data.data.password,
                        loaded: true,
                        empty: false
                    })
                } else {
                    // Sets the current user to empty
                    setCurrentUser({
                        loaded: true,
                        empty: true
                    })
                }
            } catch (err) {}
        }
        fetchData();
    }, [])

    // Function that changes the currently signed-in user's information
    const changeCurrentUser = (user) => {
        setCurrentUser(user);
    }
    
    return (
        <CurrentUserContext.Provider value={{currentUser, changeCurrentUser}}>
            {props.children}
        </CurrentUserContext.Provider>
    )
}

export default CurrentUserContextProvider