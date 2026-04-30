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
          <h1 className="text-3xl font-bold tracking-tight text-[#EDE6DA]">Choose Username</h1>
          <p className="text-sm text-[#C8BCAD] mt-2">Pick a public username before playing.</p>
        </div>

        <form action={completeGoogleUsernameSetup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-[#C8BCAD] uppercase tracking-wider"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              pattern="[a-zA-Z0-9_]{3,24}"
              title="Use 3-24 letters, numbers, or underscores."
              className="w-full rounded-sm px-4 py-3 bg-black/20 text-[#EDE6DA] border border-[#2C2920] focus:border-[hsl(50,100%,52%)] focus:outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-[hsl(50,100%,52%)] hover:bg-[hsl(50,100%,60%)] text-black font-bold py-3 px-8 rounded-sm transition-colors"
          >
            Save Username
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
