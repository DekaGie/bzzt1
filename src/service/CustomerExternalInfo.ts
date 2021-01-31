import { Optional } from 'typescript-optional'
import Gender from './Gender'
import ImageUrl from './domain/ImageUrl'
import CustomerId from './domain/CustomerId'

class CustomerExternalInfo {
  readonly id: CustomerId;

  readonly firstName: string;

  readonly lastName: string;

  readonly gender: Gender;

  readonly picture: Optional<ImageUrl>;

  constructor (
    id: CustomerId,
    firstName: string,
    lastName: string,
    gender: Gender,
    picture: Optional<ImageUrl>
  ) {
    this.id = id
    this.firstName = firstName
    this.lastName = lastName
    this.gender = gender
    this.picture = picture
  }

  shorthand (): string {
    return this.firstName === '' ? 'nieznajoma' : this.firstName
  }
}

export default CustomerExternalInfo
