'use client'

import { UserButton, SignInButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export function AuthButton() {
  const { isSignedIn, user } = useUser()

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          Welcome, {user.firstName}!
        </span>
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-8 h-8"
            }
          }}
        />
      </div>
    )
  }

  return (
    <SignInButton mode="modal">
      <Button 
        variant="default" 
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        Sign In
      </Button>
    </SignInButton>
  )
}
