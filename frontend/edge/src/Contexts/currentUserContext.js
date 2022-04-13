import React, {createContext, useEffect, useState} from 'react'
import authAPI from "../API/auth"

export const CurrentUserContext = createContext()

const CurrentUserContextProvider = (props) => {
    const [currentUser, setCurrentUser] = useState({loaded: false});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await authAPI.get(`/`);

                if (response.data.data) {
                    setCurrentUser({
                        id: response.data.data._id,
                        name: response.data.data.name,
                        email: response.data.data.email,
                        password: response.data.data.password,
                        loaded: true,
                        empty: false
                    })
                } else {
                    setCurrentUser({
                        loaded: true,
                        empty: true
                    })
                }
            } catch (err) {}
        }
        fetchData();
    }, [])

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