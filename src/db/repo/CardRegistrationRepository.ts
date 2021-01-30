import { EntityRepository, Repository } from 'typeorm'
import CardRegistrationDbo from '../dbo/CardRegistrationDbo'

@EntityRepository(CardRegistrationDbo)
class CardRegistrationRepository extends Repository<CardRegistrationDbo> {
}

export default CardRegistrationRepository
