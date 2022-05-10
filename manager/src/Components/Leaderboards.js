import React from 'react';
import Alert from "react-bootstrap/Alert"
import Table from "react-bootstrap/Table"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Button from "react-bootstrap/Button"
import Image from "react-bootstrap/Image"
import API from "../API/API"
import utils from '../API/utils';

class Leaderboards extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            mode: "",
            highestNewWidgets: [],
            highestNewPages: [],
            highestCoverage: []
        }
    }

    componentDidMount() {
        API.getHighestWidgetsRecords().then((hw) => this.setState({ highestNewWidgets: hw }))
        API.getHighestPagesRecords().then((hp) => this.setState({ highestNewPages: hp }))
        API.getHighestCoverageRecords().then((hc) => this.setState({ highestCoverage: hc }))
    }

    createTable = (record, mode) => {
        let score = mode === "pages" ? record.highestNewVisitedPages : mode === "widgets" ? record.highestNewWidgets : record.highestCoverage.toFixed(2)
        return (
            <>
                <tr>
                    <td>{record.username}</td>
                    <td>{score}</td>
                    <td><Image src={utils.matchAvatar(record.selectedAvatar)} alt="propic" width={"100px"} height={"100px"}></Image></td>
                </tr>
            </>
        )
    }

    render() {
        return (
            <>
                <Row className='justify-content-md-center'>
                    <Col md="auto">
                        <Button variant="outline-success" onClick={() => this.setState({ mode: "pages" })}>Most New Pages Viewed In a Session</Button>
                    </Col>
                    <Col md="auto">
                        <Button variant="outline-success" onClick={() => this.setState({ mode: "widgets" })}>Most New Widgets Clicked In a Session</Button>
                    </Col>
                    <Col md="auto">
                        <Button variant="outline-success" onClick={() => this.setState({ mode: "coverage" })}>Highest Page Coverage Reached</Button>
                    </Col>
                </Row>
                <Row className='justify-content-md-center'>
                    <Col md="auto">
                        {this.state.mode === "" && <Alert variant="success">Choose a leaderboard using the buttons</Alert>}
                        {this.state.mode === "pages" &&
                            <>
                                <Table hover={true} bordered size="sm">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Score</th>
                                            <th>Avatar</th>
                                        </tr>
                                    </thead>
                                    <tbody>{this.state.highestNewPages.map((rec) => this.createTable(rec, "pages"))}</tbody>
                                </Table>
                            </>}
                        {this.state.mode === "widgets" &&
                            <>
                                <Table hover={true} bordered size="sm">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Score</th>
                                            <th>Avatar</th>
                                        </tr>
                                    </thead>
                                    <tbody>{this.state.highestNewWidgets.map((rec) => this.createTable(rec, "widgets"))}</tbody>
                                </Table>
                            </>}
                        {this.state.mode === "coverage" &&
                            <>
                                <Table hover={true} bordered size="sm">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Score</th>
                                            <th>Avatar</th>
                                        </tr>
                                    </thead>
                                    <tbody>{this.state.highestCoverage.map((rec) => this.createTable(rec, "coverage"))}</tbody>
                                </Table>
                            </>}
                    </Col>
                </Row>
            </>
        )
    }
}

export default Leaderboards