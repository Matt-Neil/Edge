import React from 'react'

const MessageCard = ({message}) => {
    return (
        <div className="message-card">
            <p>{message}</p>
        </div>
    )
}

export default MessageCard