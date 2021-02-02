import { EntityRepository, Repository } from 'typeorm'
import CardRegistrationDbo from '../dbo/CardRegistrationDbo'

@EntityRepository(CardRegistrationDbo)
class CardRegistrationRepository extends Repository<CardRegistrationDbo> {
  findFull (customerId: string): Promise<CardRegistrationDbo | undefined> {
    return this.createQueryBuilder('registration')
      .leftJoinAndSelect('registration.card', 'card')
      .leftJoinAndSelect('card.agreement', 'agreement')
      .where('registration.customerId = :customerId')
      .setParameters({ customerId })
      .getOne()
  }
}

export default CardRegistrationRepository
