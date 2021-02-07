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

  deleteIfExists (customerId: string): Promise<boolean> {
    return this.createQueryBuilder()
      .delete()
      .where('customerId = :customerId')
      .setParameters({ customerId })
      .execute()
      .then((deleted) => deleted.affected > 0)
  }
}

export default CardRegistrationRepository
