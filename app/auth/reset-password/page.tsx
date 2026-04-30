import { SubmitButton } from "@/app/auth/submit-button"
import { BackButton } from "@/components/BackButton"

const handleUpdatePassword = async (formData: FormData): Promise<void> => {
  "use server"
  const { updatePassword } = await import("@/app/auth/actions")
  await updatePassword(formData)
}

export default function ResetPasswordPage({
  searchParams
}: {
  searchParams: { message?: string }
}) {
  return (
    <div className="flex-1 flex flex-col w-full items-center justify-center relative">
      <BackButton />
      <div className="bg-[#17150F] border border-[#2C2920] p-8 rounded-md w-full max-w-md font-['Inter'] relative">
        <form className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#EDE6DA]">Reset Password</h2>
            <p className="text-sm text-[#C8BCAD] mt-1">Choose a new password.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-[#C8BCAD] uppercase tracking-wider"
              htmlFor="password"
            >
              New Password
            </label>
            <input
              id="password"
              className="w-full rounded-sm px-4 py-3 bg-[#17150F] text-[#EDE6DA] border border-[#2C2920] focus:border-[hsl(50,100%,52%)] focus:outline-none transition-colors"
              name="password"
              type="password"
              required
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
              title="Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            />
          </div>

          <SubmitButton
            formAction={handleUpdatePassword}
            className="w-full bg-[hsl(50,100%,52%)] hover:bg-[hsl(43,100%,51%)] rounded-sm h-12 text-[#0E0D0B] font-semibold transition-colors"
            pendingText="Updating..."
          >
            Update Password
          </SubmitButton>
        </form>
      </div>

      {searchParams?.message && (
        <p className="mt-4 p-4 border border-[#2C2920] bg-[#17150F] text-[#EDE6DA] text-sm text-center rounded-sm">
          {searchParams.message}
        </p>
      )}
    </div>
  )
}
