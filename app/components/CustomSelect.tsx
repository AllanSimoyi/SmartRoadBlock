import type { SelectProps } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useField } from "./ActionContextProvider";
import type { CustomFormControlProps } from "./CustomFormControl";
import CustomFormControl from "./CustomFormControl";

interface Props extends SelectProps {
  label: string
  formControlProps?: Omit<CustomFormControlProps, "label" | "children" | "error">
  children: React.ReactNode[]
}

export function CustomSelect (props: Props) {
  const { label, children, name, formControlProps, ...restOfProps } = props;
  const ref = useRef<HTMLSelectElement>(null);
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
      <Select ref={ref} name={name} defaultValue={value} {...restOfProps}>
        {children}
      </Select>
    </CustomFormControl>
  )
}