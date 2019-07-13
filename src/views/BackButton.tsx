import React from 'react';

export interface IBackButtonProps {
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

const BackButton = ({ onClick }: IBackButtonProps) => {
    return <div className="backButton" onClick={onClick}>Zurück</div>;
};

export default BackButton;
