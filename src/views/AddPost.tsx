import * as classnames from 'classnames';
import * as React from 'react';
import {PureComponent} from 'react';
import {connect} from 'react-redux';
import {addPost, switchPostSection} from '../redux/actions';
import ColorPicker from './ColorPicker';
import {IJodelAppStore} from '../redux/reducers';

export interface AddPostComponentProps {
    ancestor: string
    channel: string
    visible: boolean
    dispatch: any
}
export interface AddPostComponentState {
    imageUrl: string
    message: string
    image: File
    color: string
}

export class AddPostComponent extends PureComponent<AddPostComponentProps, AddPostComponentState> {
    constructor(props) {
        super(props);
        const messageDraft = sessionStorage.getItem('messageDraft');
        this.state = {
            message: messageDraft !== null ? messageDraft : '',
            image: null,
            imageUrl: null,
            color: undefined,
        };
        this.handleChangeImage = this.handleChangeImage.bind(this);
        this.resetForm = this.resetForm.bind(this);
    }

    handleChangeImage(event) {
        if (this.state.imageUrl !== null) {
            window.URL.revokeObjectURL(this.state.imageUrl);
        }
        if (event.target.files.length === 0) {
            this.setState({image: null, imageUrl: null});
            return;
        }
        this.setState({image: event.target.files[0]});
        if ('URL' in window && 'createObjectURL' in window.URL) {
            let url = window.URL.createObjectURL(event.target.files[0]);
            this.setState({imageUrl: url});
        }
    }

    resetForm(form) {
        this.setState({message: '', image: null, imageUrl: null});
        form.reset();
        sessionStorage.removeItem('messageDraft');
    }

    handleAddPost(event) {
        const {channel, ancestor} = this.props;
        event.preventDefault();
        if (this.state.message.trim() === '' && this.state.image === null) {
            return;
        }
        let encodedImage;
        if (this.state.image !== null) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                const url = fileReader.result;
                encodedImage = url.substr(url.indexOf(',') + 1);

            };
            fileReader.readAsDataURL(this.state.image);
        }
        const form = event.target;
        this.sendAddPost(this.state.message, encodedImage, channel, ancestor, this.state.color, form);
        window.history.back();
    }

    sendAddPost(message, encodedImage, channel, ancestor, color, form) {
        this.props.dispatch(addPost(message, encodedImage, channel, ancestor, color)).then(
            section => {
                this.resetForm(form);
                if (section != null) {
                    this.props.dispatch(switchPostSection(section));
                }
            },
        );
    }

    render() {
        const {channel, ancestor, visible} = this.props;

        return (
            <div className={classnames('addPost', {visible})}>
                {ancestor === null ?
                    'Neuen Jodel schreiben' + (channel != null ? ' (Kanal: ' + channel + ')' : '')
                    :
                    'Jodel Kommentar schreiben'
                }:
                <form onSubmit={this.handleAddPost.bind(this)}>
                    <textarea maxLength={230} value={this.state.message} onChange={event => {
                        this.setState({message: event.target.value});
                        sessionStorage.setItem('messageDraft', event.target.value);
                    }}/>
                    Noch {230 - this.state.message.length} Zeichen
                    <div className="image">
                        Bild Jodeln:
                        <input type="file" accept="image/*" onChange={this.handleChangeImage}/>
                        {this.state.imageUrl !== null ?
                            <img src={this.state.imageUrl} alt={this.state.image.name}/> : ''}
                    </div>
                    {ancestor === null ? <ColorPicker color={this.state.color} onChange={(e) => {
                        this.setState({color: e.target.value});
                    }}/> : ''}
                    <button type="submit">
                        Senden
                    </button>
                    <button onClick={e => {
                        e.preventDefault();
                        window.history.back();
                        this.resetForm((e.target as HTMLElement).parentNode);
                    }}>
                        Abbrechen
                    </button>
                </form>
            </div>
        );
    }
}

const mapStateToProps = (state: IJodelAppStore) => {
    let channel;
    if (state.viewState.selectedPostId == null) {
        let section = state.viewState.postSection;
        if (section != null && section.startsWith('channel:')) {
            channel = section.substring(8);
        }
    }
    return {
        ancestor: state.viewState.selectedPostId,
        channel,
        visible: state.viewState.addPost.visible,
    };
};

export const AddPost = connect(mapStateToProps)(AddPostComponent);
