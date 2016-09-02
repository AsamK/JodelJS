import React, {PureComponent} from "react";
import {connect} from "react-redux";
import {addPost, showAddPost} from "../redux/actions";
import classnames from "classnames";
import ColorPicker from "./ColorPicker";

export class AddPost extends PureComponent {
    constructor(props) {
        super(props);
        const messageDraft = sessionStorage.getItem("messageDraft");
        this.state = {
            message: messageDraft !== null ? messageDraft : "",
            image: null,
            imageUrl: null,
            color: undefined
        };
        this.handleChangeImage = this.handleChangeImage.bind(this);
        this.resetForm = this.resetForm.bind(this);
    }

    static propTypes = {
        ancestor: React.PropTypes.string,
        visible: React.PropTypes.bool,
    };

    handleChangeImage(event) {
        if (this.state.imageUrl !== null) {
            window.URL.revokeObjectURL(this.state.imageUrl);
        }
        if (event.target.files.length === 0) {
            this.setState({image: null, imageUrl: null});
            return;
        }
        this.setState({image: event.target.files[0]});
        if ("URL" in window && "createObjectURL" in window.URL) {
            let url = window.URL.createObjectURL(event.target.files[0]);
            this.setState({imageUrl: url});
        }
    }

    resetForm(form) {
        this.setState({message: "", image: null, imageUrl: null});
        form.reset();
        sessionStorage.removeItem("messageDraft");
    }

    render() {
        const {ancestor, visible, ...forwardProps} = this.props;

        return (
            <div className={classnames("addPost", {visible})}>
                {ancestor === undefined ? "Neuen Jodel schreiben" : "Jodel Kommentar schreiben"}:
                <form onSubmit={e => {
                    e.preventDefault();
                    if (this.state.message.trim() === '' && this.state.image === null) {
                        return
                    }
                    let form = e.target;
                    if (this.state.image !== null) {
                        let fileReader = new FileReader();
                        fileReader.onload = event => {
                            let url = event.target.result;
                            let encodedImage = url.substr(url.indexOf(',') + 1);
                            this.props.dispatch(addPost(this.state.message, encodedImage, ancestor), this.state.color);
                            this.resetForm(form);
                        };
                        fileReader.readAsDataURL(this.state.image);
                    } else {
                        this.props.dispatch(addPost(this.state.message, undefined, ancestor, this.state.color));
                        this.resetForm(form);
                    }
                }}>
                    <textarea maxLength="230" value={this.state.message} onChange={event => {
                        this.setState({message: event.target.value});
                        sessionStorage.setItem("messageDraft", event.target.value);
                    }}/>
                    Noch {230 - this.state.message.length} Zeichen
                    <div className="image">
                        Bild Jodeln:
                        <input type="file" accept="image/*" onChange={this.handleChangeImage}/>
                        {this.state.imageUrl !== null ?
                            <img src={this.state.imageUrl} alt={this.state.image.name}/> : ""}
                    </div>
                    {ancestor === undefined ? <ColorPicker color={this.state.color} onChange={(e) => {
                        this.setState({color: e.target.value});
                    }}/> : ""}
                    <button type="submit">
                        Senden
                    </button>
                    <button onClick={e => {
                        e.preventDefault();
                        this.props.dispatch(showAddPost(false));
                        this.resetForm(e.target.parentNode);
                    }}>
                        Abbrechen
                    </button>
                </form>
            </div>
        )
    }
};

const mapStateToProps = (state) => {
    return {
        ancestor: state.viewState.getIn(["addPost", "ancestor"]),
        visible: state.viewState.getIn(["addPost", "visible"]),
    }
};

AddPost = connect(mapStateToProps)(AddPost);

export default AddPost
