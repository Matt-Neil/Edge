import React, {createContext, useState, useRef} from 'react'

export const MessageContext = createContext(false)

const MessageContextProvider = (props) => {
    // Initiates context provider's state to display message as false
    const [displayMessage, setDisplayMessage] = useState(false);
    // Initiates context provider's useRef hook for timer
    const messageInterval = useRef(0);

    // Creates timer to display message
    const displayMessageInterval = () => {
        // Create new interval starting from 0
        clearInterval(messageInterval.current)
        // Sets flag to display message in relevant component to true
        setDisplayMessage(true);
        // Start timer for 1.5 seconds and on completion set flag to display message to false
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