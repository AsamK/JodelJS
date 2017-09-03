import * as React from 'react';
import {ChangeEvent, PureComponent} from 'react';

import Settings from '../app/settings';
import {Color} from '../enums/Color';

export interface ColorPickerProps {
    color?: Color;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default class ColorPicker extends PureComponent<ColorPickerProps> {
    constructor(props: ColorPickerProps) {
        super(props);
    }

    public render() {
        const {color, onChange} = this.props;
        const colorNodes = Settings.POST_COLORS.map(c => {
            return <label key={c} style={{backgroundColor: '#' + c}}>
                <input type="radio" value={c} checked={c === color} onChange={onChange}/>
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
