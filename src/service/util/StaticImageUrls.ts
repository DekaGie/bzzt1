import ImageUrl from '../domain/ImageUrl'

class StaticImageUrls {
  static readonly HORIZONTAL_LOGO: ImageUrl = new ImageUrl(
    'https://u.teknik.io/ut513.jpg'
  );

  static readonly ACCEPTED_SIGN: ImageUrl = new ImageUrl(
    'https://u.teknik.io/dYqOE.jpeg'
  );

  static readonly WELCOME: ImageUrl = new ImageUrl(
    // eslint-disable-next-line max-len
    'https://www.napisyweselne.pl/wp-content/uploads/2018/05/napis-na-wesele-WITAMY-witamy-witamy-gosci-weselnych-witacz-na-wesele-dekoracje-na-wesele-udekorowac-sale-weselna-napisy-na-wesele-napisy-slubne-1.jpg'
  )
}

export default StaticImageUrls
