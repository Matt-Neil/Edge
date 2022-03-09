import React, {createContext, useEffect, useState} from 'react'

export const CardFormatContext = createContext(false)

const CardFormatContextProvider = (props) => {
    const [cardFormat, setCardFormat] = useState(false);

    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem('cardFormat'));

        if (localData !== null) {
            setCardFormat(localData);
        }
    }, [])

    const changeCardFormat = () => {
        setCardFormat(state => !state);
    }

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
