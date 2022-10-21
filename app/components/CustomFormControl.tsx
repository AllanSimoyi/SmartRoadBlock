import type { FormControlProps, FormLabelProps } from "@chakra-ui/form-control";
import { FormControl, FormErrorMessage, FormHelperText, FormLabel } from "@chakra-ui/form-control";

export interface CustomFormControlProps extends FormControlProps {
  label: string
  labelProps?: FormLabelProps
  helperText?: string;
  error?: string;
  children: React.ReactNode;
}

export function CustomFormControl (props: CustomFormControlProps) {
  const { label, labelProps, helperText, error, children, ...formControlProps } = props;
  return (
    <FormControl isInvalid={!!error} {...formControlProps}>
      <FormLabel style={{ width: "100%" }} {...labelProps}>
        {label}
      </FormLabel>
      {children}
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
      {error && (
        <FormErrorMessage>{error}</FormErrorMessage>
      )}
    </FormControl>
  )
}

export default CustomFormControl
