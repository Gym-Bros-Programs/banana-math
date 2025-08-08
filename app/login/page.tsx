import { signIn, signUp } from "@/app/auth/actions"
import { SubmitButton } from "@/app/auth/submit-button"
import { BackButton } from "@/components/BackButton"

const FormField = ({
  name,
  label,
  type = "text",
  placeholder,
  props = {}
}: {
  name: string
  label: string
  type?: string
  placeholder: string
  props?: React.InputHTMLAttributes<HTMLInputElement>
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-zinc-200" htmlFor={name}>
      {label}
    </label>
    <input
      id={name}
      className="w-full rounded-md px-4 py-2 bg-zinc-800 text-white border-0 focus:ring-1 focus:ring-green-500 outline-none"
      name={name}
      type={type}
      placeholder={placeholder}
      required
      {...props}
    />
  </div>
)

const handleSignIn = async (formData: FormData): Promise<void> => {
  "use server"
  await signIn(formData)
}

const handleSignUp = async (formData: FormData): Promise<void> => {
  "use server"
  await signUp(formData)
}

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="flex-1 flex flex-col w-full items-center justify-center relative">
      <BackButton />
      {/* Container with modal-like styling */}
      <div className="bg-zinc-900 p-8 rounded-lg shadow-xl w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sign In Form */}
          <form className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white">Sign In</h2>
            <FormField name="email" label="Email" placeholder="you@example.com" />
            <FormField name="password" label="Password" type="password" placeholder="••••••••" />
            <SubmitButton
              formAction={handleSignIn}
              className="w-full bg-green-800 hover:bg-green-700 rounded-md h-10 text-white font-medium transition-colors"
              pendingText="Signing In..."
            >
              Sign In
            </SubmitButton>
          </form>

          {/* Sign Up Form */}
          <form className="flex flex-col gap-6 border-t md:border-t-0 md:border-l border-zinc-700 pt-8 md:pt-0 md:pl-8">
            <h2 className="text-2xl font-bold text-white">New User Sign Up</h2>
            <FormField name="name" label="Display Name" placeholder="Your Name" />
            <FormField name="email" label="Email" placeholder="you@example.com" />
            <div>
              <FormField
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                props={{
                  pattern:
                    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$",
                  title:
                    "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
                }}
              />
              <ul className="text-xs text-zinc-400 mt-2 list-disc pl-4 space-y-1">
                <li>At least 8 characters long</li>
                <li>Include one lowercase & one uppercase letter</li>
                <li>Include one number</li>
                <li>Include one special character (!@#$%^&*)</li>
              </ul>
            </div>
            <SubmitButton
              formAction={handleSignUp}
              className="w-full bg-orange-800 hover:bg-orange-700 rounded-md h-10 text-white font-medium transition-colors"
              pendingText="Signing Up..."
            >
              Sign Up
            </SubmitButton>
          </form>
        </div>
      </div>

      {searchParams?.message && (
        <p className="mt-4 p-4 bg-input/10 text-text text-center rounded-lg">
          {searchParams.message}
        </p>
      )}
    </div>
  )
}
