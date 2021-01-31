import Gender from './Gender'
import ImageUrl from './domain/ImageUrl'
import CustomerId from './domain/CustomerId'

class CustomerExternalInfo {
  readonly id: CustomerId;

  readonly firstName: string;

  readonly lastName: string;

  readonly gender: Gender;

  readonly picture: ImageUrl;

  constructor (
    id: CustomerId,
    firstName: string,
    lastName: string,
    gender: Gender,
    picture: ImageUrl
  ) {
    this.id = id
    this.firstName = firstName
    this.lastName = lastName
    this.gender = gender
    this.picture = picture
  }
}

export default CustomerExternalInfo
