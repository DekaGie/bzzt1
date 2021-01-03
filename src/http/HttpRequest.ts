import UrlQuery from './UrlQuery'
import RequestBody from './RequestBody'

interface HttpRequest {

  query: UrlQuery,

  body?: RequestBody
}

export default HttpRequest
