import React, {useState, useEffect, useContext} from 'react'
import usersAPI from '../API/users'
import authAPI from "../API/auth"
import ViewSelfWorkspaces from '../Components/View-Self-Workspaces';
import { CurrentUserContext } from '../Contexts/currentUserContext';
import { Link, useHistory } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

const Account = ({currentUser}) => {
    const [user, setUser] = useState();
    const [loaded, setLoaded] = useState(false);
    const [password, setPassword] = useState("")
    const {removeCurrentUser} = useContext(CurrentUserContext);
    const history = useHistory();

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
                <div className="width-body">
                    <div className="home-left-column">
                        <ViewSelfWorkspaces bookmarked={false} />
                        <ViewSelfWorkspaces bookmarked={true} />
                    </div>
                    <div className="account-information home-middle-column">
                        <h1>Account Settings</h1>
                        <label>Name</label>
                        <p>{user.name}</p>
                        <label>Username</label>
                        <p>{user.username}</p>
                        <label>Email Address</label>
                        <p>{user.email}</p>
                        <form className="account-form">
                            <label>Password</label>
                            <input placeholder="Change Password" value={password} onChange={e => {setPassword(e.target.value)}} />
                            <button disabled={password === ""}>Save Changes</button>
                        </form>
                        <button onClick={() => {signout()}}>Sign Out</button>
                    </div>
                </div>
            }
        </>
    )
}

export default Account
