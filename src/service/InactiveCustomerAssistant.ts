import { Optional } from 'typescript-optional'
import BarcodeParser from './BarcodeParser'
import CustomerAssistant from './CustomerAssistant'
import StaticImageUrls from './StaticImageUrls'
import CardRegistrator from './CardRegistrator'
import StateCategoryId from './domain/StateCategoryId'
import StateSlot from './StateSlot'
import Reaction from './spi/Reaction'
import Inquiry from './spi/Inquiry'
import CustomerId from './domain/CustomerId'
import TextExtractions from './TextExtractions'
import StateStore from './StateStore'
import Reactions from './spi/Reactions'
import Choices from './spi/Choices'
import StaticTexts from './StaticTexts'
import FreeTextInquiry from './spi/FreeTextInquiry'
import ImageInquiry from './spi/ImageInquiry'
import CardContextInquiry from './CardContextInquiry'

class InactiveCustomerAssistant implements CustomerAssistant<CustomerId> {
  private static readonly ASKED_FOR_ACTIVATE: StateCategoryId =
      new StateCategoryId(InactiveCustomerAssistant.name, 'ASKED_FOR_ACTIVATE');

  private readonly cardRegistrator: CardRegistrator;

  private readonly barcodeParser: BarcodeParser;

  private readonly stateStore: StateStore;

  constructor (
    barcodeParser: BarcodeParser,
    cardRegistrator: CardRegistrator,
    stateStore: StateStore
  ) {
    this.barcodeParser = barcodeParser
    this.cardRegistrator = cardRegistrator
    this.stateStore = stateStore
  }

  handle (customerId: CustomerId, inquiry: Inquiry): Promise<Array<Reaction>> {
    switch (inquiry.type) {
      case 'FREE_TEXT': {
        const freeTextInquiry: FreeTextInquiry = inquiry as FreeTextInquiry
        const cardNumber: Optional<number> = TextExtractions.cardNumber(freeTextInquiry.freeText)
        if (cardNumber.isPresent()) {
          return this.handleCardNumber(customerId, cardNumber.get())
        }
        return Promise.resolve(
          [
            Reactions.choice(
              {
                topImage: Optional.of(StaticImageUrls.HORIZONTAL_LOGO),
                title: StaticTexts.inactiveCustomerWelcome(),
                subtitle: Optional.of(StaticTexts.inactiveCustomerIntentPrompt()),
                choices: [
                  Choices.inquiry(StaticTexts.activateCard(), { type: 'PROMPT_ACTIVATE' }),
                  Choices.phone(StaticTexts.customerService(), '+48662097978')
                ]
              }
            )
          ]
        )
      }
      case 'IMAGE': {
        const imageInquiry: ImageInquiry = inquiry as ImageInquiry
        return this.barcodeParser.parse(imageInquiry.imageUrl).then(
          (cardNumber) => {
            if (!cardNumber.isPresent()) {
              return [Reactions.plainText(StaticTexts.poorBarcodeImage())]
            }
            return this.handleCardNumber(customerId, cardNumber.get())
          }
        )
      }
      case 'PROMPT_ACTIVATE': {
        this.stateStore.slot(customerId, InactiveCustomerAssistant.ASKED_FOR_ACTIVATE).set(true)
        return Promise.resolve([Reactions.plainText(StaticTexts.inputCardNumberPrompt())])
      }
      case 'ACTIVATE': {
        const cardInquiry: CardContextInquiry = inquiry as CardContextInquiry
        return this.cardRegistrator.validateAndRegister(customerId, cardInquiry.cardNumber)
      }
      default: {
        return Promise.resolve([])
      }
    }
  }

  handleCardNumber (customerId: CustomerId, cardNumber: number): Promise<Array<Reaction>> {
    const asked: StateSlot<Boolean> = this.stateStore.slot(customerId, InactiveCustomerAssistant.ASKED_FOR_ACTIVATE)
    asked.defaultTo(false)
    if (asked.get()) {
      return this.cardRegistrator.validateAndRegister(customerId, cardNumber)
    }
    return Promise.resolve(
      [
        Reactions.choice(
          {
            topImage: Optional.empty(),
            title: 'Ooo, to karta Beauty Zazero!',
            subtitle: Optional.of('Chcesz ją aktywować?'),
            choices: [Choices.inquiry(StaticTexts.yes(), { type: 'ACTIVATE', cardNumber })]
          }
        )
      ]
    )
  }
}

export default InactiveCustomerAssistant
