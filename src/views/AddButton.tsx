import React from 'react';

export interface IAddButtonProps {
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

const AddButton = ({onClick}: IAddButtonProps) => {
    return (
        <div className="addButton" onClick={onClick}>
        </div>
    );
};

export default AddButton;
