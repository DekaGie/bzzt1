import { EntityRepository, Repository } from 'typeorm'
import TreatmentExecutionDbo from '../dbo/TreatmentExecutionDbo'

@EntityRepository(TreatmentExecutionDbo)
class TreatmentExecutionRepository extends Repository<TreatmentExecutionDbo> {
}

export default TreatmentExecutionRepository
