import axios from 'axios'

class FbClient {
  private readonly accessToken: string;

  constructor (accessToken: string) {
    this.accessToken = accessToken
  }

  send (psid: string, message: object): Promise<void> {
    return axios.post(
      'https://graph.facebook.com/v9.0/me/messages',
      {
        recipient: {
          id: psid
        },
        message
      },
      {
        params: {
          access_token: this.accessToken
        }
      }
    ).then(
      (response) => {
        if (response.status !== 200) {
          throw new Error(
            `could not send ${psid} "${message}"; received HTTP ${response.status}: ${response.data}`
          )
        }
      }
    )
  }
}

export default FbClient
