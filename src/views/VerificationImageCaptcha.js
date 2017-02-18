'use strict';

import React, {Component} from "react";

export default class VerificationImageCaptcha extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickedImages: [],
        };
    }

    static propTypes = {
        imageUrl: React.PropTypes.string.isRequired,
        imageWidth: React.PropTypes.number.isRequired,
        onFinishedClick: React.PropTypes.func.isRequired,
    };

    onImageClick = (e) => {
        const {imageWidth} = this.props;

        const actualHeight = e.target.height;
        // This assumes the individual images are squares
        const scaleFactor = imageWidth / actualHeight;
        const imgIndex = Math.floor(scaleFactor * e.nativeEvent.offsetX / imageWidth);

        // Remove or add the clicked image
        let clickedImages = this.state.clickedImages;
        let i = clickedImages.indexOf(imgIndex);
        if (i > -1) {
            clickedImages.splice(i, 1);
        } else {
            clickedImages.push(imgIndex);
        }

        // Update state
        this.setState({clickedImages})
    };

    render() {
        const {imageUrl, onFinishedClick} = this.props;

        return (
            <div className="verificationImage">
                Wähle alle Bilder mit Waschbär aus, um dein Jodel Konto zu verifizieren:
                <img src={imageUrl} onClick={this.onImageClick}/>
                <div>
                    Gewählte Bilder: {this.state.clickedImages.sort().join(", ")}
                </div>
                <input type="button" value="Verify" onClick={e => {
                    onFinishedClick(this.state.clickedImages);
                    this.state.clickedImages = [];
                }}/>
            </div>
        );
    }
};