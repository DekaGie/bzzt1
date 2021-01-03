import axios from 'axios'

class FbMessenger {
  private readonly accessToken: string;

  private readonly userId: string;

  constructor (accessToken: string, userId: string) {
    this.accessToken = accessToken
    this.userId = userId
  }

  send (message: string): Promise<void> {
    return axios.post(
      'https://graph.facebook.com/v9.0/me/messages',
      {
        recipient: {
          id: this.userId
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
            `could not send ${this.userId} "${message}";
              received HTTP ${response.status}: ${response.data}`
          )
        }
      }
    )
  }
}

export default FbMessenger
