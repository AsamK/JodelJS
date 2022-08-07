import React from 'react';

export = DocumentTitle;

declare namespace DocumentTitle {
    interface IDocumentTitleProps extends React.PropsWithChildren {
        title: string;
    }
}

declare class DocumentTitle extends React.Component<DocumentTitle.IDocumentTitleProps> {
}
