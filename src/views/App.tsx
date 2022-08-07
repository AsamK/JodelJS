import React from 'react';
import DocumentTitle from 'react-document-title';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import type { Store } from 'redux';

import { Jodel } from './Jodel';

interface IAppProps {
    locale: string;
    messages: { [key: string]: string };
    store: Store;
}

export const App = ({ locale, messages, store }: IAppProps) => <IntlProvider
    locale={locale}
    messages={messages}
>
    <Provider store={store}>
        <DocumentTitle title="Jodel Unofficial WebApp">
            <Jodel />
        </DocumentTitle>
    </Provider>
</IntlProvider>;
