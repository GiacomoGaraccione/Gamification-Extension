import React from 'react';
import Alert from "react-bootstrap/Alert"
import Table from "react-bootstrap/Table"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Button from "react-bootstrap/Button"
import Image from "react-bootstrap/Image"
import API from "../API/API"
import utils from '../API/utils';

class Home extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            params: {
                avatarStyle: "Transparent",
                topType: "LongHairStraight",
                accessoriesType: "Blank",
                hairColor: "BrownDark",
                facialHairType: "Blank",
                clotheType: "ShirtCrewNeck",
                clotheColor: "Blue01",
                eyeType: "Default",
                eyebrowType: "Default",
                mouthType: "Default",
                skinColor: "Light"
            },
            src: ""
        }
    }

    componentDidMount() {
        let src = "https://avataaars.io/?"
        Object.keys(this.state.params).forEach((key) => {
            let str = key + "=" + this.state.params[key] + "&"
            src += str
            console.log(key, this.state.params[key])
        })
        src.slice(0, src.length - 1)
        console.log(src)
        this.setState({ src: src })

    }

    changeShirtColor = () => {
        let src = "https://avataaars.io/?"
        let params = this.state.params
        params.clotheColor = params.clotheColor === "Blue01" ? "Red" : "Blue01"
        Object.keys(params).forEach((key) => {
            let str = key + "=" + this.state.params[key] + "&"
            src += str
            console.log(key, this.state.params[key])
        })
        this.setState({ src: src })
    }

    render() {
        return (
            <>
                <Image src={this.state.src}></Image>
                <Button variant="outline-success" onClick={() => this.changeShirtColor()}>Change Shirt Color</Button>
            </>
        )
    }
}

export default Home