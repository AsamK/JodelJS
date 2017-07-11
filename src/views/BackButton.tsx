import * as React from 'react';
import {MouseEvent} from 'react';

export interface BackButtonProps {
    onClick: (e: MouseEvent<HTMLElement>) => void
}

const BackButton = ({onClick}: BackButtonProps) => {
    return <div className="backButton" onClick={onClick}>Zurück</div>;
};

export default BackButton;