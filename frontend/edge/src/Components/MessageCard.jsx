import React from 'react'

const MessageCard = ({message}) => {
    return (
        <div className="message-card">
            {/* Displays message passed into component through props */}
            <p>{message}</p>
        </div>
    )
}

export default MessageCard