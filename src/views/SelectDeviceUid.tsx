import * as React from 'react';
import {ChangeEvent, PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';

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
                    <FormattedMessage
                        id="device_uid_new"
                        defaultMessage="Create new Jodel account"
                    />
                </label>
                <label>
                    <input type="radio" value={USE_EXISTING} checked={this.state.radioState === USE_EXISTING}
                           onChange={this.handleChangeRadio}/>
                    <FormattedMessage
                        id="device_uid_use_existing"
                        defaultMessage="Use existing Jodel account"
                    />
                </label>
                {this.state.radioState === USE_EXISTING ?
                    <label>
                        <FormattedMessage
                            id="device_uid_existing"
                            defaultMessage="Device UID of the existing account"
                        />:
                        <input type="text" value={this.state.deviceUid} onChange={this.handleChangeText}/>
                        {!this.state.deviceUid || this.state.deviceUid.length === 64 ? null :
                            <span className="formError">
                                <FormattedMessage
                                    id="device_uid_invalid"
                                    defaultMessage="The device UID should consist of exactly 64 hexadecimal digits."
                                />
                            </span>
                        }
                    </label>
                    : ''}
            </div>
        );
    }
}
