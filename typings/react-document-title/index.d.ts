import {Component} from 'react';

export = DocumentTitle;

declare namespace DocumentTitle {
    interface IDocumentTitleProps {
        title: string;
    }
}

declare class DocumentTitle extends Component<DocumentTitle.IDocumentTitleProps> {
}
