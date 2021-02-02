import { EntityRepository, Repository } from 'typeorm'
import SalonRegistrationDbo from '../dbo/SalonRegistrationDbo'

@EntityRepository(SalonRegistrationDbo)
class SalonRegistrationRepository extends Repository<SalonRegistrationDbo> {
}

export default SalonRegistrationRepository
