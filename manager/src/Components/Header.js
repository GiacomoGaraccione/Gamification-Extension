import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { NavLink } from 'react-router-dom';

const Header = () => {
    return(
        <Navbar bg="info" variant="dark" expand="md" className='col-12'>
            <Navbar.Brand as={NavLink} to="/">Gamification Extension Manager</Navbar.Brand>
            <Nav className='mr-auto'>
                <Nav.Link as={NavLink} to="/users">Users</Nav.Link>
                <Nav.Link as={NavLink} to="/leaderboards">Leaderboards</Nav.Link>
                <Nav.Link as={NavLink} to="/achievements">Achievements</Nav.Link>
                <Nav.Link as={NavLink} to="/avatars">Avatars</Nav.Link>
            </Nav>
        </Navbar>
    )
}

export default Header