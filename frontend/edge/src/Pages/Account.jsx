import React, {useState, useEffect, useContext} from 'react'
import { Link, useHistory } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import usersAPI from '../API/users'
import authAPI from "../API/auth"
import { CurrentUserContext } from '../Contexts/currentUserContext';
import { OpenItemsContext } from '../Contexts/openItemsContext';
import Shortcut from '../Components/Shortcut';

const Account = ({setSearchPhrase}) => {
    const [user, setUser] = useState();
    const [loaded, setLoaded] = useState(false);
    const [password, setPassword] = useState("")
    const [input, setInput] = useState("");
    const [changed, setChanged] = useState(false)
    const {removeCurrentUser} = useContext(CurrentUserContext);
    const {clearItems} = useContext(OpenItemsContext);
    const history = useHistory()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await usersAPI.get("/");

                setUser(user.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    const searchFunctionKey = (e) => {
        if (e.key === "Enter" && input !== "") {
            setSearchPhrase(input);
            history.push(`/search-results/${input}`);
        }
    }

    const searchFunctionButton = () => {
        if (input !== "") {
            setSearchPhrase(input);
            history.push(`/search-results/${input}`);
        }
    }

    const signout = async () => {
        await authAPI.get("/signout");

        removeCurrentUser();
        clearItems();

        if (typeof window !== 'undefined') {
            window.location = `/sign-in`
        }
    }

    const updateAccount = async () => {
        try {
            await usersAPI.put("/", {password: password})
        } catch (err) {}
    }

    const deleteAccount = async () => {
        try {
            await usersAPI.delete("/")

            signout()
        } catch (err) {}
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
                        <Link className="home-options-link" to="public-datasets">
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
                                    onClick={() => {updateAccount()}}>Save Changes</button>
                            <div>
                                <button className="text-button account-signout" 
                                        onClick={() => {signout()}}>Sign Out</button>
                                <button className="text-button account-delete"
                                        onClick={() => {deleteAccount()}}>Delete Account</button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default Account
