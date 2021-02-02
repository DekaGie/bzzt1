import { EntityRepository, Repository } from 'typeorm'
import IdentificationDbo from '../dbo/IdentificationDbo'

@EntityRepository(IdentificationDbo)
class IdentificationRepository extends Repository<IdentificationDbo> {
}

export default IdentificationRepository
