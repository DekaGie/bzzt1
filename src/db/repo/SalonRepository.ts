import { EntityRepository, Repository } from 'typeorm'
import SalonDbo from '../dbo/SalonDbo'

@EntityRepository(SalonDbo)
class SalonRepository extends Repository<SalonDbo> {
}

export default SalonRepository
