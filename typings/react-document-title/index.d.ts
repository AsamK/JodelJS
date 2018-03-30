import React from 'react';

export = DocumentTitle;

declare namespace DocumentTitle {
    interface IDocumentTitleProps {
        title: string;
    }
}

declare class DocumentTitle extends React.Component<DocumentTitle.IDocumentTitleProps> {
}
