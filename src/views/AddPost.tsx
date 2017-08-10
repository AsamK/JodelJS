import * as classnames from 'classnames';
import * as React from 'react';
import {ChangeEvent, FormEvent, PureComponent} from 'react';
import {connect, Dispatch} from 'react-redux';
import {Color} from '../enums/Color';
import {addPost, switchPostSection} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';
import ColorPicker from './ColorPicker';

export interface AddPostComponentProps {
    ancestor: string
    channel: string
    visible: boolean
    dispatch: Dispatch<IJodelAppStore>
}

export interface AddPostComponentState {
    imageUrl: string | undefined
    message: string
    image: File | undefined
    color: Color | undefined
}

export class AddPostComponent extends PureComponent<AddPostComponentProps, AddPostComponentState> {
    constructor(props: AddPostComponentProps) {
        super(props);
        const messageDraft = sessionStorage.getItem('messageDraft');
        this.state = {
            message: messageDraft !== null ? messageDraft : '',
            image: undefined,
            imageUrl: undefined,
            color: undefined,
        };
        this.handleChangeImage = this.handleChangeImage.bind(this);
        this.resetForm = this.resetForm.bind(this);
    }

    handleChangeImage(event: ChangeEvent<HTMLInputElement>) {
        if (this.state.imageUrl) {
            window.URL.revokeObjectURL(this.state.imageUrl);
        }
        const input: HTMLInputElement = event.target;
        if (!input.files || input.files.length === 0) {
            this.setState({image: undefined, imageUrl: undefined});
            return;
        }
        this.setState({image: input.files[0]});
        if ('URL' in window && 'createObjectURL' in window.URL) {
            let url = window.URL.createObjectURL(input.files[0]);
            this.setState({imageUrl: url});
        }
    }

    resetForm(form: HTMLFormElement) {
        this.setState({message: '', image: undefined, imageUrl: undefined});
        form.reset();
        sessionStorage.removeItem('messageDraft');
    }

    handleAddPost(event: FormEvent<HTMLFormElement>) {
        const {channel, ancestor} = this.props;
        event.preventDefault();
        if (this.state.message.trim() === '' && this.state.image === null) {
            return;
        }
        let encodedImage;
        if (this.state.image) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                const url = fileReader.result;
                encodedImage = url.substr(url.indexOf(',') + 1);

            };
            fileReader.readAsDataURL(this.state.image);
        }
        if (event.target instanceof HTMLFormElement) {
            const form = event.target;
            this.sendAddPost(this.state.message, encodedImage, channel, ancestor, this.state.color, form);
        }
        window.history.back();
    }

    sendAddPost(message: string, encodedImage: string | undefined, channel: string, ancestor: string, color: Color | undefined, form: HTMLFormElement) {
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

        const MAX_POST_CHARS = 230;
        return (
            <div className={classnames('addPost', {visible})}>
                {ancestor === null ?
                    'Neuen Jodel schreiben' + (channel != null ? ' (Kanal: ' + channel + ')' : '')
                    :
                    'Jodel Kommentar schreiben'
                }:
                <form onSubmit={this.handleAddPost.bind(this)}>
                    <textarea maxLength={MAX_POST_CHARS} value={this.state.message} onChange={event => {
                        this.setState({message: event.target.value});
                        sessionStorage.setItem('messageDraft', event.target.value);
                    }}/>
                    Noch {MAX_POST_CHARS - this.state.message.length} Zeichen
                    <div className="image">
                        Bild Jodeln:
                        <input type="file" accept="image/*" onChange={this.handleChangeImage}/>
                        {this.state.imageUrl && this.state.image ?
                            <img src={this.state.imageUrl} alt={this.state.image.name}/> : ''}
                    </div>
                    {ancestor === null ? <ColorPicker color={this.state.color} onChange={e => {
                        this.setState({color: e.target.value});
                    }}/> : ''}
                    <button type="submit">
                        Senden
                    </button>
                    <button onClick={e => {
                        e.preventDefault();
                        window.history.back();
                        this.resetForm((e.target as HTMLElement).parentElement as HTMLFormElement);
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
