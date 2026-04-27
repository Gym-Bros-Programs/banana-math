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
    <label className="text-sm font-medium text-[#C8BCAD] uppercase tracking-wider" htmlFor={name}>
      {label}
    </label>
    <input
      id={name}
      className="w-full rounded-sm px-4 py-3 bg-[#17150F] text-[#EDE6DA] border border-[#2C2920] focus:border-[hsl(50,100%,52%)] focus:outline-none transition-colors"
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
      <div className="bg-[#17150F] border border-[#2C2920] p-8 rounded-md w-full max-w-4xl font-['Inter']">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sign In Form */}
          <form className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#EDE6DA]">Sign In</h2>
              <p className="text-sm text-[#C8BCAD] mt-1">Welcome back.</p>
            </div>
            <FormField name="email" label="Email" placeholder="you@example.com" />
            <FormField name="password" label="Password" type="password" placeholder="••••••••" />
            <SubmitButton
              formAction={handleSignIn}
              className="w-full bg-[hsl(50,100%,52%)] hover:bg-[hsl(43,100%,51%)] rounded-sm h-12 text-[#0E0D0B] font-semibold transition-colors mt-2"
              pendingText="Signing In..."
            >
              Sign In
            </SubmitButton>
          </form>

          {/* Sign Up Form */}
          <form className="flex flex-col gap-6 border-t md:border-t-0 md:border-l border-[#2C2920] pt-8 md:pt-0 md:pl-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#EDE6DA]">New User</h2>
              <p className="text-sm text-[#C8BCAD] mt-1">Create an account.</p>
            </div>
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
              <ul className="text-xs text-[#5C5750] mt-2 list-disc pl-4 space-y-1">
                <li>At least 8 characters long</li>
                <li>Include one lowercase & one uppercase letter</li>
                <li>Include one number</li>
                <li>Include one special character (!@#$%^&*)</li>
              </ul>
            </div>
            <SubmitButton
              formAction={handleSignUp}
              className="w-full bg-[#211E17] border border-[#2C2920] hover:bg-[#2C2920] rounded-sm h-12 text-[#EDE6DA] font-semibold transition-colors mt-2"
              pendingText="Signing Up..."
            >
              Sign Up
            </SubmitButton>
          </form>
        </div>
      </div>

      {searchParams?.message && (
        <p className="mt-4 p-4 border border-[#2C2920] bg-[#17150F] text-[#EDE6DA] text-sm text-center rounded-sm">
          {searchParams.message}
        </p>
      )}
    </div>
  )
}
