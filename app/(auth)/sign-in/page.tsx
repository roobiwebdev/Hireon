import AuthForm from "@/components/AuthForm";
import { googleEnabled } from "@/lib/auth";

const page = () => <AuthForm type="sign-in" googleEnabled={googleEnabled} />;

export default page;
