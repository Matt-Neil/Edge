import React, {useState, useContext} from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import "./Styles/app.css";

import { CurrentUserContext } from './Contexts/currentUserContext';
import { OpenItemsContext } from './Contexts/openItemsContext';
import ViewItems from "./Pages/View-Items"
import Home from "./Pages/Home"
import Account from "./Pages/Account"
import Workspace from "./Pages/Workspace"
import Dataset from "./Pages/Dataset"
import Search from "./Pages/Search"
import SignIn from "./Pages/Sign-In"
import Header from "./Components/Header"

export default function App() {
    // Local state containing the entered search phrase
    const [searchPhrase, setSearchPhrase] = useState(null);
    // Gaining access to current user information from the context provider
    const {currentUser} = useContext(CurrentUserContext);
    // Gaining access to the open items state from the context provider
    const {openItems} = useContext(OpenItemsContext);

    // Redirects page to sign-in page route if no user is signed-in or to the home page if there is
    const redirectPage = () => {
        if (currentUser.loaded) {
            if (currentUser.empty) {
                return <Redirect to={"/sign-in"} />
            } else {
                return <Redirect to={`/home`} />
            }
        }
    }

    // Renders sign-in page if no user is signed-in or to the home page if there is
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
                {/* The "/" route doesn't exist so if a user navigates to it, they are redirected */}
                <Route exact path="/">
                    {redirectPage()}
                </Route>
                {/* If a logged in user navigates to the sign in page, they are redirected to the home page */}
                <Route exact path="/sign-in">
                    {redirectSignin()}
                </Route>
                {/* Checks if a user has been fetched within the context provider */}
                {currentUser.loaded &&
                    <>
                        {/* If no user is currently signed in, the sign in page is rendered */}
                        {currentUser.empty ?
                            <Redirect to={"/sign-in"} />
                        :
                        // Else the following routes available to signed in users are defined below
                            <>
                                <div className="whole-body">
                                        <Header openItems={openItems} />
                                    <Route exact path="/home">
                                        <Home setSearchPhrase={setSearchPhrase} 
                                            currentUser={currentUser} />
                                    </Route>
                                    <Route exact path="/created-workspaces">
                                        <ViewItems type={"created-workspaces"} />
                                    </Route>
                                    <Route exact path="/created-datasets">
                                        <ViewItems type={"created-datasets"} />
                                    </Route>
                                    <Route exact path="/bookmarked">
                                        <ViewItems type={"bookmarks"} currentUser={currentUser} />
                                    </Route>
                                    <Route exact path="/public-workspaces">
                                        <ViewItems type={"public-workspaces"} currentUser={currentUser} setSearchPhrase={setSearchPhrase} />
                                    </Route>
                                    <Route exact path="/public-datasets">
                                        <ViewItems type={"public-datasets"} currentUser={currentUser} setSearchPhrase={setSearchPhrase} />
                                    </Route>
                                    <Route path="/search-results/:id" render={(props) => <Search currentUser={currentUser} searchPhrase={searchPhrase} setSearchPhrase={setSearchPhrase} key={props.location.key} />} />
                                    <Route exact path="/workspace/:id" render={(props) => <Workspace currentUser={currentUser} type={"view"} key={props.location.key} />} />
                                    <Route exact path="/dataset/:id" render={(props) => <Dataset currentUser={currentUser} type={"view"} key={props.location.key} />} />
                                    <Route exact path="/create-workspace" render={(props) => <Workspace currentUser={currentUser} type={"create"} key={props.location.key} />} />
                                    <Route exact path="/create-dataset" render={(props) => <Dataset currentUser={currentUser} type={"create"} key={props.location.key} />} />
                                    <Route exact path="/account">
                                        <Account setSearchPhrase={setSearchPhrase} />
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