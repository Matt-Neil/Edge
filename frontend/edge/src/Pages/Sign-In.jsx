import React, {useState, useContext} from 'react'
import authAPI from "../API/auth"
import { CurrentUserContext } from '../Contexts/currentUserContext';
import { MessageContext } from '../Contexts/messageContext';
import MessageCard from '../Components/MessageCard'

const SignIn = () => {
    const [signin, setSignin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [createEmail, setCreateEmail] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [createName, setCreateName] = useState("")
    const [message, setMessage] = useState("")
    const {changeCurrentUser} = useContext(CurrentUserContext);
    const {displayMessage, displayMessageInterval} = useContext(MessageContext);

    const signinUser = async (e) => {
        e.preventDefault();

        try {
            const response = await authAPI.post("/signin", 
            {
                email: email,
                password: password
            });

            if (response.data.data && typeof window !== 'undefined') {
                changeCurrentUser({
                    id: response.data.data._id,
                    name: response.data.data.name,
                    email: response.data.data.email,
                    password: response.data.data.password
                })

                window.location = `/home`
            }
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }
    }

    const signupUser = async (e) => {
        e.preventDefault();

        if (createName !== "" || createEmail !== "" || createPassword !== "") {
            try {
                const response = await authAPI.post("/signup", 
                {
                    name: createName,
                    email: createEmail,
                    password: createPassword
                });

                if (response.data.data && typeof window !== 'undefined') {
                    changeCurrentUser({
                        id: response.data.data._id,
                        name: response.data.data.name,
                        email: response.data.data.email,
                        password: response.data.data.password
                    })

                    window.location = `/home`
                }
            } catch (err) {
                setMessage("Error occurred")
                displayMessageInterval()
            }
        } else {
            let error = ""

            if (createName === "") {
                error = "Name is blank"
            }

            if (createEmail === "") {
                if (error === "") {
                    error = error + "Email is blank"
                } else {
                    error = error + " | Email is blank"
                }
            }

            if (createPassword === "") {
                if (error === "") {
                    error = error + "Password is blank"
                } else {
                    error = error + " | Password is blank"
                }
            }

            setMessage(error)
            displayMessageInterval()
        }
    }

    return (
        <>
            {signin ?
                <form className="signin-side" method="POST" onSubmit={signinUser}>
                    <h1>Welcome back</h1>
                    <label>Email Address</label>
                    <input type="text" value={email} onChange={e => {setEmail(e.target.value)}} />
                    <label>Password</label>
                    <input type="password" value={password} onChange={e => {setPassword(e.target.value)}} />
                    <button type="submit"
                            disabled={email === "" || password === ""}>Sign In</button>
                    <div>
                        <p>Don't Have an Account?</p>
                        <span className="signup-button"
                                onClick={() => {setSignin(false)}}
                                type="button">Sign Up</span>
                    </div>
                </form>
            :
                <form className="signin-side" method="POST" onSubmit={signupUser}>
                    <h1>Create an account</h1>
                    <label>Name</label>
                    <input type="text" value={createName} onChange={e => {setCreateName(e.target.value)}} />
                    <label>Email Address</label>
                    <input type="text" value={createEmail} onChange={e => {setCreateEmail(e.target.value)}} />
                    <label>Password</label>
                    <input type="password" value={createPassword} onChange={e => {setCreatePassword(e.target.value)}} />
                    <button type="submit"
                            disabled={createName === "" || createEmail === "" || createPassword === ""}>Create</button>
                    <div>
                        <p>Already Have an Account?</p>
                        <span className="signup-button"
                                onClick={() => {setSignin(true)}}
                                type="button">Sign In</span>
                    </div>
                </form>
            }
            {displayMessage && <MessageCard message={message} />}
        </>
    )
}

export default SignIn
