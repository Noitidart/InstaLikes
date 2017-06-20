import HmacSHA1 from 'crypto-js/hmac-sha1'
import EncBase64 from 'crypto-js/enc-base64'
import qs from 'qs'

import { alphaSort, genNonce, isObject } from 'cmn/all'
import { toRFC3986 } from 'cmn/qs'

// console.log(encodeURIComponent('app=Floppers&protocol=floppers'));

export const SERVICES = {
    TWITTER: 'TWITTER',
	INSTAGRAM: 'INSTAGRAM'
}

getDetail.cache = (service, key_or_object, value_or_undefined) => getDetail._cache[service] = Object.assign(getDetail._cache[service] || {}, isObject(key_or_object) ? key_or_object : { [key_or_object]:value_or_undefined });
	// getServiceDetail.cache(SERVICES.INSTAGRAM, 'client_id', 'foo');
	// getServiceDetail.cache(SERVICES.INSTAGRAM, { client_id:'foo', redirect_uri:'bar' });
export function getDetail(service, key) {
	/* cache values per service
		twitter
			consumer_key
			consumer_secret
		instagram
			client_id
			redirect_uri

	*/
	const { _cache } = getDetail;
	if (!(service in _cache)) return undefined;
	if (!(key in _cache[service])) return undefined;
    return _cache[service][key];
}
getDetail._cache = {};

export async function getAuthURL(service) {
	// gets the URL to open in a new tab in a browser for the service so the user can signin and click allow
	// refer: https://github.com/Noitidart/NativeShotSupplement/blob/master/MainWorkerSupplement.js#L70

    switch (service) {
        case SERVICES.TWITTER: {
			const oauth_token = await genTwitterToken();
			return `https://api.twitter.com/oauth/authorize?${qs.stringify({ oauth_token })}`;
        }
		case SERVICES.INSTAGRAM:
			return `https://api.instagram.com/oauth/authorize/?client_id=${getDetail(SERVICES.INSTAGRAM, 'client_id')}&redirect_uri=${toRFC3986(getDetail(SERVICES.INSTAGRAM, 'redirect_uri'))}&response_type=token`;
		default:
			throw new Error(`Invalid service of "${service}"`);
    }
}

export function genTwitterRequest(method, url, {
	postdata, // object - serializable
	token_secret, // string - short for oauth_token_secret // i dont offer a cache on this because these can only be used for once api call
	extra_params, // object - short for extra_oauth_params. serializable
	consumer_key=getDetail(SERVICES.TWITTER, 'consumer_key'),
	consumer_secret=getDetail(SERVICES.TWITTER, 'consumer_secret')
}) {
	// last arg is options
	// generate a Request object with proper twitter signature
	// usage: await fetch(genTwitterRequest('get', 'https://...'))

	method = method.toUpperCase(); // TODO: im not sure if i need this and if i do im not sure if i just need it in the signature geneartion part

	const oauth_params = {
		oauth_nonce: genNonce(42),
		oauth_signature_method: 'HMAC-SHA1',
		// oauth_callback: encodeURIComponent(aCallback),
		oauth_timestamp: Math.floor(Date.now() / 1000),
		oauth_consumer_key: consumer_key,
		oauth_version: '1.0'
		// oauth_signature: '???' // added in later after sig is created
	};

	if (token_secret) oauth_params.oauth_token = token_secret;
	if (extra_params) Object.assign(oauth_params, extra_params);

	// for signautre reasons twitter docs say "Sort the list of parameters alphabetically[1] by encoded key[2]." here - https://dev.twitter.com/oauth/overview/creating-signatures
	// create oauth_signature
	{
		const str = method + '&' + toRFC3986(url) + '&' + toRFC3986(qs.stringify({ ...oauth_params, ...(postdata || {}) }, { sort:alphaSort }));
		// console.log('sig str:', str);

		const key = toRFC3986(consumer_secret) + '&' + (token_secret ? toRFC3986(token_secret) : '');
		// console.log('sig key:', key);

		// create sig which is encoded hash using sig_str, and sig_key as base64
		const sig = HmacSHA1(str, key).toString(EncBase64);
		// console.log('sig:', sig);
		oauth_params.oauth_signature = sig;
	}

	// create header_auth
	const header_auth = qs.stringify(oauth_params, { sort:alphaSort }).replace(/&/g, ', ');
	// console.log('header_auth:', header_auth);

	return new Request(url, {
		method,
		headers: {
			Authorization: 'OAuth ' + header_auth
		},
		body: postdata ? qs.stringify(postdata) : undefined
	});

}


export async function genTwitterToken(callback_url=getDetail(SERVICES.TWITTER, 'callback_url')) {
	// gets a single use token (signle use means its only good for one api call (one fetch request))
	const res = await fetch(genTwitterRequest('post', 'https://api.twitter.com/oauth/request_token', {
		extra_params: {
			oauth_callback: callback_url
		}
	}));

	const text = await res.text();
	// 401 - {"errors":[{"code":32,"message":"Could not authenticate you."}]}
	// 200 - oauth_token=0-eGOwAAAAAAWN0mAAABXLhSc6E&oauth_token_secret=9eArtQ8TpI9PtErZ9TcQVJu0zQUzHNHB&oauth_callback_confirmed=true

	// console.log('res:', res, 'text:', text);

	if (res.status !== 200) {
		console.error('failed to get twitter token, errors:', JSON.parse(text));
		throw new Error('Failed to get Twitter token.');
	} else {
		return qs.parse(text).oauth_token;
	}
}