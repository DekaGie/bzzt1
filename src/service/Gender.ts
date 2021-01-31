class Gender {
  private static FEMALE: Gender = new Gender('a')

  private static MALE: Gender = new Gender('y')

  readonly mSuffix: string;

  constructor (mSuffix: string) {
    this.mSuffix = mSuffix
  }

  static discover (firstName: string): Gender {
    return firstName.endsWith('a') ? Gender.FEMALE : Gender.MALE
  }
}

export default Gender
