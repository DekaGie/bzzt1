import axios from 'axios'

class FbMessenger {
  private readonly accessToken: string;

  private readonly psid: string;

  constructor (accessToken: string, psid: string) {
    this.accessToken = accessToken
    this.psid = psid
  }

  send (message: string): Promise<void> {
    return axios.post(
      'https://graph.facebook.com/v9.0/me/messages',
      {
        recipient: {
          id: this.psid
        },
        message: {
          text: message
        }
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
            `could not send ${this.psid} "${message}"; received HTTP ${response.status}: ${response.data}`
          )
        }
      }
    )
  }
}

export default FbMessenger
