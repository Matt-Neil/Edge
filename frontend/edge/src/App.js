import React, {useContext} from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import "./Styles/app.css";

import { CurrentUserContext } from './Contexts/currentUserContext';
import { OpenWorkspacesContext } from './Contexts/openWorkspacesContext';
import ViewWorkspaces from "./Pages/View-Workspaces"
import Home from "./Pages/Home"
import Account from "./Pages/Account"
import NewWorkspace from "./Pages/New-Workspace"
import SelfWorkspace from "./Pages/Self-Workspace"
import OtherWorkspace from "./Pages/Other-Workspace"
import SearchWorkspaces from "./Pages/Search-Workspaces"
import SignIn from "./Pages/Sign-In"
import NewExperiment from "./Pages/New-Experiment"
import Experiment from "./Pages/Experiment"
import NotFound from "./Pages/Not-Found"
import Header from "./Components/Header"

export default function App() {
    const {currentUser} = useContext(CurrentUserContext);
    const {openWorkspaces} = useContext(OpenWorkspacesContext);

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
                                <div className="whole-body">
                                    <Header currentUser={currentUser} openWorkspaces={openWorkspaces} />
                                    <Route exact path="/home">
                                        <Home />
                                    </Route>
                                    <Route exact path="/my-workspaces">
                                        <ViewWorkspaces type={"self"} />
                                    </Route>
                                    <Route exact path="/bookmarked-workspaces">
                                        <ViewWorkspaces type={"bookmark"} />
                                    </Route>
                                    <Route exact path="/popular-workspaces">
                                        <ViewWorkspaces type={"popular"} />
                                    </Route>
                                    <Route exact path="/all-workspaces">
                                        <ViewWorkspaces type={"all"} />
                                    </Route>
                                    <Route exact path="/search-results">
                                        <SearchWorkspaces />
                                    </Route>
                                    <Route exact path="/workspace/:id" render={(props) => <SelfWorkspace currentUser={currentUser} key={props.location.key} />} />
                                    <Route exact path="/new-workspace">
                                        <NewWorkspace currentUser={currentUser} />
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