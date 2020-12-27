// currency number format
import NumberFormat from 'react-number-format';

function CurrencyNumberFormat(props) {
  const {inputRef, onChange, ...other} = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      decimalSeparator={','}
      decimalScale={2}
      fixedDecimalScale={2}
      allowLeadingZeros={false}
      allowNegative={false}
      suffix='€'
    />
  );
}

export default CurrencyNumberFormat;