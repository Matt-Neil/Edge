import React from 'react'
import { Link } from 'react-router-dom'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HeaderOpenItem from '../Components/Header-Open-Item'

const Header = ({openItems}) => {
    return (
        <div className="header">
            <Link to="/home" className="header-home">
                <img src="http://localhost:3000/home-icon.png" />
            </Link>
            <div className="header-open">
                {openItems.length !== 0 &&
                    <>  
                        {/* Loop through all recently opened items in the context provider */}
                        {openItems.map((item, i) => {
                            // Return tab component
                            return <HeaderOpenItem item={item} key={i} />
                        })}
                    </>
                }
            </div>
            <span />
            <Link to="/account" className="header-account">
                <AccountCircleIcon className="header-account-icon" />
            </Link>
        </div>
    )
}

export default Header