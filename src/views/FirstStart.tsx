import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import type { FirebaseTokenResponse } from '../app/mailAuth';
import Settings from '../app/settings';
import type { JodelThunkDispatch } from '../interfaces/JodelThunkAction';
import {
    createNewAccount,
    setUseBrowserLocation,
    updateLocation,
    _setLocation,
} from '../redux/actions';
import { setDeviceUid } from '../redux/actions/api';
import type { IJodelAppStore } from '../redux/reducers';
import { deviceUidSelector, locationSelector } from '../redux/selectors/app';

import { EmailVerification } from './EmailVerification';
import { SelectDeviceUid } from './SelectDeviceUid';
import { SelectLocation } from './SelectLocation';

const FirstStart: React.FC = () => {
    const dispatch = useDispatch<JodelThunkDispatch>();
    const initialDeviceUid = useSelector(deviceUidSelector);
    const location = useSelector(locationSelector);
    const useBrowserLocation = useSelector(
        (state: IJodelAppStore) => state.settings.useBrowserLocation,
    );

    const [deviceUid, setInputDeviceUid] = React.useState(initialDeviceUid);
    const [firebaseToken, setFirebaseToken] = React.useState<FirebaseTokenResponse | null>(null);

    const triggerUpdateLocation = () => {
        dispatch(updateLocation());
    };

    return (
        <div className="firstStart">
            <h1>
                <FormattedMessage
                    id="welcome_title"
                    defaultMessage="Welcome to the unofficial Jodel web app"
                />
            </h1>
            {firebaseToken ? (
                <span>Successfully verified an email address for registration.</span>
            ) : (
                <EmailVerification onToken={setFirebaseToken} />
            )}
            <form
                onSubmit={e => {
                    e.preventDefault();
                    if (!deviceUid) {
                        dispatch(
                            createNewAccount(firebaseToken?.user_id, firebaseToken?.access_token),
                        );
                    } else {
                        dispatch(
                            setDeviceUid(
                                deviceUid,
                                firebaseToken?.user_id,
                                firebaseToken?.access_token,
                            ),
                        );
                    }
                }}
            >
                <h3>
                    <FormattedMessage id="account" defaultMessage="Account" />
                </h3>
                <div className="block">
                    <SelectDeviceUid deviceUid={deviceUid} setDeviceUid={setInputDeviceUid} />
                </div>
                <h3>
                    <FormattedMessage id="location" defaultMessage="Location" />
                </h3>
                <div className="block">
                    <SelectLocation
                        useBrowserLocation={useBrowserLocation}
                        location={location}
                        onChange={(newUseBrowserLocation, newLocation) => {
                            dispatch(setUseBrowserLocation(newUseBrowserLocation));
                            if (!newLocation) {
                                if (newUseBrowserLocation || !Settings.DEFAULT_LOCATION) {
                                    return;
                                }
                                newLocation = {
                                    latitude: Settings.DEFAULT_LOCATION.latitude,
                                    longitude: Settings.DEFAULT_LOCATION.longitude,
                                };
                            }
                            dispatch(_setLocation(newLocation.latitude, newLocation.longitude));
                        }}
                        onLocationRequested={triggerUpdateLocation}
                    />
                    {!location ? (
                        <div className="locationError formError">
                            <div>
                                <FormattedMessage
                                    id="location_error"
                                    defaultMessage={
                                        'The current Location must be known for the first registration.\n' +
                                        'However the location request was unsuccessful.'
                                    }
                                />
                            </div>
                            <a onClick={triggerUpdateLocation}>
                                <FormattedMessage
                                    id="location_error_retry"
                                    defaultMessage="Retry location request"
                                />
                            </a>
                        </div>
                    ) : (
                        ''
                    )}
                </div>
                <button type="submit" disabled={!location}>
                    <FormattedMessage id="jodel_register" defaultMessage="Start Jodeling" />
                </button>
            </form>
        </div>
    );
};

export default FirstStart;
