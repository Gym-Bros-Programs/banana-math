import { signIn, signUp } from '@/app/auth/actions';
import { SubmitButton } from '@/app/auth/submit-button';

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder: string;
}

const FormField = ({ name, label, type = 'text', placeholder }: FormFieldProps) => (
  <>
    <label className="text-md" htmlFor={name}>
      {label}
    </label>
    <input
      className="rounded-md px-4 py-2 bg-inherit border mb-6"
      name={name}
      type={type}
      placeholder={placeholder}
      required
    />
  </>
);

// Server action wrappers - marked with "use server"
const handleSignIn = async (formData: FormData): Promise<void> => {
  "use server";
  await signIn(formData);
};

const handleSignUp = async (formData: FormData): Promise<void> => {
  "use server";
  await signUp(formData);
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sign In Form */}
        <form className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
          <h2 className="text-2xl font-bold text-white">Sign In</h2>
          <FormField
            name="email"
            label="Email"
            placeholder="you@example.com"
          />
          <FormField
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
          />
          <SubmitButton
            formAction={handleSignIn}
            className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2"
            pendingText="Signing In..."
          >
            Sign In
          </SubmitButton>
        </form>

        {/* Sign Up Form */}
        <form className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground border-t md:border-t-0 md:border-l border-zinc-700 pt-8 md:pt-0 md:pl-8">
          <h2 className="text-2xl font-bold text-white">Sign Up</h2>
          <FormField
            name="name"
            label="Full Name"
            placeholder="Your Name"
          />
          <FormField
            name="email"
            label="Email"
            placeholder="you@example.com"
          />
          <FormField
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
          />
          <SubmitButton
            formAction={handleSignUp}
            className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
            pendingText="Signing Up..."
          >
            Sign Up
          </SubmitButton>
        </form>
      </div>

      {searchParams?.message && (
        <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
          {searchParams.message}
        </p>
      )}
    </div>
  );
}