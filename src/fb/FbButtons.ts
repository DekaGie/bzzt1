interface FbButton {

  text: string
}

interface FbPostbackButton extends FbButton {

  postback: string
}

interface FbCallButton extends FbButton {

  phoneNumber: string
}

// eslint-disable-next-line import/prefer-default-export
export { FbPostbackButton, FbCallButton }
