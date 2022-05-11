import React, {useState, useEffect, useContext} from 'react'
import { Link, useHistory } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import usersAPI from '../API/users'
import authAPI from "../API/auth"
import { CurrentUserContext } from '../Contexts/currentUserContext';
import { OpenItemsContext } from '../Contexts/openItemsContext';
import { MessageContext } from '../Contexts/messageContext';
import Shortcut from '../Components/Shortcut';
import MessageCard from '../Components/MessageCard';

const Account = ({setSearchPhrase}) => {
    const [user, setUser] = useState();
    const [loaded, setLoaded] = useState(false);
    const [password, setPassword] = useState("")
    const [input, setInput] = useState("");
    const [changed, setChanged] = useState(false)
    const [message, setMessage] = useState("")
    const {removeCurrentUser} = useContext(CurrentUserContext);
    const {clearItems} = useContext(OpenItemsContext);
    const {displayMessage, displayMessageInterval} = useContext(MessageContext);
    const history = useHistory()

    // Fetches the currently signed-in user information
    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await usersAPI.get("/");

                setUser(user.data.data);
                setLoaded(true);
            } catch (err) {
                setMessage("Error occurred")
                displayMessageInterval()
            }
        }
        fetchData();
    }, [])

    // Searches for user input when enter key is pressed
    const searchFunctionKey = (e) => {
        if (e.key === "Enter" && input !== "") {
            // Sets application local state variable to contain user input
            setSearchPhrase(input);
            // Redirects to search page
            history.push(`/search-results/${input}`);
        }
    }

    // Searches for user input when search button is clicked
    const searchFunctionButton = () => {
        if (input !== "") {
            // Sets application local state variable to contain user input
            setSearchPhrase(input);
            // Redirects to search page
            history.push(`/search-results/${input}`);
        }
    }

    // Signs out user
    const signout = async () => {
        // Creates GET request to sign out user
        await authAPI.get("/signout");

        // Sets context provider to clear all user information
        removeCurrentUser();
        // Removes all opened items in the header
        clearItems();

        // Redirects to the sign-in page
        if (typeof window !== 'undefined') {
            window.location = `/sign-in`
        }
    }

    // Updates user password
    const updateAccount = async () => {
        try {
            if (password !== "") {
                // Creates PUT request to update password with new password in request body
                await usersAPI.put("/", {password: password})

                // Displays confirmation message if successfully updated
                setMessage("Account Updated")
                displayMessageInterval()
            } else {
                // Displays input validation error
                setMessage("Password is blank")
                displayMessageInterval()
            }
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }
    }

    const deleteAccount = async () => {
        try {
            // Creates DELETE request to delete user account
            await usersAPI.delete("/")

            signout()
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }
    }

    return (
        <>
            {loaded &&
                <div className="main-body">
                    <div className="sidebar">
                        <div className="home-search">
                            <input className="home-search-input" 
                                    placeholder="Search"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={searchFunctionKey} />
                            <SearchIcon className="home-search-icon" onClick={e => searchFunctionButton()} />
                        </div>
                        <div className="sidebar-divided" />
                        <Link className="home-options-link" to="/public-workspaces">
                            <p>Public Workspaces</p>
                            <ArrowForwardIosIcon className="home-options-icon" />
                        </Link>
                        <Link className="home-options-link" to="/public-datasets">
                            <p>Public Datasets</p>
                            <ArrowForwardIosIcon className="home-options-icon" />
                        </Link>
                        <div className="sidebar-divided" />
                        <Shortcut type={"workspaces"} />
                        <div className="sidebar-divided" />
                        <Shortcut type={"datasets"} />
                        <div className="sidebar-divided" />
                        <Shortcut type={"bookmarked"} />
                    </div>
                    <div className="inner">
                        <div className="account-information">
                            <h1>Account Settings</h1>
                            <label>Name</label>
                            <p>{user.name}</p>
                            <label>Email Address</label>
                            <p>{user.email}</p>
                            <label>Password</label>
                            <input placeholder="Change Password" 
                                    type="password"
                                    value={password} 
                                    onChange={e => {
                                        setPassword(e.target.value)
                                        setChanged(true)
                                    }} />
                            <button className={"account-save blue-button"}
                                    disabled={password === "" || !changed}
                                    onClick={() => {updateAccount()}}>Update Account</button>
                            <div>
                                <button className="text-button account-signout" 
                                        onClick={() => {signout()}}>Sign Out</button>
                                <button className="text-button account-delete"
                                        onClick={() => {deleteAccount()}}>Delete Account</button>
                            </div>
                        </div>
                        {displayMessage && <MessageCard message={message} />}
                    </div>
                </div>
            }
        </>
    )
}

export default Account
