import HttpServlet from './http/HttpServlet'
import HttpResponse from './http/HttpResponse'

class PrivacyPolicyServlet implements HttpServlet {
  handle (): Promise<HttpResponse> {
    return Promise.resolve(
      {
        code: 200,
        body: 'Aplikacja Beauty ZAZERO nie przetwarza żadnych danych osobowych użytkowników.'
      }
    )
  }
}

export default PrivacyPolicyServlet
