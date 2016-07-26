'use strict';

import React, {Component} from "react";
import emojiLib from "emoji";

export default class Emoji extends Component {
    props = {
        emoji: null
    };

    render() {
        if (!this.props.emoji) {
            return <span/>;
        } else {
            return <span dangerouslySetInnerHTML={{__html: emojiLib.unifiedToHTML(this.props.emoji)}}></span>
        }
    }
}