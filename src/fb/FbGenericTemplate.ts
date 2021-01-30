import { FbPostbackButton, FbCallButton } from './FbButtons'

interface TopImage {

  url: string,

  squareRatio?: boolean
}

interface FbGenericTemplate {

  topImage?: TopImage,

  title: string,

  subtitle?: string,

  buttons: Array<FbPostbackButton | FbCallButton>
}

export default FbGenericTemplate
