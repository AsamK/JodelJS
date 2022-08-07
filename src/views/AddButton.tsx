import React from 'react';

import './AddButton.scss';

export interface IAddButtonProps {
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

const AddButton = ({ onClick }: IAddButtonProps) => {
    return <div className="add-button" onClick={onClick}></div>;
};

export default AddButton;
