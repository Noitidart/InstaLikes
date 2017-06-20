import React, { Component } from 'react';
import { Linking } from 'react-native'
import { isObject, wait } from 'cmn/all'

import { getDetail, genTwitterToken, getAuthURL, SERVICES } from './utils'

export const STATUS = {
    UNINIT: 'UNINIT',
    CALC: 'CALC', // calculating auth url like for twitter
    FAIL: 'FAIL',
    OPEN: 'OPEN', // opening auth page in browser
    OPENED: 'OPENED', // opened auth page in browser, waiting for user
    OK: 'OK' // authrozied succesfully
}

export const FAIL_REASON = {
    DENY: 'DENY'
}
getDetail.cache(SERVICES.INSTAGRAM, {
    client_id: 'b475d7b6428f40caae8b747d09a78b41',
    client_secret: 'cac3817607bf472e8a938f41751676ef',
    redirect_uri: `https://sundayschoolonline.org/auth/InstaLikes/${SERVICES.INSTAGRAM}/instalikes`
});

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

function AuthHOC(WrappedComponent) {
    return class AuthHOCComponent extends Component {
        static displayName = `AuthHOC(${getDisplayName(WrappedComponent)})`
        state = {
            status: STATUS.UNINIT,
            // fail_reason: undefined, // one of FAIL_REASON.*
            fail_step: undefined, // one of STATUS.*
            fail_msg: undefined, // text explaining
            info: undefined // object holding auth details - on success
        }
        open = async () => {
            this.setState(()=>({ status:STATUS.CALC }));
            let url;
            try {
                url = await getAuthURL(SERVICES.INSTAGRAM);
            } catch(ex) {
                this.setState(()=>({ status:STATUS.FAIL, fail_step:STATUS.CALC, fail_msg:'Error while trying to URL for authorization page from service server. Error: ' + ex.message }));
                return;
            }
            this.setState(()=>({ status:STATUS.OPEN }));
            this.handled = false;
            console.log('will openURL');
            Linking.openURL(url);
            console.log('did openURL');
            await wait(1000);
            console.log('will setState');
            if (!this.handled) this.setState(()=>({ status:STATUS.OPENED }));
        }
        handleAuth = e => {
            this.handled = true;
            console.log('in handle auth, e:', e);
            const { url } = e;
            console.log('url:', url);
            // floppers://auth?json
            /* json {
                service: SERVICES.*
                approved: bool,
                ... see crossserver-link18283
            }
            */

            const details = JSON.parse(decodeURIComponent(url.substr(url.indexOf('?') + 1)));
            console.log('service:', details.service, 'details:', details);

            if (details.approved) {
                this.setState(()=>({ status:STATUS.OK, info:details }));
                Linking.removeEventListener('url', this.handleAuth);
            } else if (!details.approved) {
                console.log('user denied access');
                this.setState(()=>({ status:STATUS.FAIL, fail_step:STATUS.OPENED, fail_msg:'You denied permission. You will not be able to use the Instagram features, please authenticate again and allow.' }));
            } else {
                console.log('unknown url received:', url);
                this.setState(()=>({ status:STATUS.FAIL, fail_step:STATUS.OPENED, fail_msg:'Unknown. Please try authenicating again.' }));
            }
        }
        componentDidMount() {
            console.log('MOUNTING!!!');
            Linking.addEventListener('url', this.handleAuth);
        }
        componentWillUnmount() {
            Linking.removeEventListener('url', this.handleAuth);
            console.log('UNMOUNTING!!!!!!');
        }
        render() {
            const auth = {
                start: this.open,
                ...this.state
            };
            return <WrappedComponent {...this.props} auth={auth} />
        }
    }
}

export default AuthHOC;