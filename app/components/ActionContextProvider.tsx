import { createContext, useContext } from "react";

interface Indexable {
  [x: string]: any;
}

interface BaseFieldErrors extends Indexable {
  [x: string]: string[] | undefined;
}

interface ContextProps<Fields extends Indexable, FieldErrors extends BaseFieldErrors> {
  formError?: string
  fields?: Fields
  fieldErrors?: FieldErrors
  isSubmitting?: boolean
}

export const ActionContext = createContext<ContextProps<Indexable, BaseFieldErrors> | undefined>(undefined);

interface Props<Fields extends Indexable, FieldErrors extends BaseFieldErrors> {
  children: React.ReactNode;
  formError?: string
  fields?: Fields
  fieldErrors?: FieldErrors
  isSubmitting?: boolean
}

export function ActionContextProvider
  <Fields extends Indexable, FieldErrors extends BaseFieldErrors>
  (props: Props<Fields, FieldErrors>) {
  const { children, ...restOfProps } = props;
  return (
    <ActionContext.Provider value={restOfProps}>
      {children}
    </ActionContext.Provider>
  )
}

export function useActionContext () {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error(`useCloudinary must be used within a ActionContextProvider`);
  }
  return context;
}

export function useField (name: string) {
  const { fields, fieldErrors } = useActionContext();
  return {
    value: fields?.[name],
    error: fieldErrors?.[name],
  }
}

export function useFormError () {
  const { formError } = useActionContext();
  return formError;
}

export function useIsSubmitting () {
  const { isSubmitting } = useActionContext();
  return isSubmitting;
}