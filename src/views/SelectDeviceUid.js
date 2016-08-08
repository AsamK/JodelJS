import React, {PureComponent} from "react";

const CREATE_NEW = "CREATE_NEW";
const USE_EXISTING = "USE_EXISTING";

export default class SelectDeviceUid extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {radioState: CREATE_NEW};
        this.deviceUid = props.deviceUid === undefined ? "" : props.deviceUid;
        this.handleChangeText = this.handleChangeText.bind(this);
        this.handleChangeRadio = this.handleChangeRadio.bind(this);
    }

    static propTypes = {
        deviceUid: React.PropTypes.string,
        setDeviceUid: React.PropTypes.func.isRequired,
    };

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    handleChangeText(event) {
        this.deviceUid = event.target.value;
        this.props.setDeviceUid(event.target.value);
    }

    handleChangeRadio(event) {
        switch (event.target.value) {
            case CREATE_NEW:
                this.props.setDeviceUid(undefined);
                break;
            case USE_EXISTING:
                this.props.setDeviceUid(this.deviceUid);
                break;
        }
        this.setState({radioState: event.target.value});
    }

    render() {
        const {...forwardProps} = this.props;
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
                        <input type="text" value={this.props.deviceUid} onChange={this.handleChangeText}/>
                    </label>
                    : ""}
            </div>
        );
    }
};
