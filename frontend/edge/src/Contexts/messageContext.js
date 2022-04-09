import React, {createContext, useState, useRef} from 'react'

export const MessageContext = createContext(false)

const MessageContextProvider = (props) => {
    const [displayMessage, setDisplayMessage] = useState(false);
    const messageInterval = useRef(0);

    const displayMessageInterval = () => {
        clearInterval(messageInterval.current)
        setDisplayMessage(true);
        messageInterval.current = setInterval(() => {
            setDisplayMessage(false);
        }, 1500)
        return ()=> {clearInterval(messageInterval.current)};
    }

    return (
        <MessageContext.Provider value={{displayMessage, displayMessageInterval}}>
            {props.children}
        </MessageContext.Provider>
    )
}

export default MessageContextProvider