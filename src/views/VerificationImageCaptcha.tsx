import * as React from 'react';
import {Component, MouseEvent} from 'react';

export interface VerificationImageCaptchaProps {
    imageUrl: string;
    imageWidth: number;
    onFinishedClick: (clickedImages: number[]) => void;
}

interface VerificationImageCaptchaState {
    clickedImages: number[];
}

export class VerificationImageCaptcha extends Component<VerificationImageCaptchaProps, VerificationImageCaptchaState> {
    constructor(props: VerificationImageCaptchaProps) {
        super(props);
        this.state = {
            clickedImages: [],
        };
    }

    onImageClick = (e: MouseEvent<HTMLImageElement>) => {
        const {imageWidth} = this.props;

        const actualHeight = (e.target as HTMLElement).offsetHeight;
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
        this.setState({clickedImages});
    };

    render() {
        const {imageUrl, onFinishedClick} = this.props;

        return (
            <div className="verificationImage">
                Wähle alle Bilder mit Waschbär aus, um dein Jodel Konto zu verifizieren:
                <img src={imageUrl} onClick={this.onImageClick}/>
                <div>
                    Gewählte Bilder: {this.state.clickedImages.sort().join(', ')}
                </div>
                <input type="button" value="Verify" onClick={e => {
                    onFinishedClick(this.state.clickedImages);
                    this.setState({clickedImages: []});
                }}/>
            </div>
        );
    }
};