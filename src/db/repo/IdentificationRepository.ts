import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm'
import IdentificationDbo from '../dbo/IdentificationDbo'
import CardRegistrationDbo from '../dbo/CardRegistrationDbo'

@EntityRepository(IdentificationDbo)
class IdentificationRepository extends Repository<IdentificationDbo> {
  updatePictureUrlByCardNumber (cardNumber: number, pictureUrl: string): Promise<boolean> {
    const actorIdSubquery: SelectQueryBuilder<CardRegistrationDbo> = this.createQueryBuilder()
      .subQuery()
      .select('registration.actorId')
      .from(CardRegistrationDbo, 'registration')
      .innerJoin('registration.card', 'card')
      .where('card.cardNumber = :cardNumber')
    return this.createQueryBuilder()
      .update()
      .set({ pictureUrl })
      .where(`actorId = ${actorIdSubquery.getQuery()}`)
      .setParameters({ cardNumber })
      .execute()
      .then((result) => result.affected > 0)
  }
}

export default IdentificationRepository
