import React from 'react';

export interface IButtonProps {
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

const ScrollToBottomButton = ({onClick}: IButtonProps) =>
    <div className="scrollToBottomButton" onClick={onClick}>
    </div>
;

export default ScrollToBottomButton;
