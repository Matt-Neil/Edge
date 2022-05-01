import React, {createContext, useEffect, useState} from 'react'

export const CardFormatContext = createContext(false)

const CardFormatContextProvider = (props) => {
    // Initiates context provider's card format to square
    const [cardFormat, setCardFormat] = useState(false);

    // Fetches card format state from local storage
    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem('cardFormat'));

        // If local storage for attribute cardFormat exists, the context provider state is set to the state
        if (localData !== null) {
            setCardFormat(localData);
        }
    }, [])

    // Changes card format in context provider
    const changeCardFormat = () => {
        setCardFormat(state => !state);
    }

    // Updates local storage whenever card format is changed
    useEffect(() => {
        localStorage.setItem('cardFormat', cardFormat);
    }, [cardFormat])

    return (
        <CardFormatContext.Provider value={{cardFormat, changeCardFormat}}>
            {props.children}
        </CardFormatContext.Provider>
    )
}

export default CardFormatContextProvider
