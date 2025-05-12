import "./App.css";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert"
import Header from "./Components/Header";
import UserList from "./Components/UserList"
import Leaderboards from "./Components/Leaderboards";
import Tracker from "./Components/Tracker";
import Home from "./Components/Home"
import React from "react";
import { Redirect, Route, Routes } from "react-router-dom";

class App extends React.Component {
  render() {
    return (
      <>
        <Header />
        <Container fluid>
          <Routes>
            <Route path="/users" element={<UserList></UserList>} />
            <Route path="/leaderboards" element={<Leaderboards></Leaderboards>} />
            <Route path="/avatars" element={<Tracker mode="avatars"></Tracker>} />
            <Route path="/achievements" element={<Tracker mode="achievements"></Tracker>} />
            <Route path="/" element={<Home></Home>} />
          </Routes>
        </Container>
      </>
    );
  }
}

export default App;
