import { AuthAvailabilityField } from "@/components/AuthAvailabilityField"
import { PasswordRequirementField } from "@/components/PasswordRequirementField"

import { completeGoogleUsernameSetup } from "./actions"

export default function SetupUsernamePage({
  searchParams
}: {
  searchParams: { message?: string }
}) {
  return (
    <div className="flex-1 flex flex-col w-full items-center justify-center font-['Inter']">
      <div className="bg-[#17150F] border border-[#2C2920] p-8 rounded-md w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-[#EDE6DA]">Finish Account</h1>
          <p className="text-sm text-[#C8BCAD] mt-2">
            Pick a public username and password before playing.
          </p>
        </div>

        <form action={completeGoogleUsernameSetup} className="flex flex-col gap-4">
          <AuthAvailabilityField
            name="username"
            label="Username"
            availabilityKind="username"
            unavailableMessage="Username is already taken."
            className="w-full rounded-sm px-4 py-3 bg-black/20 text-[#EDE6DA] border border-[#2C2920] focus:border-[hsl(50,100%,52%)] focus:outline-none transition-colors"
            props={{
              pattern: "[a-zA-Z0-9_]{3,24}",
              title: "Use 3-24 letters, numbers, or underscores."
            }}
          />

          <PasswordRequirementField className="w-full rounded-sm px-4 py-3 bg-black/20 text-[#EDE6DA] border border-[#2C2920] focus:border-[hsl(50,100%,52%)] focus:outline-none transition-colors" />

          <button
            type="submit"
            className="bg-[hsl(50,100%,52%)] hover:bg-[hsl(50,100%,60%)] text-black font-bold py-3 px-8 rounded-sm transition-colors"
          >
            Save Account
          </button>
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
