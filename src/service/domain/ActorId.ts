import AnyId from './AnyId'

class ActorId extends AnyId {
  typeName (): string {
    return ActorId.name
  }
}

export default ActorId
