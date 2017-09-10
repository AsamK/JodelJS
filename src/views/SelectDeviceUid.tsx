import * as React from 'react';
import {ChangeEvent, PureComponent} from 'react';

const CREATE_NEW = 'CREATE_NEW';
const USE_EXISTING = 'USE_EXISTING';

export interface ISelectDeviceUidProps {
    deviceUid: string | null;
    setDeviceUid: (deviceUid: string | null) => void;
}

export interface ISelectDeviceUidState {
    deviceUid: string;
    radioState: string;
}

export class SelectDeviceUid extends PureComponent<ISelectDeviceUidProps, ISelectDeviceUidState> {
    constructor(props: ISelectDeviceUidProps) {
        super(props);
        this.state = {
            deviceUid: !props.deviceUid ? '' : props.deviceUid,
            radioState: CREATE_NEW,
        };
        this.handleChangeText = this.handleChangeText.bind(this);
        this.handleChangeRadio = this.handleChangeRadio.bind(this);
    }

    public handleChangeText(event: ChangeEvent<HTMLInputElement>) {
        this.setState({deviceUid: event.target.value});
        this.props.setDeviceUid(event.target.value);
    }

    public handleChangeRadio(event: ChangeEvent<HTMLInputElement>) {
        switch (event.target.value) {
            case CREATE_NEW:
                this.props.setDeviceUid(null);
                break;
            case USE_EXISTING:
                this.props.setDeviceUid(this.state.deviceUid);
                break;
        }
        this.setState({radioState: event.target.value});
    }

    public render() {
        return (
            <div className="selectDeviceUid">
                <label>
                    <input type="radio" value={CREATE_NEW} checked={this.state.radioState === CREATE_NEW}
                           onChange={this.handleChangeRadio}/>
                    Neues Jodel Konto erstellen
                </label>
                <label>
                    <input type="radio" value={USE_EXISTING} checked={this.state.radioState === USE_EXISTING}
                           onChange={this.handleChangeRadio}/>
                    Bestehendes Jodel Konto nutzen
                </label>
                {this.state.radioState === USE_EXISTING ?
                    <label>
                        Device UID des bestehenden Kontos:
                        <input type="text" value={this.state.deviceUid} onChange={this.handleChangeText}/>
                    </label>
                    : ''}
            </div>
        );
    }
}
