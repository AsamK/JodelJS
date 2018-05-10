import classnames from 'classnames';
import React from 'react';
import {connect} from 'react-redux';

import {Color} from '../enums/Color';
import {JodelThunkDispatch} from '../interfaces/JodelThunkAction';
import {addPost, switchPostSection} from '../redux/actions';
import {IJodelAppStore} from '../redux/reducers';
import {getAddPostChannel} from '../redux/selectors/app';
import {getSelectedPostId} from '../redux/selectors/posts';
import {getAddPostVisible} from '../redux/selectors/view';
import {resizePicture} from '../utils/picture.utils';
import ColorPicker from './ColorPicker';

export interface IAddPostComponentProps {
    ancestor: string;
    channel: string;
    visible: boolean;
    dispatch: JodelThunkDispatch;
}

export interface IAddPostComponentState {
    imageUrl: string | undefined;
    message: string;
    image: File | undefined;
    color: Color | undefined;
}

const MAX_PICTURE_WIDTH = 640;
const MAX_POST_CHARS = 230;

export class AddPostComponent extends React.PureComponent<IAddPostComponentProps, IAddPostComponentState> {
    constructor(props: IAddPostComponentProps) {
        super(props);
        const messageDraft = sessionStorage.getItem('messageDraft');
        this.state = {
            color: undefined,
            image: undefined,
            imageUrl: undefined,
            message: messageDraft !== null ? messageDraft : '',
        };
    }

    public handleChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            const url = window.URL.createObjectURL(input.files[0]);
            this.setState({imageUrl: url});
        }
    }

    public resetForm = (form: HTMLFormElement) => {
        this.setState({message: '', image: undefined, imageUrl: undefined});
        form.reset();
        sessionStorage.removeItem('messageDraft');
    }

    public handleAddPost = (event: React.FormEvent<HTMLFormElement>) => {
        const {channel, ancestor} = this.props;
        event.preventDefault();
        if ((this.state.message.trim() === '' && this.state.image === null) ||
            !(event.target instanceof HTMLFormElement)) {
            return;
        }
        const form = event.target;
        if (this.state.image) {
            resizePicture(this.state.image, MAX_PICTURE_WIDTH)
                .then(dataUrl => {
                    const encodedImage = dataUrl.substr(dataUrl.indexOf(',') + 1);
                    this.sendAddPost(this.state.message, encodedImage, channel, ancestor, this.state.color, form);
                });
        } else {
            this.sendAddPost(this.state.message, undefined, channel, ancestor, this.state.color, form);
        }
        window.history.back();
    }

    public sendAddPost(message: string, encodedImage: string | undefined, channel: string | undefined,
                       ancestor: string | undefined, color: Color | undefined, form: HTMLFormElement) {
        this.props.dispatch(addPost(message, encodedImage, channel, ancestor, color)).then(
            section => {
                this.resetForm(form);
                if (section != null) {
                    this.props.dispatch(switchPostSection(section));
                }
            },
        );
    }

    public render() {
        const {channel, ancestor, visible} = this.props;

        return (
            <div className={classnames('addPost', {visible})}>
                {ancestor === null ?
                    'Neuen Jodel schreiben' + (channel != null ? ' (Kanal: ' + channel + ')' : '')
                    :
                    'Jodel Kommentar schreiben'
                }:
                <form onSubmit={this.handleAddPost}>
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
                    {ancestor === null ? <ColorPicker color={this.state.color} onChange={color => {
                        this.setState({color});
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
    return {
        ancestor: getSelectedPostId(state),
        channel: getAddPostChannel(state),
        visible: getAddPostVisible(state),
    };
};

export const AddPost = connect(mapStateToProps)(AddPostComponent);
