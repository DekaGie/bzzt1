import AnyId from './AnyId'

class CustomerId extends AnyId {
  typeName (): string {
    return CustomerId.name
  }
}

export default CustomerId
