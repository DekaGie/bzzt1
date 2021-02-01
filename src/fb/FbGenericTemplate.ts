import { FbCallButton, FbLinkButton, FbPostbackButton } from './FbButtons'

interface TopImage {

  url: string,

  squareRatio?: boolean
}

interface FbGenericTemplate {

  topImage?: TopImage,

  title: string,

  subtitle?: string,

  buttons: Array<FbPostbackButton | FbLinkButton | FbCallButton>
}

export default FbGenericTemplate
