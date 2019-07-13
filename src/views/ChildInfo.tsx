import React from 'react';

export interface IChildInfoProps {
    child_count: number;
}

const ChildInfo = ({ child_count }: IChildInfoProps) => (
    <div className="childInfo" style={{ visibility: child_count > 0 ? undefined : 'hidden' }}>
        {child_count} Kommentare
    </div>
);

export default ChildInfo;
