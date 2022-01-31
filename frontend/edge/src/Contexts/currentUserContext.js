import React, {createContext, useEffect, useState} from 'react'
import authAPI from "../API/auth"

export const CurrentUserContext = createContext()

const CurrentUserContextProvider = (props) => {
    const [currentUser, setCurrentUser] = useState({loaded: false});

    useEffect(() => {
        const localData = localStorage.getItem('currentUser');
        
        const fetchData = async () => {
            try {
                const response = await authAPI.get(`/`);

                if ((localData && response.data.data) || (!localData && response.data.data)) {
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

    const removeCurrentUser = () => {
        localStorage.removeItem('currentUser')
    }

    useEffect(() => {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }, [currentUser])

    return (
        <CurrentUserContext.Provider value={{currentUser, changeCurrentUser, removeCurrentUser}}>
            {props.children}
        </CurrentUserContext.Provider>
    )
}

export default CurrentUserContextProvider