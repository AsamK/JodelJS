import React from 'react';
import DocumentTitle from 'react-document-title';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { Store } from 'redux';

import { Jodel } from './Jodel';

const TextComponent = (props: any) => props.children;

interface IAppProps {
    locale: string;
    messages: { [key: string]: string };
    store: Store;
}

export const App = ({ locale, messages, store }: IAppProps) => <IntlProvider
    locale={locale}
    messages={messages}
    textComponent={TextComponent}
>
    <Provider store={store}>
        <DocumentTitle title="Jodel Unofficial WebApp">
            <Jodel />
        </DocumentTitle>
    </Provider>
</IntlProvider>;
