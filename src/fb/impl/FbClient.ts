import axios from 'axios'
import FbProfile from '../FbProfile'
import Objects from '../../util/Objects'

class FbClient {
  private readonly accessToken: string;

  constructor (accessToken: string) {
    this.accessToken = accessToken
  }

  getProfile (psid: string): Promise<FbProfile> {
    return axios.get(
      `https://graph.facebook.com/${psid}`,
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
        return {
          firstName: response.data.first_name,
          lastName: response.data.last_name,
          pictureUrl: Objects.define(response.data.profile_pic)
        }
      }
    )
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
}

export default FbClient
