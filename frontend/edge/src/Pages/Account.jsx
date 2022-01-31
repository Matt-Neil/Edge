import React, {useState, useEffect, useContext} from 'react'
import usersAPI from '../API/users'
import authAPI from "../API/auth"
import Shortcut from '../Components/Shortcut';
import { CurrentUserContext } from '../Contexts/currentUserContext';
import { OpenItemsContext } from '../Contexts/openItemsContext';

const Account = () => {
    const [user, setUser] = useState();
    const [loaded, setLoaded] = useState(false);
    const [password, setPassword] = useState("")
    const [changed, setChanged] = useState(false)
    const {removeCurrentUser} = useContext(CurrentUserContext);
    const {clearItems} = useContext(OpenItemsContext);

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
                <div className="width-body">
                    <div className="home-left-column">
                        <Shortcut type="workspaces" />
                        <Shortcut type="datasets" />
                        <Shortcut type="bookmarked-workspaces" />
                        <Shortcut type="bookmarked-datasets" />
                    </div>
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
                        <button className="blue-button account-save" 
                                disabled={password === "" || !changed}
                                onClick={() => {updateAccount()}}>Save Changes</button>
                        <button className="grey-button account-signout" 
                                onClick={() => {signout()}}>Sign Out</button>
                        <button className="dark-grey-button account-delete"
                                onClick={() => {deleteAccount()}}>Delete Account</button>
                    </div>
                </div>
            }
        </>
    )
}

export default Account
