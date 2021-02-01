import { Optional } from 'typescript-optional'
import ImageUrl from '../domain/ImageUrl'

interface Button {

  text: string
}

interface CommandButton extends Button {

  command: any
}

interface LinkButton extends Button {

  url: string
}

interface PhoneButton extends Button {

  phoneNumber: string
}

interface OptionsInteraction {

  topImage: Optional<ImageUrl>,

  title: string,

  subtitle: Optional<string>,

  buttons: Array<CommandButton | LinkButton | PhoneButton>
}

export default OptionsInteraction
