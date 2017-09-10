import * as React from 'react';
import {MouseEvent} from 'react';

export interface IBackButtonProps {
    onClick: (e: MouseEvent<HTMLElement>) => void;
}

const BackButton = ({onClick}: IBackButtonProps) => {
    return <div className="backButton" onClick={onClick}>Zurück</div>;
};

export default BackButton;
