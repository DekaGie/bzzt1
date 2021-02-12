import ImageUrl from '../domain/ImageUrl'

class StaticImageUrls {
  static readonly HORIZONTAL_LOGO: ImageUrl = new ImageUrl(
    'https://u.teknik.io/ut513.jpg'
  );

  static readonly ACCEPTED_SIGN: ImageUrl = new ImageUrl(
    'https://u.teknik.io/dYqOE.jpeg'
  );

  static readonly POWER_BANNER: ImageUrl = new ImageUrl(
    'https://cdn.moment.pl/gallery_items/208627/image_1000_1000/IMG_3642.jpg'
  );

  static readonly GINGER_BANNER: ImageUrl = new ImageUrl(
    'https://u.teknik.io/M0LCp.jpeg'
  );

  static readonly BROWS: ImageUrl = new ImageUrl(
    'https://broadwaybeauty.pl/wp-content/uploads/2019/10/instabrows-1.jpg'
  )

  static readonly LASHES: ImageUrl = new ImageUrl(
    'https://img.grouponcdn.com/deal/3aSRuxWJB9GhHxQxMcxpro/166244192-1500x900/v1/c700x420.jpg'
  )

  static readonly WELCOME: ImageUrl = new ImageUrl(
    // eslint-disable-next-line max-len
    'https://www.napisyweselne.pl/wp-content/uploads/2018/05/napis-na-wesele-WITAMY-witamy-witamy-gosci-weselnych-witacz-na-wesele-dekoracje-na-wesele-udekorowac-sale-weselna-napisy-na-wesele-napisy-slubne-1.jpg'
  )
}

export default StaticImageUrls
