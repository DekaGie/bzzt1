import { Equal } from 'typeorm'
import { Optional } from 'typescript-optional'
import CustomerId from './domain/CustomerId'
import BzzCustomerAssistant from './BzzCustomerAssistant'
import InteractionCallback from './spi/InteractionCallback'
import BarcodeParser from './BarcodeParser'
import CardRegistrationRepository from '../db/repo/CardRegistrationRepository'
import BzzInactiveCustomerAssistant from './BzzInactiveCustomerAssistant'
import CardRegistrationDbo from '../db/dbo/CardRegistrationDbo'
import BzzActiveCustomerAssistant from './BzzActiveCustomerAssistant'
import FbProfileFetcher from '../fb/FbProfileFetcher'
import ErrorCustomerAssistant from './ErrorCustomerAssistant'
import FbProfile from '../fb/FbProfile'
import CustomerExternalInfo from './CustomerExternalInfo'
import ImageUrl from './domain/ImageUrl'
import Gender from './Gender'

class BzzCustomerCare {
  private readonly profileFetcher: FbProfileFetcher;

  private readonly barcodeParser: BarcodeParser

  private readonly registrationRepository: CardRegistrationRepository;

  constructor (
    profileFetcher: FbProfileFetcher,
    registrationRepository: CardRegistrationRepository,
    barcodeParser: BarcodeParser
  ) {
    this.profileFetcher = profileFetcher
    this.registrationRepository = registrationRepository
    this.barcodeParser = barcodeParser
  }

  assistantFor (
    cid: CustomerId, callback: InteractionCallback
  ): Promise<BzzCustomerAssistant> {
    return this.findRegistration(cid)
      .then(
        (registration) => {
          if (registration.isPresent()) {
            return Promise.resolve(
              new BzzActiveCustomerAssistant(registration.get(), callback)
            )
          }
          return this.profileFetcher.fetch(cid.toRepresentation())
            .then(
              (profile) => {
                if (!profile.isPresent()) {
                  return new ErrorCustomerAssistant(callback)
                }
                return new BzzInactiveCustomerAssistant(
                  this.registrationRepository,
                  this.barcodeParser,
                  BzzCustomerCare.toCustomerInfo(cid, profile.get()),
                  callback
                )
              }
            )
        }
      )
  }

  private findRegistration (cid: CustomerId): Promise<Optional<CardRegistrationDbo>> {
    return this.registrationRepository
      .findOne(
        {
          customerId: Equal(cid.toRepresentation())
        },
        {
          join: CardRegistrationDbo.WITH_CARD
        }
      )
      .then(Optional.ofNullable)
  }

  private static toCustomerInfo (
    cid: CustomerId, profile: FbProfile
  ): CustomerExternalInfo {
    return new CustomerExternalInfo(
      cid,
      profile.firstName,
      profile.lastName,
      Gender.discover(profile.firstName),
      new ImageUrl(profile.pictureUrl)
    )
  }
}

export default BzzCustomerCare
