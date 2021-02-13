import Converter from './Converter'

class Converters {
  static construct<I, O> (forward: (I) => O, backward: (O) => I): Converter<I, O> {
    return { forward, backward }
  }

  static inverse<I, O> (converter: Converter<I, O>): Converter<O, I> {
    return {
      forward (input: O): I {
        return converter.backward(input)
      },

      backward (output: I): O {
        return converter.forward(output)
      }
    }
  }
}

export default Converters
