import type { InputProps } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useField } from "./ActionContextProvider";
import type { CustomFormControlProps } from "./CustomFormControl";
import CustomFormControl from "./CustomFormControl";

interface Props extends InputProps {
  label: string
  formControlProps?: Omit<CustomFormControlProps, "label" | "children" | "error">
}
export function TextField (props: Props) {
  const { label, formControlProps, name, ...restOfProps } = props;
  const ref = useRef<HTMLInputElement>(null);
  const { value, error } = useField(name!);

  useEffect(() => {
    if (error) {
      ref.current?.scrollIntoView();
    }
  }, [error]);

  return (
    <CustomFormControl
      py={1}
      {...formControlProps}
      label={label}
      error={error?.join(", ")}
      labelProps={{
        ...formControlProps?.labelProps,
        htmlFor: formControlProps?.labelProps?.htmlFor || props.id || props.name,
      }}
    >
      <Input ref={ref} name={name} defaultValue={value} {...restOfProps} />
    </CustomFormControl>
  )
}