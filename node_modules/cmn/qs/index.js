import { encode } from 'qs/lib/utils'
import { formatters } from 'qs/lib/formats'

export function toRFC3986(str) {
	return formatters['RFC3986'](encode(str));
}