import React, {useContext} from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import "./Styles/app.css";

import { CurrentUserContext } from './Contexts/currentUserContext';
import { OpenProjectsContext } from './Contexts/openProjectsContext';
import Home from "./Pages/Home"
import Account from "./Pages/Account"
import NewProject from "./Pages/New-Project"
import Project from "./Pages/Project"
import SignIn from "./Pages/Sign-In"
import Header from "./Components/Header"

export default function App() {
    const {currentUser} = useContext(CurrentUserContext);
    const {openProjects} = useContext(OpenProjectsContext);

    const redirectPage = () => {
        if (currentUser.loaded) {
            if (currentUser.empty) {
                return <Redirect to={"/sign-in"} />
            } else {
                return <Redirect to={`/home`} />
            }
        }
    }

    const redirectSignin = () => {
        if (currentUser.loaded) {
            if (currentUser.empty) {
                return <SignIn />
            } else {
                return <Redirect to={`/home`} />
            }
        }
    }

    return (
        <Router>
            <Switch>
                <Route exact path="/">
                    {redirectPage()}
                </Route>
                <Route exact path="/sign-in">
                    {redirectSignin()}
                </Route>
                {currentUser.loaded &&
                    <>
                        {currentUser.empty ?
                            <Redirect to={"/sign-in"} />
                        :
                            <>
                                <div className="wholeBody">
                                    <Header currentUser={currentUser} openProjects={openProjects} />
                                    <Route exact path="/home">
                                        <Home />
                                    </Route>
                                    <Route exact path="/project/:id" render={(props) => <Project currentUser={currentUser} key={props.location.key} />} />
                                    <Route exact path="/new-project">
                                        <NewProject />
                                    </Route>
                                    <Route exact path="/account">
                                        <Account currentUser={currentUser} />
                                    </Route>
                                </div>
                            </>
                        }
                    </>
                }
            </Switch>
        </Router>
    );
}