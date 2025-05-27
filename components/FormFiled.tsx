// import {
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "./ui/form";
// import { Input } from "./ui/input";
// import { Control, Controller, FieldValues, Path } from "react-hook-form";
// import { useFormContext } from "react-hook-form";

// interface FormFieldProps<T extends FieldValues> {
//   control: Control<T>;
//   name: Path<T>;
//   label: string;
//   placeholder: string;
//   type: "text" | "email" | "password";
// }

// const FormFiled = ({
//   control,
//   name,
//   label,
//   placeholder,
//   type = "text",
// }: FormFieldProps<T>) => {
//   // const { control } = useFormContext();

//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({ field }) => (
//         <FormItem className="label">
//           <FormLabel>Username</FormLabel>
//           <FormControl>
//             <Input placeholder="shadcn" {...field} />
//           </FormControl>
//           <FormDescription>This is your public display name.</FormDescription>
//           <FormMessage />
//         </FormItem>
//       )}
//     />
//   );
// };

// export default FormFiled;

// FormFiled.tsx
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Controller, Control } from "react-hook-form";

type FormFieldProps = {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  type: "name" | "email" | "password";
};

const FormFiled = ({ control, name, label, placeholder, type }: FormFieldProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input
            className="input"
            placeholder={placeholder}
            {...field}
            type={type}
          />
        </FormControl>

        <FormMessage />
      </FormItem>
    )}
  />
);

export default FormFiled;
