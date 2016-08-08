import React, {PureComponent} from "react";
import {connect} from "react-redux";
import {addPost, showAddPost} from "../redux/actions";
import classnames from "classnames";

export default class AddPost extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {message: "", image: null, imageUrl: null};
        this.handleChangeImage = this.handleChangeImage.bind(this);
    }

    static propTypes = {
        ancestor: React.PropTypes.string,
        visible: React.PropTypes.bool.isRequired,
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

                    if (this.state.image !== null) {
                        let fileReader = new FileReader();
                        fileReader.onload = event => {
                            let url = event.target.result;
                            let encodedImage = url.substr(url.indexOf(',') + 1);
                            this.props.dispatch(addPost(this.state.message, encodedImage, ancestor));
                            this.setState({message: "", image: null, imageUrl: null});
                            event.target.parentNode.reset();
                        };
                        fileReader.readAsDataURL(this.state.image);
                    } else {
                        this.props.dispatch(addPost(this.state.message, undefined, ancestor));
                        this.setState({message: "", image: null, imageUrl: null});
                        e.target.parentNode.reset();
                    }
                }}>
                <textarea value={this.state.message} onChange={event => {
                    this.setState({message: event.target.value});
                }}/>
                    <input type="file" accept="image/*" onChange={this.handleChangeImage}/>
                    {this.state.imageUrl !== null ? <img src={this.state.imageUrl} alt={this.state.image.name}/> : ""}
                    <button type="submit">
                        Senden
                    </button>
                    <button onClick={e => {
                        e.preventDefault();
                        this.props.dispatch(showAddPost(false));
                        this.setState({message: "", image: null, imageUrl: null});
                        e.target.parentNode.reset();
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
        ancestor: state.viewState.addPost.ancestor,
        visible: state.viewState.addPost.visible,
    }
};

AddPost = connect(mapStateToProps)(AddPost);

export default AddPost
