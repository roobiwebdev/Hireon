import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField as ShadcnFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control, FieldValues, Path } from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "file";
}

/**
 * SOURCE OF TRUTH KEYWORDS: FormField, form input, labelled input, validation message, react-hook-form field
 * WHAT:  A labelled text input bound to react-hook-form, with its validation message.
 * WHY:   Uses shadcn's FormField (not a bare Controller) so FormMessage can find the field's
 *        error; with a bare Controller, validation errors never rendered.
 * WHERE: components/AuthForm.tsx.
 */
const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: FormFieldProps<T>) => (
  <ShadcnFormField
    name={name}
    control={control}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="label">{label}</FormLabel>
        <FormControl>
          <Input className="input" placeholder={placeholder} type={type} {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default FormField;
