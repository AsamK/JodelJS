import * as React from 'react';
import {MouseEvent} from 'react';

export interface AddButtonProps {
    onClick: (e: MouseEvent<HTMLElement>) => void;
}

const AddButton = ({onClick}: AddButtonProps) => {
    return (
        <div className="addButton" onClick={onClick}>
        </div>
    );
};

export default AddButton;
