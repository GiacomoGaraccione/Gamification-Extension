import React from 'react';
import Alert from "react-bootstrap/Alert"
import Table from "react-bootstrap/Table"
import ListGroup from "react-bootstrap/ListGroup"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Button from "react-bootstrap/Button"
import Image from "react-bootstrap/Image"
import API from "../API/API"
import utils from '../API/utils';

class Tracker extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            results: []
        }
    }

    componentDidMount() {
        if (this.props.mode === "achievements") {
            API.getAchievements().then((achs) => {
                API.getAchievementsProgress().then((progs) => {
                    API.getUsers().then((users) => {
                        let results = []
                        for (let prog of progs) {
                            function filterId(event) {
                                return event.idAch === prog.idAch
                            }
                            let ach = achs.filter(filterId)[0]
                            let res = {
                                perc: prog.count * 100 / users.length,
                                text: ach.text,
                                path: ach.path
                            }
                            results.push(res)
                        }
                        this.setState({ results: results })
                    })
                })
            })
        } else if (this.props.mode === "avatars") {
            API.getAvatars().then((avs) => {
                API.getAvatarsProgress().then((progs) => {
                    API.getUsers().then((users) => {
                        let results = []
                        for (let prog of progs) {
                            function filterId(event) {
                                return event.idAv === prog.idAv
                            }
                            let av = avs.filter(filterId)[0]

                            let res = {
                                perc: prog.count * 100 / users.length,
                                text: av.name,
                                path: av.url
                            }
                            results.push(res)
                        }
                        this.setState({ results: results })
                    })
                })
            })
        }
    }

    componentDidUpdate() {
        if (this.props.mode === "achievements") {
            API.getAchievements().then((achs) => {
                API.getAchievementsProgress().then((progs) => {
                    API.getUsers().then((users) => {
                        let results = []
                        for (let prog of progs) {
                            function filterId(event) {
                                return event.idAch === prog.idAch
                            }
                            let ach = achs.filter(filterId)[0]
                            let res = {
                                perc: prog.count * 100 / users.length,
                                text: ach.text,
                                path: ach.path
                            }
                            results.push(res)
                        }
                        this.setState({ results: results })
                    })
                })
            })
        } else if (this.props.mode === "avatars") {
            API.getAvatars().then((avs) => {
                API.getAvatarsProgress().then((progs) => {
                    API.getUsers().then((users) => {
                        let results = []
                        for (let prog of progs) {
                            function filterId(event) {
                                return event.idAv === prog.idAv
                            }
                            let av = avs.filter(filterId)[0]

                            let res = {
                                perc: prog.count * 100 / users.length,
                                text: av.name,
                                path: av.url
                            }
                            results.push(res)
                        }
                        this.setState({ results: results })
                    })
                })
            })
        }
    }

    createListItem = (result) => {
        return (
            <ListGroup.Item>
                <Row>
                    <Col>
                        <Image src={utils.matchAchievement(result.path)} alt="ach" width={"100px"} height={"100px"}></Image>
                    </Col>
                    <Col>
                        <h4>{result.text}</h4>
                    </Col>
                    <Col>{result.perc}%</Col>
                </Row>
            </ListGroup.Item>
        )
    }

    createAvatarItem = (result) => {
        return (
            <ListGroup.Item>
                <Row>
                    <Col>
                        <Image src={utils.matchAvatar(result.path)} alt="ach" width={"100px"} height={"100px"}></Image>
                    </Col>
                    <Col>
                        <h4>{result.text}</h4>
                    </Col>
                    <Col>{result.perc}%</Col>
                </Row>
            </ListGroup.Item>
        )
    }

    render() {
        return (
            <>
                <Row className='justify-content-md-center'>
                    <Col md="auto">
                        {this.props.mode === "achievements" && <ListGroup>{this.state.results.map((r) => this.createListItem(r))}</ListGroup>}
                        {this.props.mode === "avatars" && <ListGroup>{this.state.results.map((r) => this.createAvatarItem(r))}</ListGroup>}
                    </Col>
                </Row>
            </>
        )
    }
}

export default Tracker