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

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

const handleSignIn = async (formData: FormData): Promise<void> => {
  "use server"
  const { signIn } = await import("@/app/auth/actions")
  await signIn(formData)
}

const handleSignUp = async (formData: FormData): Promise<void> => {
  "use server"
  const { signUp } = await import("@/app/auth/actions")
  await signUp(formData)
}

const handleGoogle = async (): Promise<void> => {
  "use server"
  const { signInWithGoogle } = await import("@/app/auth/actions")
  await signInWithGoogle()
}

const handlePasswordReset = async (formData: FormData): Promise<void> => {
  "use server"
  const { requestPasswordReset } = await import("@/app/auth/actions")
  await requestPasswordReset(formData)
}

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  const isGoogleAuthEnabled =
    process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true" &&
    process.env.NEXT_PUBLIC_DISABLE_GOOGLE_AUTH !== "true"

  return (
    <div className="flex-1 flex flex-col w-full items-center justify-center relative">
      <BackButton />
      {/* Container with modal-like styling */}
      <div className="bg-[#17150F] border border-[#2C2920] p-8 rounded-md w-full max-w-4xl font-['Inter'] relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sign In Form */}
          <form className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#EDE6DA]">Sign In</h2>
              <p className="text-sm text-[#C8BCAD] mt-1">Welcome back.</p>
            </div>
            <FormField name="identifier" label="Username or Email" type="text" placeholder="" />
            <FormField name="password" label="Password" type="password" placeholder="" />
            <SubmitButton
              formAction={handleSignIn}
              className="w-full bg-[hsl(50,100%,52%)] hover:bg-[hsl(43,100%,51%)] rounded-sm h-12 text-[#0E0D0B] font-semibold transition-colors mt-2"
              pendingText="Signing In..."
            >
              Sign In
            </SubmitButton>
            <details className="group">
              <summary className="cursor-pointer text-sm text-[#C8BCAD] hover:text-[hsl(50,100%,52%)] transition-colors">
                Forgot password?
              </summary>
              <div className="mt-4 flex flex-col gap-3">
                <FormField
                  name="email"
                  label="Reset Email"
                  type="email"
                  placeholder=""
                  props={{ required: false }}
                />
                <SubmitButton
                  formAction={handlePasswordReset}
                  formNoValidate
                  className="w-full bg-[#211E17] border border-[#2C2920] hover:bg-[#2C2920] rounded-sm h-11 text-[#EDE6DA] font-semibold transition-colors"
                  pendingText="Sending..."
                >
                  Send Reset Link
                </SubmitButton>
              </div>
            </details>

            {isGoogleAuthEnabled && (
              <>
                <div className="flex items-center gap-4 my-1">
                  <div className="h-px bg-[#2C2920] flex-1"></div>
                  <span className="text-xs text-[#5C5750] uppercase tracking-wider font-semibold">
                    Or
                  </span>
                  <div className="h-px bg-[#2C2920] flex-1"></div>
                </div>

                <SubmitButton
                  formAction={handleGoogle}
                  formNoValidate
                  className="w-full bg-[#211E17] border border-[#2C2920] hover:bg-[#2C2920] rounded-sm h-12 text-[#EDE6DA] font-semibold transition-colors flex items-center justify-center gap-3"
                  pendingText="Redirecting..."
                >
                  <GoogleIcon /> Sign In with Google
                </SubmitButton>
              </>
            )}
          </form>

          {/* Sign Up Form */}
          <form className="flex flex-col gap-6 border-t md:border-t-0 md:border-l border-[#2C2920] pt-8 md:pt-0 md:pl-8 relative">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#EDE6DA]">New User</h2>
              <p className="text-sm text-[#C8BCAD] mt-1">Create an account.</p>
            </div>
            <FormField name="username" label="Username" placeholder="" />
            <FormField name="email" label="Email" type="email" placeholder="" />
            <div className="relative group">
              <FormField
                name="password"
                label="Password"
                type="password"
                placeholder=""
                props={{
                  pattern:
                    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$",
                  title:
                    "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
                }}
              />
              {/* Password Hint Popup - appears on focus */}
              <div className="absolute left-full top-0 ml-6 w-64 p-4 bg-[#211E17] border border-[#2C2920] rounded-sm hidden group-focus-within:block z-50 shadow-2xl before:content-[''] before:absolute before:top-4 before:-left-2 before:w-4 before:h-4 before:bg-[#211E17] before:border-l before:border-b before:border-[#2C2920] before:rotate-45">
                <ul className="text-xs text-[#C8BCAD] list-disc pl-4 space-y-1 relative z-10">
                  <li>At least 8 characters long</li>
                  <li>Include one lowercase & one uppercase letter</li>
                  <li>Include one number</li>
                  <li>Include one special character (!@#$%^&*)</li>
                </ul>
              </div>
            </div>
            <SubmitButton
              formAction={handleSignUp}
              className="w-full bg-[#211E17] border border-[#2C2920] hover:bg-[#2C2920] rounded-sm h-12 text-[#EDE6DA] font-semibold transition-colors mt-2"
              pendingText="Signing Up..."
            >
              Sign Up
            </SubmitButton>

            {isGoogleAuthEnabled && (
              <>
                <div className="flex items-center gap-4 my-1">
                  <div className="h-px bg-[#2C2920] flex-1"></div>
                  <span className="text-xs text-[#5C5750] uppercase tracking-wider font-semibold">
                    Or
                  </span>
                  <div className="h-px bg-[#2C2920] flex-1"></div>
                </div>

                <SubmitButton
                  formAction={handleGoogle}
                  formNoValidate
                  className="w-full bg-[#211E17] border border-[#2C2920] hover:bg-[#2C2920] rounded-sm h-12 text-[#EDE6DA] font-semibold transition-colors flex items-center justify-center gap-3"
                  pendingText="Redirecting..."
                >
                  <GoogleIcon /> Sign Up with Google
                </SubmitButton>
              </>
            )}
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
