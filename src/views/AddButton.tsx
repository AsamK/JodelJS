import * as React from 'react';
import {MouseEvent} from 'react';

export interface IAddButtonProps {
    onClick: (e: MouseEvent<HTMLElement>) => void;
}

const AddButton = ({onClick}: IAddButtonProps) => {
    return (
        <div className="addButton" onClick={onClick}>
        </div>
    );
};

export default AddButton;
