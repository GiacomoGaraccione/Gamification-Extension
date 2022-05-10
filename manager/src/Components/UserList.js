import React from 'react';
import Alert from "react-bootstrap/Alert"
import Table from "react-bootstrap/Table"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Image from "react-bootstrap/Image"
import API from "../API/API"
import utils from '../API/utils';
import Accordion from "react-bootstrap/Accordion"

class UserList extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            users: [],
            selectedUser: null,
            achievements: [],
            avatars: [],
            records: [],
        }
    }

    componentDidMount() {
        API.getUsers().then((users) => {
            this.setState({ users: users })
        })
    }

    createRow = (user) => {
        return (
            <>
                <tr onClick={() => {
                    API.getUserAvatars(user.username).then((avatars) => this.setState({ avatars: avatars }))
                    API.getUserAchievements(user.username).then((achievements) => this.setState({ achievements: achievements }))
                    API.getUserRecords(user.username).then((records) => {
                        let cov = records.highestCoverage.toFixed(2)
                        records.highestCoverage = cov
                        this.setState({ records: records })
                    })
                    this.setState({ selectedUser: user })
                }} style={{ background: this.state.users.some(u => u.username === this.state.selectedUser) && "#FF0000" }}>
                    <td>{user.username}</td>
                    <td><img src={utils.matchAvatar(user.selectedAvatar)} alt="propic" width={"100px"} height={"100px"}></img></td>
                </tr >
            </>
        )
    }

    createAchievementRow = (achievement) => {
        return (
            <>
                <tr>
                    <td>{achievement.text}</td>
                    <td><img src={utils.matchAchievement(achievement.path)} alt="ach" width={"100px"} height={"100px"}></img></td>
                </tr>
            </>
        )
    }

    createAvatarRow = (avatar) => {
        return (
            <>
                <tr>
                    <td>{avatar.name}</td>
                    <td><img src={utils.matchAvatar(avatar.url)} alt="propic" width={"100px"} height={"100px"}></img></td>
                </tr>
            </>
        )
    }

    createRecordTable = (record) => {
        return (
            <>
                <tr>
                    <td>Most New Pages Found in a Session</td>
                    <td>{record.highestNewVisitedPages}</td>
                </tr>
                <tr>
                    <td>Most New Widgets Found in a Session</td>
                    <td>{record.highestNewWidgets}</td>
                </tr>
                <tr>
                    <td>Highest Page Coverage Obtained</td>
                    <td>{record.highestCoverage}</td>
                </tr>
            </>
        )
    }

    render() {
        return (
            <>
                <Row className="align-items-center">
                    <Col>
                        <Table hover={true} bordered size="sm">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Profile Picture</th>
                                </tr>
                            </thead>
                            <tbody>{this.state.users.map((u) => this.createRow(u))}</tbody>
                        </Table>
                    </Col>
                    <Col>
                        {this.state.selectedUser &&
                            <>
                                <Row>
                                    <Col>
                                        <h2>{this.state.selectedUser.username}</h2>
                                    </Col>
                                    <Col>
                                        <Image src={utils.matchAvatar(this.state.selectedUser.selectedAvatar)} alt="propic" width="300px" height="300px" ></Image>
                                    </Col>
                                </Row>
                                <Accordion>
                                    <Accordion.Item eventKey='0'>
                                        <Accordion.Header>Unlocked Achievements</Accordion.Header>
                                        <Accordion.Body>
                                            <Table hover={true} bordered size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>Achievement Name</th>
                                                        <th>Rarity</th>
                                                    </tr>
                                                </thead>
                                                <tbody>{this.state.achievements.map((ac) => this.createAchievementRow(ac))}</tbody>
                                            </Table>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey='1'>
                                        <Accordion.Header>Unlocked Avatars</Accordion.Header>
                                        <Accordion.Body>
                                            <Table hover={true} bordered size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>Avatar Name</th>
                                                        <th>Avatar</th>
                                                    </tr>
                                                </thead>
                                                <tbody>{this.state.avatars.map((av) => this.createAvatarRow(av))}</tbody>
                                            </Table>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey='2'>
                                        <Accordion.Header>Records</Accordion.Header>
                                        <Accordion.Body>
                                            <Table hover={true} bordered size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>Parameter</th>
                                                        <th>Score</th>
                                                    </tr>
                                                </thead>
                                                <tbody>{this.createRecordTable(this.state.records)}</tbody>
                                            </Table>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </>
                        }
                        {!this.state.selectedUser && <Alert variant="success">Click on a User to view their profile</Alert>}
                    </Col>
                </Row>
            </>
        )
    }
}

export default UserList;