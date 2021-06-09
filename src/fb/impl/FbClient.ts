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
          throw new Error(`received HTTP ${response.status}: ${JSON.stringify(response.data)}`)
        }
      }
    )
  }

  identify (fbAccessToken: string): Promise<object> {
    return axios.get(
      `https://graph.facebook.com/v10.0/me?fields=id,name,email&access_token=${fbAccessToken}`
    ).then(
      (response) => {
        if (response.status !== 200) {
          throw new Error(`received HTTP ${response.status}: ${JSON.stringify(response.data)}`)
        }
        return response.data
      }
    )
  }
}

export default FbClient
