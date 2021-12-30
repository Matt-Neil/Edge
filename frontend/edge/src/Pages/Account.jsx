import React, {useState, useEffect, useContext} from 'react'
import usersAPI from '../API/users'
import authAPI from "../API/auth"
import { CurrentUserContext } from '../Contexts/currentUserContext';

const Account = ({currentUser}) => {
    const [user, setUser] = useState();
    const [loaded, setLoaded] = useState(false);
    const [password, setPassword] = useState("")
    const {removeCurrentUser} = useContext(CurrentUserContext);

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

        if (typeof window !== 'undefined') {
            window.location = `/sign-in`
        }
    }

    return (
        <>
            {loaded &&
                <div className="account-body">
                    <h1>Account Settings</h1>
                    <label>Username</label>
                    <p>{user.username}</p>
                    <label>Email Address</label>
                    <p>{user.email}</p>
                    <form  className="account-form">
                        <label>Password</label>
                        <input placeholder="Change Password" value={password} onChange={e => {setPassword(e.target.value)}} />
                        <button>Save Changes</button>
                    </form>
                    <button onClick={() => {signout()}}>Sign Out</button>
                </div>
            }
        </>
    )
}

export default Account
