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
    const [searchPhrase, setSearchPhrase] = useState(null);
    const {currentUser} = useContext(CurrentUserContext);
    const {openItems} = useContext(OpenItemsContext);

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
                                    <Header openItems={openItems} />
                                    <Route exact path="/home">
                                        <Home setSearchPhrase={setSearchPhrase} currentUser={currentUser} />
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
                                    {/* <Route exact path="/404">
                                        <NotFound />
                                    </Route> */}
                                </div>
                            </>
                        }
                    </>
                }
                {/* <Redirect to="/404" /> */}
            </Switch>
        </Router>
    );
}