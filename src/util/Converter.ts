interface Converter<I, O> {

  forward(input: I): O

  backward(output: O): I
}

export default Converter
