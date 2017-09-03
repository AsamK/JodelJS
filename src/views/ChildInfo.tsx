import * as React from 'react';

export interface ChildInfoProps {
    child_count: number;
}

const ChildInfo = ({child_count}: ChildInfoProps) => (
    <div className="childInfo" style={{visibility: child_count > 0 ? null : 'hidden'}}>
        {child_count} Kommentare
    </div>
);

export default ChildInfo;
