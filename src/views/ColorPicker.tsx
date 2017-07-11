import * as React from 'react';
import {PureComponent} from 'react';

import Settings from '../app/settings';

export interface ColorPickerProps {
    color: string;
    onChange: any;
}

export default class ColorPicker extends PureComponent<ColorPickerProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const {color, onChange} = this.props;
        const colorNodes = Settings.POST_COLORS.map((c) => {
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
};
