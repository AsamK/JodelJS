import React from 'react';

import Settings from '../app/settings';
import type { Color } from '../enums/Color';

export interface IColorPickerProps {
    color?: Color;
    onChange: (color: Color) => void;
}

export default class ColorPicker extends React.PureComponent<IColorPickerProps> {
    constructor(props: IColorPickerProps) {
        super(props);
    }

    public render(): React.ReactElement | null {
        const { color, onChange } = this.props;
        const colorNodes = Settings.POST_COLORS.map(c => {
            return <label key={c} style={{ backgroundColor: '#' + c }}>
                <input type="radio" value={c} checked={c === color} onChange={() => onChange(c)} />
                #{c}
            </label>;
        });
        return (
            <div className="colorPicker">
                {colorNodes}
            </div>
        );
    }
}
